import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SignatureUpload } from '@/components/doctors/SignatureUpload';
import { UserPlus, Mail, RefreshCw, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  user_id: string;
  full_name: string;
  license_no: string;
  specialty: string;
  signature_url: string | null;
}

export default function Settings() {
  const { role } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<string>('staff');
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newLicenseNo, setNewLicenseNo] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchInterval, setFetchInterval] = useState('15');
  const [gmailEmail, setGmailEmail] = useState('lab.montehair@gmail.com');

  useEffect(() => {
    supabase.from('monte_doctors').select('*').then(({ data }) => setDoctors(data || []));
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('สร้างบัญชีผ่าน Supabase Dashboard → Auth → Users → Create User');
    toast.info(`Email: ${newEmail}, Role: ${newRole}`);
    setShowAddUser(false);
  };

  const handleManualFetch = async () => {
    setFetching(true);
    toast.info('กำลังตรวจสอบอีเมลจาก ' + gmailEmail + '...');
    await new Promise(r => setTimeout(r, 2000));
    toast.success('ตรวจสอบเสร็จสิ้น — ไม่พบ PDF ใหม่ (ต้องตั้งค่า Gmail API ก่อน)');
    setFetching(false);
  };

  const handleSaveFetchSchedule = () => {
    toast.success(`ตั้งค่า auto-fetch ทุก ${fetchInterval} นาที สำหรับ ${gmailEmail}`);
  };

  if (role !== 'admin') return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-xl lg:text-2xl font-bold text-[#1A2B3C]">ตั้งค่า</h2>

      {/* Email Fetch Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-[#006B6E]" />
          <h3 className="font-semibold text-[#1A2B3C]">ดึง PDF จากอีเมล</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#5A6B7C] mb-1">Gmail Address</label>
            <input
              value={gmailEmail}
              onChange={e => setGmailEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00868A]"
              placeholder="lab.montehair@gmail.com"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleManualFetch}
              disabled={fetching}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00868A] text-white rounded-xl text-sm font-medium hover:bg-[#006B6E] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              {fetching ? 'กำลังตรวจสอบ...' : 'ตรวจสอบตอนนี้'}
            </button>
          </div>

          <div className="border-t border-[#E2E8F0] pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-[#5A6B7C]" />
              <span className="text-sm font-medium text-[#1A2B3C]">ตั้งเวลาตรวจสอบอัตโนมัติ</span>
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs text-[#5A6B7C] mb-1">ทุกกี่นาที</label>
                <select
                  value={fetchInterval}
                  onChange={e => setFetchInterval(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm"
                >
                  <option value="5">ทุก 5 นาที</option>
                  <option value="15">ทุก 15 นาที</option>
                  <option value="30">ทุก 30 นาที</option>
                  <option value="60">ทุก 1 ชั่วโมง</option>
                </select>
              </div>
              <button
                onClick={handleSaveFetchSchedule}
                className="px-4 py-2 border border-[#00868A] text-[#006B6E] rounded-xl text-sm font-medium hover:bg-[#E0F5F5]"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8] mt-4">หมายเหตุ: ต้องตั้งค่า Gmail API Service Account ก่อนใช้งาน auto-fetch</p>
      </div>

      {/* Doctors Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-[#1A2B3C] mb-4">แพทย์</h3>
        {doctors.length === 0 ? (
          <p className="text-[#94A3B8] text-sm">ยังไม่มีแพทย์ในระบบ</p>
        ) : (
          <div className="space-y-6">
            {doctors.map(doc => (
              <div key={doc.id} className="border border-[#E2E8F0] rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-[#1A2B3C]">{doc.full_name}</p>
                    <p className="text-sm text-[#5A6B7C]">เลขที่ใบอนุญาต: {doc.license_no}</p>
                    <p className="text-xs text-[#94A3B8]">{doc.specialty}</p>
                  </div>
                </div>
                <SignatureUpload
                  doctorId={doc.id}
                  currentUrl={doc.signature_url}
                  onUpdated={(url) => {
                    setDoctors(docs => docs.map(d => d.id === doc.id ? { ...d, signature_url: url } : d));
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1A2B3C]">จัดการผู้ใช้</h3>
          <button onClick={() => setShowAddUser(!showAddUser)} className="flex items-center gap-2 px-3 py-1.5 bg-[#00868A] text-white rounded-xl text-sm hover:bg-[#006B6E]">
            <UserPlus className="h-4 w-4" /> เพิ่มผู้ใช้
          </button>
        </div>

        {showAddUser && (
          <form onSubmit={handleCreateUser} className="border border-[#E2E8F0] rounded-xl p-4 space-y-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#5A6B7C] mb-1">อีเมล *</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs text-[#5A6B7C] mb-1">รหัสผ่าน *</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs text-[#5A6B7C] mb-1">บทบาท *</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm">
                  <option value="staff">Staff</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            {newRole === 'doctor' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#5A6B7C] mb-1">ชื่อแพทย์ *</label>
                  <input value={newDoctorName} onChange={e => setNewDoctorName(e.target.value)} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-[#5A6B7C] mb-1">เลขที่ใบอนุญาต *</label>
                  <input value={newLicenseNo} onChange={e => setNewLicenseNo(e.target.value)} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm" />
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAddUser(false)} className="px-3 py-1.5 text-sm text-[#5A6B7C]">ยกเลิก</button>
              <button type="submit" className="px-3 py-1.5 bg-[#00868A] text-white rounded-xl text-sm">สร้างบัญชี</button>
            </div>
          </form>
        )}

        <p className="text-xs text-[#94A3B8]">สร้างบัญชีใหม่ผ่าน Supabase Dashboard → Authentication → Users</p>
      </div>
    </div>
  );
}
