import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Image } from 'lucide-react';
import { toast } from 'sonner';

interface SignatureUploadProps {
  doctorId: string;
  currentUrl: string | null;
  onUpdated: (url: string) => void;
}

export function SignatureUpload({ doctorId, currentUrl, onUpdated }: SignatureUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('กรุณาเลือกไฟล์รูปภาพ'); return; }

    setUploading(true);
    const fileName = `${doctorId}/${Date.now()}_signature.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('signatures').upload(fileName, file, { upsert: true });
    if (uploadError) { toast.error('อัปโหลดไม่สำเร็จ'); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from('signatures').getPublicUrl(fileName);
    const { error: updateError } = await supabase
      .from('monte_doctors')
      .update({ signature_url: urlData.publicUrl })
      .eq('id', doctorId);

    if (updateError) { toast.error('บันทึกไม่สำเร็จ'); }
    else { toast.success('อัปโหลดลายเซ็นแล้ว'); onUpdated(urlData.publicUrl); }
    setUploading(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">ลายเซ็นแพทย์</label>
      {currentUrl ? (
        <div className="border rounded-lg p-4 bg-gray-50">
          <img src={currentUrl} alt="Doctor signature" className="h-16 object-contain" />
          <p className="text-xs text-gray-400 mt-2">ลายเซ็นปัจจุบัน</p>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-400">
          <Image className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">ยังไม่มีลายเซ็น</p>
        </div>
      )}
      <label className={`inline-flex items-center gap-2 px-4 py-2 bg-[#00868A] text-white rounded-md text-sm cursor-pointer hover:bg-[#006d70] ${uploading ? 'opacity-50' : ''}`}>
        <Upload className="h-4 w-4" />
        {uploading ? 'กำลังอัปโหลด...' : currentUrl ? 'เปลี่ยนลายเซ็น' : 'อัปโหลดลายเซ็น'}
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
      </label>
    </div>
  );
}
