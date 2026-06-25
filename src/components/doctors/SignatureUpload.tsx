import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Image, PenTool, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SignatureUploadProps {
  doctorId: string;
  currentUrl: string | null;
  onUpdated: (url: string) => void;
}

export function SignatureUpload({ doctorId, currentUrl, onUpdated }: SignatureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showPad, setShowPad] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!showPad || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [showPad]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = getPos(e);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d')!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current = pos;
  };

  const stopDraw = () => { isDrawingRef.current = false; };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveSignature = async () => {
    if (!canvasRef.current) return;
    setUploading(true);

    canvasRef.current.toBlob(async (blob) => {
      if (!blob) { toast.error('ไม่สามารถบันทึกลายเซ็น'); setUploading(false); return; }

      const fileName = `${doctorId}/${Date.now()}_signature.png`;
      const { error: uploadError } = await supabase.storage.from('signatures').upload(fileName, blob, { contentType: 'image/png', upsert: true });
      if (uploadError) { toast.error('อัปโหลดไม่สำเร็จ'); setUploading(false); return; }

      const { data: urlData } = supabase.storage.from('signatures').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('monte_doctors').update({ signature_url: urlData.publicUrl }).eq('id', doctorId);

      if (updateError) toast.error('บันทึกไม่สำเร็จ');
      else { toast.success('บันทึกลายเซ็นแล้ว'); onUpdated(urlData.publicUrl); setShowPad(false); }
      setUploading(false);
    }, 'image/png');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('กรุณาเลือกไฟล์รูปภาพ'); return; }

    setUploading(true);
    const fileName = `${doctorId}/${Date.now()}_signature.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('signatures').upload(fileName, file, { upsert: true });
    if (uploadError) { toast.error('อัปโหลดไม่สำเร็จ'); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from('signatures').getPublicUrl(fileName);
    const { error: updateError } = await supabase.from('monte_doctors').update({ signature_url: urlData.publicUrl }).eq('id', doctorId);

    if (updateError) toast.error('บันทึกไม่สำเร็จ');
    else { toast.success('อัปโหลดลายเซ็นแล้ว'); onUpdated(urlData.publicUrl); }
    setUploading(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">ลายเซ็นแพทย์</label>

      {currentUrl && !showPad ? (
        <div className="border rounded-lg p-4 bg-gray-50">
          <img src={currentUrl} alt="Doctor signature" className="h-16 object-contain" />
          <p className="text-xs text-gray-400 mt-2">ลายเซ็นปัจจุบัน</p>
        </div>
      ) : !showPad ? (
        <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-400">
          <Image className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">ยังไม่มีลายเซ็น</p>
        </div>
      ) : null}

      {showPad && (
        <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
          <p className="text-sm text-[#5A6B7C]">เซ็นชื่อด้านล่าง (ใช้นิ้วหรือเมาส์วาด)</p>
          <canvas
            ref={canvasRef}
            width={500}
            height={160}
            className="w-full border border-gray-300 rounded-lg bg-white cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          <div className="flex gap-2">
            <button onClick={clearCanvas} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-100">
              <Trash2 className="h-4 w-4" /> ล้าง
            </button>
            <button onClick={saveSignature} disabled={uploading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#00868A] text-white rounded-lg hover:bg-[#006B6E] disabled:opacity-50">
              {uploading ? 'กำลังบันทึก...' : 'บันทึกลายเซ็น'}
            </button>
            <button onClick={() => setShowPad(false)} className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600">ยกเลิก</button>
          </div>
        </div>
      )}

      {!showPad && (
        <div className="flex gap-2">
          <button onClick={() => setShowPad(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00868A] text-white rounded-lg text-sm hover:bg-[#006B6E]">
            <PenTool className="h-4 w-4" />
            {currentUrl ? 'เซ็นใหม่' : 'เซ็นที่หน้าจอ'}
          </button>
          <label className={`inline-flex items-center gap-2 px-4 py-2 border border-[#00868A] text-[#006B6E] rounded-lg text-sm cursor-pointer hover:bg-[#E0F5F5] ${uploading ? 'opacity-50' : ''}`}>
            <Upload className="h-4 w-4" />
            อัปโหลดรูป
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      )}
    </div>
  );
}
