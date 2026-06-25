import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MonteAnalysisView } from '@/components/reports/MonteAnalysisView';
import { generateMonteAnalysis } from '@/lib/monte-analysis';
import { PDPAConsent } from '@/components/PDPAConsent';
import { Lock } from 'lucide-react';

export default function SharedReport() {
  const { token } = useParams();
  const [step, setStep] = useState<'password' | 'loading' | 'view' | 'error'>('password');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [patient, setPatient] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [doctor, setDoctor] = useState<any>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setError('');

    const { data: link } = await supabase
      .from('monte_share_links')
      .select('*')
      .eq('token', token)
      .single();

    if (!link) { setError('ลิงก์ไม่ถูกต้องหรือหมดอายุ'); setStep('password'); return; }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      setError('ลิงก์หมดอายุแล้ว'); setStep('password'); return;
    }

    const digits = password.replace(/\D/g, '');
    const tryFormats = [password, digits];
    if (digits.length === 8) {
      tryFormats.push(`${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`);
    }
    let verified = false;
    for (const pwd of tryFormats) {
      const { data } = await supabase.rpc('verify_share_password', { link_id: link.id, pwd });
      if (data) { verified = true; break; }
    }

    if (!verified) { setError('รหัสผ่านไม่ถูกต้อง (ใช้วันเดือนปีเกิด เช่น 06051990)'); setStep('password'); return; }

    const { data: pat } = await supabase.from('monte_patients').select('*').eq('id', link.patient_id).single();
    setPatient(pat);

    const { data: reps } = await supabase.from('monte_reports').select('*').eq('patient_id', link.patient_id).order('test_date', { ascending: false });
    setReports(reps || []);

    const approvedReport = reps?.find(r => r.approved_by);
    if (approvedReport) {
      const { data: doc } = await supabase.from('monte_doctors').select('full_name, license_no, signature_url').eq('id', approvedReport.approved_by).single();
      setDoctor(doc);
    }

    setStep('view');
  };

  if (step === 'password' || step === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sukhumvit Set', sans-serif" }}>
        <PDPAConsent shareToken={token} />
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img src="/brand/monte-logo-primary.png" alt="Monte" style={{ height: 48, margin: '0 auto 12px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A2B3C' }}>ผลตรวจเลือดของท่าน</h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: 4 }}>กรุณากรอกรหัสผ่านเพื่อดูผลวิเคราะห์</p>
            <p style={{ fontSize: '11px', color: '#B0B8C4', marginTop: 8, lineHeight: 1.5 }}>รหัสผ่านคือวันเดือนปีเกิด (ค.ศ.) ของท่าน<br/>ตัวอย่าง: เกิดวันที่ 6 พฤษภาคม 1990 → <strong>06051990</strong></p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#5A6B7C', marginBottom: 4 }}>
                <Lock style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                รหัสผ่าน (วันเดือนปีเกิด)
              </label>
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="วันเดือนปี เช่น 06051990"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: '15px', textAlign: 'center', letterSpacing: 2, outline: 'none' }}
                autoFocus
              />
            </div>
            {error && <p style={{ color: '#c0392b', fontSize: '12px', marginBottom: 12, textAlign: 'center' }}>{error}</p>}
            <button type="submit" disabled={step === 'loading' || !password}
              style={{ width: '100%', padding: '12px', background: '#00868A', color: '#fff', border: 'none', borderRadius: 10, fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: step === 'loading' ? 0.6 : 1 }}>
              {step === 'loading' ? 'กำลังตรวจสอบ...' : 'ดูผลตรวจ'}
            </button>
          </form>

          <p style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
            ข้อมูลนี้ได้รับการคุ้มครองตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
          </p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>ลิงก์ไม่ถูกต้อง</div>;
  }

  const approvedReport = reports.find(r => r.status === 'approved') || reports[0];

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFB', padding: '24px 16px', fontFamily: "'Sukhumvit Set', sans-serif" }}>
      <PDPAConsent shareToken={token} />
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/brand/monte-logo-primary.png" alt="Monte" style={{ height: 40 }} />
        </div>
        {monteAnalysis && (
          <MonteAnalysisView
            analysis={monteAnalysis}
            patient={patient}
            report={{ ...approvedReport, status: 'approved', approved_at: approvedReport?.approved_at }}
            allReports={reports}
            parsedValues={aggregatedParsed}
            doctor={doctor}
          />
        )}
        <p style={{ textAlign: 'center', fontSize: '10px', color: '#94A3B8', marginTop: 24, lineHeight: 1.6 }}>
          ข้อมูลนี้ได้รับการคุ้มครองตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)<br />
          Monte Hair Clinic — ระบบจัดการผลตรวจเลือด
        </p>
      </div>
    </div>
  );
}
