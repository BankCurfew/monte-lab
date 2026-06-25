import { AlertCircle, TrendingDown, TrendingUp, Heart } from 'lucide-react';
import type { AnalysisResult } from '@/lib/analyze-blood-test';

interface AIAnalysisCardProps {
  analysis: AnalysisResult;
}

export function AIAnalysisCard({ analysis }: AIAnalysisCardProps) {
  const scoreColor = analysis.hairHealthScore >= 80 ? 'text-green-600' : analysis.hairHealthScore >= 50 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = analysis.hairHealthScore >= 80 ? 'bg-green-50' : analysis.hairHealthScore >= 50 ? 'bg-yellow-50' : 'bg-red-50';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-[#006B6E]" />
          การวิเคราะห์ AI
        </h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${scoreBg}`}>
          <Heart className={`h-4 w-4 ${scoreColor}`} />
          <span className={`text-sm font-bold ${scoreColor}`}>{analysis.hairHealthScore}/100</span>
          <span className="text-xs text-gray-500">Hair Health</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">{analysis.summary}</p>

      {analysis.flags.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">ค่าผิดปกติ</h4>
          <div className="space-y-2">
            {analysis.flags.map((flag, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${flag.severity === 'low' ? 'bg-blue-50' : 'bg-red-50'}`}>
                {flag.severity === 'low' ? (
                  <TrendingDown className="h-4 w-4 text-blue-600 flex-shrink-0" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <span className="text-sm font-medium">{flag.test}: {flag.value}</span>
                  <span className="text-xs text-gray-500 ml-2">{flag.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">คำแนะนำ</h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-[#006B6E] mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
