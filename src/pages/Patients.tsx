import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
  id: string;
  hn: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ hn: '', first_name: '', last_name: '', date_of_birth: '', gender: '', phone: '', email: '', notes: '' });

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('monte_patients')
      .select('*')
      .order('created_at', { ascending: false });
    setPatients(data || []);
  };

  useEffect(() => { fetchPatients(); }, []);

  const filtered = patients.filter(p =>
    p.hn.toLowerCase().includes(search.toLowerCase()) ||
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ hn: '', first_name: '', last_name: '', date_of_birth: '', gender: '', phone: '', email: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, date_of_birth: form.date_of_birth || null, gender: form.gender || null, phone: form.phone || null, email: form.email || null, notes: form.notes || null };

    if (editingId) {
      const { error } = await supabase.from('monte_patients').update(payload).eq('id', editingId);
      if (error) { toast.error(error.message); return; }
      toast.success('อัพเดทข้อมูลผู้ป่วยแล้ว');
    } else {
      const { error } = await supabase.from('monte_patients').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('เพิ่มผู้ป่วยแล้ว');
    }
    resetForm();
    fetchPatients();
  };

  const handleEdit = (p: Patient) => {
    setForm({ hn: p.hn, first_name: p.first_name, last_name: p.last_name, date_of_birth: p.date_of_birth || '', gender: p.gender || '', phone: p.phone || '', email: p.email || '', notes: p.notes || '' });
    setEditingId(p.id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ผู้ป่วย</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#00868A] text-white rounded-md hover:bg-[#006d70] text-sm">
          <Plus className="h-4 w-4" /> เพิ่มผู้ป่วย
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหา HN หรือชื่อ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00868A]"
        />
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">{editingId ? 'แก้ไขผู้ป่วย' : 'เพิ่มผู้ป่วยใหม่'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">HN *</label>
              <input value={form.hn} onChange={e => setForm({ ...form, hn: e.target.value })} required className="w-full px-3 py-2 border rounded-md text-sm" placeholder="เช่น 69-0181" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">เพศ</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm">
                <option value="">เลือก</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">ชื่อ *</label>
              <input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">นามสกุล *</label>
              <input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">วันเกิด</label>
              <input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">โทรศัพท์</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">อีเมล</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">หมายเหตุ</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">ยกเลิก</button>
              <button type="submit" className="px-4 py-2 bg-[#00868A] text-white rounded-md hover:bg-[#006d70] text-sm">{editingId ? 'บันทึก' : 'เพิ่ม'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">HN</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">เพศ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">วันเกิด</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">โทรศัพท์</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-[#00868A]">{p.hn}</td>
                <td className="px-4 py-3 text-sm">{p.first_name} {p.last_name}</td>
                <td className="px-4 py-3 text-sm">{p.gender === 'male' ? 'ชาย' : p.gender === 'female' ? 'หญิง' : p.gender || '-'}</td>
                <td className="px-4 py-3 text-sm">{p.date_of_birth || '-'}</td>
                <td className="px-4 py-3 text-sm">{p.phone || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <button onClick={() => handleEdit(p)} className="text-[#00868A] hover:underline text-xs">แก้ไข</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">ยังไม่มีผู้ป่วย</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
