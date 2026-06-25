import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SignatureUpload } from '@/components/doctors/SignatureUpload';
import { UserPlus } from 'lucide-react';
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

  useEffect(() => {
    supabase.from('monte_doctors').select('*').then(({ data }) => setDoctors(data || []));
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('การสร้างบัญชีต้องทำผ่าน Supabase Dashboard (Auth → Users → Create User)');
    toast.info(`Email: ${newEmail}, Role: ${newRole}`);
    setShowAddUser(false);
  };

  if (role !== 'admin') return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">ตั้งค่า</h2>

      {/* Doctors Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-4">แพทย์</h3>
        {doctors.length === 0 ? (
          <p className="text-gray-400 text-sm">ยังไม่มีแพทย์ในระบบ</p>
        ) : (
          <div className="space-y-6">
            {doctors.map(doc => (
              <div key={doc.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-800">{doc.full_name}</p>
                    <p className="text-sm text-gray-500">เลขที่ใบอนุญาต: {doc.license_no}</p>
                    <p className="text-xs text-gray-400">{doc.specialty}</p>
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">จัดการผู้ใช้</h3>
          <button onClick={() => setShowAddUser(!showAddUser)} className="flex items-center gap-2 px-3 py-1.5 bg-[#00868A] text-white rounded-md text-sm hover:bg-[#006d70]">
            <UserPlus className="h-4 w-4" /> เพิ่มผู้ใช้
          </button>
        </div>

        {showAddUser && (
          <form onSubmit={handleCreateUser} className="border rounded-lg p-4 space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">อีเมล *</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">รหัสผ่าน *</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">บทบาท *</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm">
                  <option value="staff">Staff</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            {newRole === 'doctor' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">ชื่อแพทย์ *</label>
                  <input value={newDoctorName} onChange={e => setNewDoctorName(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">เลขที่ใบอนุญาต *</label>
                  <input value={newLicenseNo} onChange={e => setNewLicenseNo(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAddUser(false)} className="px-3 py-1.5 text-sm text-gray-500">ยกเลิก</button>
              <button type="submit" className="px-3 py-1.5 bg-[#00868A] text-white rounded-md text-sm">สร้างบัญชี</button>
            </div>
          </form>
        )}

        <p className="text-xs text-gray-400">หมายเหตุ: สร้างบัญชีใหม่ผ่าน Supabase Dashboard → Authentication → Users → Create User แล้วเพิ่ม role ใน monte_app_roles table</p>
      </div>
    </div>
  );
}
