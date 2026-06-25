import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, FileText, X, Eye, Sparkles, Loader2 } from 'lucide-react';
import { extractTextFromPdf } from '@/lib/pdf-reader';
import { toast } from 'sonner';

interface PdfFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'previewing' | 'error';
  preview?: ParsedPreview;
  error?: string;
  storageUrl?: string;
  reportId?: string;
}

interface ParsedPreview {
  patientName: string | null;
  hn: string | null;
  testDate: string | null;
  labName: string | null;
  testCount: number;
  rawText: string;
  detectedTests: string[];
}

// Extract info from PDF text — supports Bangkok R.I.A Lab format
function extractPreview(text: string): ParsedPreview {
  // HN patterns
  const hnMatch = text.match(/HN[:\s]*([0-9]+-[0-9]+)/i) ||
    text.match(/HN BRIA[:\s]*([0-9]+)/i);

  // Patient name — try multiple patterns
  const nameMatch = text.match(/Name[:\s]*([A-Za-zก-๙\s]+?)(?:\s*HN|\s*Age|\n)/i) ||
    text.match(/ชื่อ[:\s]*([^\n\r]+)/i) ||
    text.match(/Patient[:\s]*([^\n\r]+)/i);

  // Date — Collection Date or วันที่
  const dateMatch = text.match(/Collection Date\/Time[:\s]*([0-9-]+)/i) ||
    text.match(/วันที่[:\s]*([0-9/.-]+)/i) ||
    text.match(/Date[:\s]*([0-9/.-]+\s*[A-Za-z]*\s*[0-9]*)/i);

  // Lab name
  const labMatch = text.match(/(Bangkok R\.I\.A\s*(?:LAB)?|BANGKOK R\.I\.A)/i) ||
    text.match(/(BNH|Bumrungrad|รามาธิบดี|ศิริราช|จุฬา|N Health|โรงพยาบาล[^\n,]+)/i) ||
    text.match(/Hospital\/Clinic[:\s]*([^\n]+)/i);

  // Age + Sex
  const ageMatch = text.match(/Age[:\s]*(\d+)\s*Y/i);
  const sexMatch = text.match(/Sex[:\s]*(Male|Female|ชาย|หญิง)/i);

  // These are available for future use in Edge Function
  void text.match(/HN BRIA[:\s]*(\d+)/i);
  void text.match(/Reported by\s*:\s*([^\n(]+)/i);
  void text.match(/Approved by\s*:\s*([^\n(]+)/i);

  // Test detection — comprehensive
  const testPatterns = [
    'WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'Platelet', 'MCV', 'MCH', 'MCHC', 'RDW',
    'FBS', 'BUN', 'Creatinine', 'Cholesterol', 'HDL', 'LDL', 'Triglyceride',
    'AST', 'ALT', 'ALP', 'TSH', 'Free T3', 'Free T4',
    'Testosterone', 'DHEA', 'Vitamin D', 'Vitamin B12', 'Ferritin', 'Iron', 'Zinc',
    'Estradiol', 'Prolactin', 'HbA1c', 'Uric Acid', 'ANA',
    'Anisocytosis', 'Microcyte', 'Macrocyte', 'Hypochromia',
    'PMN Neutrophil', 'Lymphocyte', 'Monocyte', 'Eosinophil', 'Basophil'
  ];

  const detectedTests = testPatterns.filter(t =>
    text.toLowerCase().includes(t.toLowerCase())
  );

  // Build display name with age/sex if available
  let displayName = nameMatch?.[1]?.trim() || null;
  if (displayName && (ageMatch || sexMatch)) {
    const parts = [];
    if (ageMatch) parts.push(`${ageMatch[1]} ปี`);
    if (sexMatch) parts.push(sexMatch[1]);
    displayName = `${displayName} (${parts.join(', ')})`;
  }

  return {
    patientName: displayName,
    hn: hnMatch?.[1]?.trim() || null,
    testDate: dateMatch?.[1]?.trim() || null,
    labName: labMatch?.[1]?.trim() || null,
    testCount: detectedTests.length,
    rawText: text.substring(0, 500),
    detectedTests,
  };
}

export default function UploadReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const addFiles = (newFiles: FileList | File[]) => {
    const pdfs = Array.from(newFiles)
      .filter(f => f.type === 'application/pdf')
      .map(f => ({
        file: f,
        id: crypto.randomUUID(),
        status: 'pending' as const,
      }));

    if (pdfs.length === 0) {
      toast.error('กรุณาเลือกไฟล์ PDF เท่านั้น');
      return;
    }

    setFiles(prev => [...prev, ...pdfs]);

    // Auto-preview each file
    pdfs.forEach(async (pdf) => {
      try {
        setFiles(prev => prev.map(f => f.id === pdf.id ? { ...f, status: 'previewing' } : f));
        const text = await extractTextFromPdf(pdf.file);
        const preview = extractPreview(text);
        setFiles(prev => prev.map(f => f.id === pdf.id ? { ...f, status: 'pending', preview } : f));
      } catch {
        setFiles(prev => prev.map(f => f.id === pdf.id ? { ...f, status: 'pending', preview: { patientName: null, hn: null, testDate: null, labName: null, testCount: 0, rawText: '', detectedTests: [] } } : f));
      }
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const uploadAll = async () => {
    for (const pdf of files) {
      if (pdf.status === 'uploaded') continue;

      setFiles(prev => prev.map(f => f.id === pdf.id ? { ...f, status: 'uploading' } : f));

      try {
        // Upload to storage — sanitize filename (no Thai/brackets/spaces)
        const safeName = pdf.file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/__+/g, '_');
        const fileName = `uploads/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage.from('lab-pdfs').upload(fileName, pdf.file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('lab-pdfs').getPublicUrl(fileName);

        // Create or find patient
        let patientId: string | null = null;
        if (pdf.preview?.hn) {
          const { data: existing } = await supabase
            .from('monte_patients')
            .select('id')
            .eq('hn', pdf.preview.hn)
            .single();

          if (existing) {
            patientId = existing.id;
          } else {
            const nameParts = (pdf.preview.patientName || 'Unknown Patient').split(' ');
            const { data: newPatient } = await supabase
              .from('monte_patients')
              .insert({
                hn: pdf.preview.hn,
                first_name: nameParts[0] || 'Unknown',
                last_name: nameParts.slice(1).join(' ') || '-',
              })
              .select('id')
              .single();
            patientId = newPatient?.id || null;
          }
        }

        if (!patientId) {
          // Create with auto HN
          const autoHn = `AUTO-${Date.now().toString(36).toUpperCase()}`;
          const nameParts = (pdf.preview?.patientName || 'Unknown').split(' ');
          const { data: newPatient } = await supabase
            .from('monte_patients')
            .insert({
              hn: autoHn,
              first_name: nameParts[0] || 'Unknown',
              last_name: nameParts.slice(1).join(' ') || '-',
            })
            .select('id')
            .single();
          patientId = newPatient?.id || null;
        }

        if (!patientId) throw new Error('ไม่สามารถสร้างข้อมูลผู้ป่วย');

        // Create report
        const { data: report, error: insertError } = await supabase
          .from('monte_reports')
          .insert({
            patient_id: patientId,
            test_date: pdf.preview?.testDate || new Date().toISOString().slice(0, 10),
            lab_name: pdf.preview?.labName || null,
            raw_pdf_url: urlData.publicUrl,
            created_by: user?.id,
            source: 'upload',
          })
          .select('id')
          .single();
        if (insertError) throw insertError;

        setFiles(prev => prev.map(f => f.id === pdf.id ? { ...f, status: 'uploaded', storageUrl: urlData.publicUrl, reportId: report?.id } : f));
      } catch (err: any) {
        setFiles(prev => prev.map(f => f.id === pdf.id ? { ...f, status: 'error', error: err.message } : f));
      }
    }

    const uploaded = files.filter(f => f.status !== 'error').length;
    if (uploaded > 0) {
      toast.success(`อัปโหลด ${uploaded} ไฟล์สำเร็จ`);
    }
  };

  const analyzeAll = async () => {
    toast.info('กำลังวิเคราะห์ผลเลือด...');

    for (const pdf of files) {
      if (!pdf.reportId || !pdf.preview) continue;

      // Build parsed values from detected tests in the PDF text
      const fullText = await extractTextFromPdf(pdf.file);
      const parsedValues: Record<string, Record<string, any>> = {};
      const flags: any[] = [];

      const ranges: Record<string, { min: number; max: number; unit: string; group: string }> = {
        wbc: { min: 4500, max: 11000, unit: "/mm³", group: "cbc" },
        rbc: { min: 4.0, max: 5.5, unit: "M/mm³", group: "cbc" },
        hb: { min: 12.0, max: 16.0, unit: "g/dL", group: "cbc" },
        hct: { min: 36, max: 47, unit: "%", group: "cbc" },
        plt: { min: 150, max: 400, unit: "x10³/µL", group: "cbc" },
        mcv: { min: 80, max: 100, unit: "fL", group: "cbc" },
        mch: { min: 27, max: 33, unit: "pg", group: "cbc" },
        mchc: { min: 32, max: 36, unit: "g/dL", group: "cbc" },
        ferritin: { min: 20, max: 250, unit: "ng/mL", group: "vitamins" },
        vitamin_d: { min: 30, max: 100, unit: "ng/mL", group: "vitamins" },
        tsh: { min: 0.27, max: 4.2, unit: "mIU/L", group: "thyroid" },
        dheas: { min: 80, max: 560, unit: "µg/dL", group: "hormones" },
        testosterone: { min: 13.84, max: 53.35, unit: "ng/dL", group: "hormones" },
      };

      const patterns: Record<string, RegExp> = {
        wbc: /WBC[^0-9]*([0-9,.]+)/i,
        rbc: /RBC[^0-9]*([0-9,.]+)/i,
        hb: /(?:Hemoglobin|Hb|HGB)[^0-9]*([0-9,.]+)/i,
        hct: /(?:Hematocrit|Hct|HCT)[^0-9]*([0-9,.]+)/i,
        plt: /(?:Platelet)[^0-9]*([0-9,.]+)/i,
        mcv: /MCV[^0-9]*([0-9,.]+)/i,
        mch: /MCH\b[^0-9C]*([0-9,.]+)/i,
        mchc: /MCHC[^0-9]*([0-9,.]+)/i,
        ferritin: /Ferritin[^0-9]*([0-9,.]+)/i,
        vitamin_d: /(?:Vitamin\s*D|25.*Hydroxy)[^0-9]*([0-9,.]+)/i,
        tsh: /TSH[^0-9]*([0-9,.]+)/i,
        dheas: /DHEA[^0-9]*([0-9,.]+)/i,
        testosterone: /Testosterone[^0-9]*([0-9,.]+)/i,
      };

      for (const [key, pattern] of Object.entries(patterns)) {
        const match = fullText.match(pattern);
        if (match) {
          const value = parseFloat(match[1].replace(",", ""));
          const ref = ranges[key];
          if (!ref || isNaN(value)) continue;
          const flag = value < ref.min ? "low" : value > ref.max ? "high" : null;
          const group = ref.group;
          if (!parsedValues[group]) parsedValues[group] = {};
          parsedValues[group][key] = { value, unit: ref.unit, ref_min: ref.min, ref_max: ref.max, flag };
          if (flag) flags.push({ test: key, value, severity: flag, note: `${flag === "low" ? "ต่ำ" : "สูง"}กว่าค่าปกติ` });
        }
      }

      // Update report with parsed values
      await supabase
        .from('monte_reports')
        .update({
          parsed_values: parsedValues,
          flags,
          status: Object.keys(parsedValues).length > 0 ? 'ready' : 'pending',
          lab_name: pdf.preview.labName || null,
        })
        .eq('id', pdf.reportId);
    }

    toast.success('วิเคราะห์เสร็จสิ้น');
    navigate('/reports');
  };

  const allUploaded = files.length > 0 && files.every(f => f.status === 'uploaded');
  const hasFiles = files.length > 0;
  const uploading = files.some(f => f.status === 'uploading');

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl lg:text-2xl font-bold text-[#1A2B3C] mb-6">อัปโหลดผลตรวจเลือด</h2>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all mb-6 ${
          dragActive ? 'border-[#00868A] bg-[#E0F5F5]' : 'border-[#E2E8F0] hover:border-[#00868A]/50 bg-white'
        }`}
      >
        <Upload className="h-10 w-10 text-[#94A3B8] mx-auto mb-3" />
        <p className="text-sm text-[#5A6B7C]">ลากไฟล์ PDF มาวางที่นี่ (หลายไฟล์ได้)</p>
        <p className="text-xs text-[#94A3B8] mt-1">ระบบจะอ่านข้อมูลจาก PDF อัตโนมัติ</p>
        <label className="inline-block mt-3 px-5 py-2.5 bg-[#00868A] text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-[#006B6E] shadow-sm">
          เลือกไฟล์
          <input type="file" accept=".pdf" multiple onChange={e => e.target.files && addFiles(e.target.files)} className="hidden" />
        </label>
      </div>

      {/* File list with previews */}
      {hasFiles && (
        <div className="space-y-4 mb-6">
          {files.map(pdf => (
            <div key={pdf.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
              pdf.status === 'error' ? 'border-red-300' : pdf.status === 'uploaded' ? 'border-emerald-300' : 'border-[#E2E8F0]'
            }`}>
              {/* File header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <FileText className={`h-5 w-5 flex-shrink-0 ${
                    pdf.status === 'uploaded' ? 'text-emerald-600' : pdf.status === 'error' ? 'text-red-500' : 'text-[#006B6E]'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-[#1A2B3C] truncate max-w-xs">{pdf.file.name}</p>
                    <p className="text-xs text-[#94A3B8]">{(pdf.file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pdf.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-[#00868A]" />}
                  {pdf.status === 'uploaded' && <span className="text-xs text-emerald-600 font-medium">✓ อัปโหลดแล้ว</span>}
                  {pdf.status === 'error' && <span className="text-xs text-red-500">{pdf.error}</span>}
                  {pdf.status === 'previewing' && <Loader2 className="h-4 w-4 animate-spin text-[#94A3B8]" />}
                  <button onClick={() => removeFile(pdf.id)} className="p-1 hover:bg-red-50 rounded">
                    <X className="h-4 w-4 text-[#94A3B8] hover:text-red-500" />
                  </button>
                </div>
              </div>

              {/* Preview data extracted from PDF */}
              {pdf.preview && (
                <div className="px-4 py-3 bg-[#F8FAFB]">
                  <div className="flex items-center gap-1 mb-2">
                    <Eye className="h-3.5 w-3.5 text-[#006B6E]" />
                    <span className="text-xs font-medium text-[#006B6E]">ข้อมูลที่อ่านได้จาก PDF</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div className="flex gap-2">
                      <span className="text-[#94A3B8] text-xs">HN:</span>
                      <span className="text-[#1A2B3C] text-xs font-medium">{pdf.preview.hn || 'ไม่พบ (จะสร้างอัตโนมัติ)'}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[#94A3B8] text-xs">ชื่อ:</span>
                      <span className="text-[#1A2B3C] text-xs font-medium">{pdf.preview.patientName || 'ไม่พบ'}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[#94A3B8] text-xs">วันที่:</span>
                      <span className="text-[#1A2B3C] text-xs font-medium">{pdf.preview.testDate || 'ไม่พบ'}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[#94A3B8] text-xs">LAB:</span>
                      <span className="text-[#1A2B3C] text-xs font-medium">{pdf.preview.labName || 'ไม่พบ'}</span>
                    </div>
                  </div>
                  {pdf.preview.detectedTests.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-[#94A3B8]">ตรวจพบ {pdf.preview.detectedTests.length} รายการ: </span>
                      <span className="text-xs text-[#006B6E]">{pdf.preview.detectedTests.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {hasFiles && (
        <div className="flex gap-3">
          {!allUploaded ? (
            <button
              onClick={uploadAll}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00868A] text-white rounded-xl font-medium hover:bg-[#006B6E] disabled:opacity-50 shadow-sm"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'กำลังอัปโหลด...' : `อัปโหลด ${files.filter(f => f.status !== 'uploaded').length} ไฟล์`}
            </button>
          ) : (
            <button
              onClick={analyzeAll}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              วิเคราะห์ผลเลือดทั้งหมด ({files.length} ไฟล์)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
