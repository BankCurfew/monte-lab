import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [labName, setLabName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    supabase.from('monte_patients').select('id, hn, first_name, last_name').order('hn').then(({ data }) => setPatients(data || []));
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') setFile(f);
    else toast.error('กรุณาเลือกไฟล์ PDF เท่านั้น');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f?.type === 'application/pdf') setFile(f);
    else toast.error('กรุณาเลือกไฟล์ PDF เท่านั้น');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedPatient) { toast.error('กรุณาเลือกผู้ป่วยและไฟล์ PDF'); return; }

    setUploading(true);
    const fileName = `${selectedPatient}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('lab-pdfs').upload(fileName, file);
    if (uploadError) { toast.error('อัปโหลดไม่สำเร็จ: ' + uploadError.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from('lab-pdfs').getPublicUrl(fileName);

    const { error: insertError } = await supabase.from('monte_reports').insert({
      patient_id: selectedPatient,
      test_date: testDate,
      lab_name: labName || null,
      raw_pdf_url: urlData.publicUrl,
      created_by: user?.id,
      source: 'upload',
    });

    if (insertError) { toast.error('บันทึกไม่สำเร็จ: ' + insertError.message); setUploading(false); return; }

    toast.success('อัปโหลดสำเร็จ — กำลังประมวลผล');
    navigate('/reports');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">อัปโหลดผลตรวจเลือด</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ผู้ป่วย *</label>
          <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} required
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00868A]">
            <option value="">เลือกผู้ป่วย</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.hn} — {p.first_name} {p.last_name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ตรวจ *</label>
            <input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} required
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00868A]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ห้อง LAB</label>
            <input value={labName} onChange={e => setLabName(e.target.value)} placeholder="เช่น Bangkok R.I.A Lab"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00868A]" />
          </div>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-[#00868A] bg-[#00868A]/5' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-[#00868A]" />
              <div className="text-left">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button type="button" onClick={() => setFile(null)} className="text-red-500 text-xs ml-4">ลบ</button>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">ลากไฟล์ PDF มาวางที่นี่</p>
              <p className="text-xs text-gray-400 mt-1">หรือ</p>
              <label className="inline-block mt-2 px-4 py-2 bg-[#00868A] text-white rounded-md text-sm cursor-pointer hover:bg-[#006d70]">
                เลือกไฟล์
                <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
              </label>
            </>
          )}
        </div>

        <button type="submit" disabled={uploading || !file || !selectedPatient}
          className="w-full py-3 bg-[#00868A] text-white rounded-md hover:bg-[#006d70] disabled:opacity-50 font-medium">
          {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดและประมวลผล'}
        </button>
      </form>
    </div>
  );
}
