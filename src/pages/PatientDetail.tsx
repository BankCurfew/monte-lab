import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, FileText, User, Calendar, Phone, Mail, Edit2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { MonteAnalysisView } from '@/components/reports/MonteAnalysisView';
import { generateMonteAnalysis } from '@/lib/monte-analysis';

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

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Patient>>({});

  useEffect(() => {
    if (!id) return;
    supabase.from('monte_patients').select('*').eq('id', id).single()
      .then(({ data }) => { setPatient(data); setForm(data || {}); });
    supabase.from('monte_reports').select('*').eq('patient_id', id).order('test_date', { ascending: false })
      .then(({ data }) => setReports(data || []));
  }, [id]);

  const aggregatedParsed = useMemo(() => {
    const merged: Record<string, any> = {};
    for (const r of reports) {
      const pv = r.parsed_values || {};
      for (const [group, tests] of Object.entries(pv) as [string, any][]) {
        if (!merged[group]) merged[group] = {};
        Object.assign(merged[group], tests);
      }
    }
    return merged;
  }, [reports]);

  const monteAnalysis = useMemo(
    () => Object.keys(aggregatedParsed).length > 0 ? generateMonteAnalysis(aggregatedParsed) : null,
    [aggregatedParsed]
  );

  if (!patient) return <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>;

  const age = patient.date_of_birth
    ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const handleSave = async () => {
    const { error } = await supabase.from('monte_patients').update({
      hn: form.hn, first_name: form.first_name, last_name: form.last_name,
      date_of_birth: form.date_of_birth || null, gender: form.gender || null,
      phone: form.phone || null, email: form.email || null, notes: form.notes || null,
    }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('บันทึกข้อมูลแล้ว');
      setPatient({ ...patient, ...form } as Patient);
      setEditing(false);
    }
  };

  const latestReport = reports[0];

  return (
    <div>
      <Link to="/patients" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> กลับ
      </Link>

      {/* Patient Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#E0F5F5] flex items-center justify-center">
              <User className="h-8 w-8 text-[#006B6E]" />
            </div>
            <div>
              {editing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input value={form.first_name || ''} onChange={e => setForm({ ...form, first_name: e.target.value })}
                      className="px-2 py-1 border rounded text-lg font-bold" placeholder="ชื่อ" />
                    <input value={form.last_name || ''} onChange={e => setForm({ ...form, last_name: e.target.value })}
                      className="px-2 py-1 border rounded text-lg font-bold" placeholder="นามสกุล" />
                  </div>
                  <div className="flex gap-2">
                    <input value={form.hn || ''} onChange={e => setForm({ ...form, hn: e.target.value })}
                      className="px-2 py-1 border rounded text-sm" placeholder="HN" />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-[#1A2B3C]">{patient.first_name} {patient.last_name}</h2>
                  <p className="text-sm text-[#5A6B7C]">HN: {patient.hn}</p>
                </>
              )}
            </div>
          </div>
          <button onClick={() => editing ? handleSave() : setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-[#00868A] text-[#006B6E] hover:bg-[#E0F5F5]">
            {editing ? <><Save className="h-4 w-4" /> บันทึก</> : <><Edit2 className="h-4 w-4" /> แก้ไข</>}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-[#F8FAFB] rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1"><Calendar className="h-3.5 w-3.5" /> วันเกิด</div>
            {editing ? (
              <input type="date" value={form.date_of_birth || ''} onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
                className="w-full px-2 py-1 border rounded text-sm" />
            ) : (
              <p className="text-sm font-medium text-[#1A2B3C]">{patient.date_of_birth || '-'} {age ? `(${age} ปี)` : ''}</p>
            )}
          </div>
          <div className="bg-[#F8FAFB] rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1"><User className="h-3.5 w-3.5" /> เพศ</div>
            {editing ? (
              <select value={form.gender || ''} onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full px-2 py-1 border rounded text-sm">
                <option value="">-</option><option value="male">ชาย</option><option value="female">หญิง</option>
              </select>
            ) : (
              <p className="text-sm font-medium text-[#1A2B3C]">{patient.gender === 'male' ? 'ชาย' : patient.gender === 'female' ? 'หญิง' : '-'}</p>
            )}
          </div>
          <div className="bg-[#F8FAFB] rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1"><Phone className="h-3.5 w-3.5" /> โทรศัพท์</div>
            {editing ? (
              <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-2 py-1 border rounded text-sm" />
            ) : (
              <p className="text-sm font-medium text-[#1A2B3C]">{patient.phone || '-'}</p>
            )}
          </div>
          <div className="bg-[#F8FAFB] rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1"><Mail className="h-3.5 w-3.5" /> อีเมล</div>
            {editing ? (
              <input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-2 py-1 border rounded text-sm" />
            ) : (
              <p className="text-sm font-medium text-[#1A2B3C]">{patient.email || '-'}</p>
            )}
          </div>
        </div>

        {editing ? (
          <div className="mt-4">
            <label className="block text-xs text-[#94A3B8] mb-1">หมายเหตุ</label>
            <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
          </div>
        ) : patient.notes ? (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">{patient.notes}</p>
          </div>
        ) : null}
      </div>

      {/* Reports Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-[#1A2B3C] mb-3">ผลตรวจเลือด ({reports.length} รายงาน)</h3>
        {reports.length === 0 ? (
          <p className="text-sm text-[#94A3B8]">ยังไม่มีผลตรวจเลือด</p>
        ) : (
          <div className="space-y-2">
            {reports.map(r => (
              <Link key={r.id} to={`/reports/${r.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F8FAFB] border border-[#E2E8F0] transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[#006B6E]" />
                  <div>
                    <p className="text-sm font-medium text-[#1A2B3C]">{r.test_date || '-'}</p>
                    <p className="text-xs text-[#94A3B8]">{r.lab_name || 'ไม่ระบุห้อง LAB'}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  r.status === 'approved' ? 'bg-green-100 text-green-700' :
                  r.status === 'ready' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {r.status === 'approved' ? 'อนุมัติแล้ว' : r.status === 'ready' ? 'รออนุมัติ' : r.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Combined Analysis */}
      {monteAnalysis && (
        <MonteAnalysisView
          analysis={monteAnalysis}
          patient={patient}
          report={latestReport}
          allReports={reports}
          parsedValues={aggregatedParsed}
        />
      )}
    </div>
  );
}
