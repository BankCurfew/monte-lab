import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function PDPAConsent({ shareToken }: { shareToken?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const key = shareToken ? `monte_pdpa_${shareToken}` : 'monte_pdpa_accepted';
    if (!localStorage.getItem(key)) setShow(true);
  }, [shareToken]);

  if (!show) return null;

  const accept = async (type: 'all' | 'essential') => {
    const key = shareToken ? `monte_pdpa_${shareToken}` : 'monte_pdpa_accepted';
    localStorage.setItem(key, new Date().toISOString());

    await supabase.from('monte_pdpa_consents').insert({
      share_token: shareToken || null,
      consent_type: type,
      user_agent: navigator.userAgent,
    });

    setShow(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', color: '#fff', padding: '20px 24px', fontFamily: "'Sukhumvit Set', sans-serif" }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: 6 }}>นโยบายความเป็นส่วนตัว (PDPA)</p>
          <p style={{ fontSize: '12px', opacity: 0.85, lineHeight: 1.6 }}>
            เว็บไซต์นี้ใช้คุกกี้เพื่อเพิ่มประสิทธิภาพและประสบการณ์ที่ดีในการใช้งาน
            ข้อมูลผลตรวจเลือดของท่านจะถูกเก็บรักษาอย่างปลอดภัยตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
            และจะใช้เพื่อการวิเคราะห์ทางการแพทย์เท่านั้น
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => accept('all')}
            style={{ padding: '10px 24px', background: '#00868A', color: '#fff', border: 'none', borderRadius: 8, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            ยอมรับทั้งหมด
          </button>
          <button onClick={() => accept('essential')}
            style={{ padding: '10px 24px', background: 'transparent', color: '#fff', border: '1px solid #666', borderRadius: 8, fontSize: '13px', cursor: 'pointer' }}>
            ยอมรับเฉพาะที่จำเป็น
          </button>
        </div>
      </div>
    </div>
  );
}
