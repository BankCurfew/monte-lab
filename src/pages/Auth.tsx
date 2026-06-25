import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0fafa] to-[#e8f4f4] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00868A] rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-3xl font-bold text-[#00868A] tracking-[4px]" style={{ fontFamily: 'system-ui' }}>MONTE</h1>
          <p className="text-xs text-gray-400 tracking-[2px] mt-1">LAB REPORT SYSTEM</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00868A] focus:border-transparent text-sm bg-gray-50"
              placeholder="admin@montelab.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00868A] focus:border-transparent text-sm bg-gray-50"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00868A] text-white rounded-xl hover:bg-[#006d70] disabled:opacity-50 font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Monte Hair Clinic — ระบบจัดการผลตรวจเลือด
        </p>
      </div>
    </div>
  );
}
