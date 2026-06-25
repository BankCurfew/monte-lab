import { CheckCircle, AlertTriangle, XCircle, Heart, Stethoscope } from 'lucide-react';
import type { MonteAnalysis } from '@/lib/monte-analysis';

const statusIcon = {
  normal: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  low: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  high: <AlertTriangle className="h-5 w-5 text-red-500" />,
  positive: <XCircle className="h-5 w-5 text-red-500" />,
  negative: <CheckCircle className="h-5 w-5 text-emerald-500" />,
};

const statusBg = {
  normal: 'bg-emerald-50 border-emerald-200',
  low: 'bg-amber-50 border-amber-200',
  high: 'bg-red-50 border-red-200',
  positive: 'bg-red-50 border-red-200',
  negative: 'bg-emerald-50 border-emerald-200',
};

export function MonteAnalysisView({ analysis }: { analysis: MonteAnalysis }) {
  const scoreColor = analysis.hairHealthScore >= 80 ? 'text-emerald-600' : analysis.hairHealthScore >= 50 ? 'text-amber-600' : 'text-red-600';
  const scoreBg = analysis.hairHealthScore >= 80 ? 'bg-emerald-50' : analysis.hairHealthScore >= 50 ? 'bg-amber-50' : 'bg-red-50';

  return (
    <div className="space-y-4">
      {/* Header with Hair Health Score */}
      <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Stethoscope className="h-6 w-6 text-[#006B6E]" />
          <div>
            <h3 className="font-semibold text-[#1A2B3C]">ผลวิเคราะห์เลือดสำหรับสุขภาพเส้นผม</h3>
            <p className="text-sm text-[#5A6B7C]">{analysis.summary}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${scoreBg}`}>
          <Heart className={`h-5 w-5 ${scoreColor}`} />
          <div className="text-right">
            <p className={`text-2xl font-bold ${scoreColor}`}>{analysis.hairHealthScore}</p>
            <p className="text-[10px] text-[#5A6B7C]">Hair Health</p>
          </div>
        </div>
      </div>

      {/* Urgent Actions */}
      {analysis.urgentActions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-red-700 mb-2">⚠️ สิ่งที่ควรทำ</h4>
          <ul className="space-y-1">
            {analysis.urgentActions.map((action, i) => (
              <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                <span className="mt-0.5">•</span>{action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Analysis Items — Clinical format */}
      <div className="space-y-3">
        {analysis.items.map((item, i) => (
          <div key={i} className={`border rounded-xl p-4 ${statusBg[item.status]}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{statusIcon[item.status]}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[#1A2B3C]">{i + 1}. {item.testName}</span>
                  <span className="text-sm text-[#5A6B7C]">({item.testNameTh})</span>
                </div>

                {item.value && (
                  <p className="text-sm text-[#1A2B3C] mb-1">
                    {typeof item.value === 'number'
                      ? <>ผลตรวจค่าได้ <span className="font-mono font-semibold">{item.value}</span> {item.unit}</>
                      : item.value === 'ปกติ' ? '' : <>ผลตรวจ: <span className="font-semibold">{item.value}</span></>
                    }
                  </p>
                )}

                <p className="text-sm text-[#5A6B7C] leading-relaxed">{item.interpretation}</p>

                {item.recommendation && (
                  <p className="text-sm text-[#006B6E] mt-2 font-medium">💊 {item.recommendation}</p>
                )}

                {item.hairRelevance && (
                  <p className="text-xs text-[#94A3B8] mt-1 italic">🔬 {item.hairRelevance}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
