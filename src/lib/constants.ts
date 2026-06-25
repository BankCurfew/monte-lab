export const COLORS = {
  primary: '#00868A',
  primaryLight: '#E0F5F5',
  primaryDark: '#006B6E',
  surface: '#FFFFFF',
  background: '#F8FAFB',
  textPrimary: '#1A2B3C',
  textSecondary: '#5A6B7C',
  textMuted: '#94A3B8',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: '#E2E8F0',
} as const;

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'รอดำเนินการ', color: 'text-amber-700', bg: 'bg-amber-50 border border-amber-200' },
  analyzing: { label: 'กำลังวิเคราะห์', color: 'text-blue-700', bg: 'bg-blue-50 border border-blue-200' },
  ready: { label: 'รออนุมัติ', color: 'text-orange-700', bg: 'bg-orange-50 border border-orange-200' },
  approved: { label: 'อนุมัติแล้ว', color: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-200' },
  rejected: { label: 'ปฏิเสธ', color: 'text-red-700', bg: 'bg-red-50 border border-red-200' },
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'ผู้ดูแลระบบ',
  doctor: 'แพทย์',
  staff: 'เจ้าหน้าที่',
};
