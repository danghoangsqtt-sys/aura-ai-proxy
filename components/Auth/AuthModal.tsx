import React, { useState } from 'react';
import { authService } from '../../services/authService';

interface AuthModalProps {
  onSuccess: (user: any) => void;
}

type OobStep = 'idle' | 'awaiting_url';

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [oobStep, setOobStep] = useState<OobStep>('idle');
  const [pastedUrl, setPastedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Step 1: Open Proxy OAuth popup ────────────────────────────────────────
  const handleInitiateLogin = () => {
    setError(null);
    authService.initiateProxyLogin();
    setOobStep('awaiting_url');
  };

  // ── Step 2: Exchange the pasted callback URL ───────────────────────────────
  const handleSubmitUrl = async () => {
    if (!pastedUrl.trim()) {
      setError('Vui lòng dán URL vào ô bên trên trước khi xác nhận.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.submitCallbackUrl(pastedUrl.trim());
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  // ── Guest bypass ───────────────────────────────────────────────────────────
  const handleGuest = () => {
    sessionStorage.setItem('aura_guest_mode', '1');
    onSuccess({ email: 'guest@localhost', name: 'Khách (Dùng thử)' });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-100 overflow-hidden font-sans">

      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-100/40 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-150px] w-[600px] h-[600px] bg-indigo-100/40 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out px-4">

        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center mb-5 transform -rotate-3 hover:rotate-3 transition-transform duration-300">
            <span className="text-3xl text-white font-black italic tracking-tighter">A</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Aura Studio</h1>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs text-center">
            Tích hợp <br /><span className="text-indigo-600">Trí tuệ nhân tạo cá nhân</span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100/50 shadow-2xl shadow-slate-200/50">
          <div className="p-8 pb-10 space-y-6 bg-white">

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-800">Bắt đầu hành trình</h2>
              <p className="text-slate-500 font-medium text-[13px] leading-relaxed">
                {oobStep === 'idle'
                  ? 'Nhấn nút bên dưới để mở cửa sổ đăng nhập Google qua hệ thống proxy an toàn.'
                  : 'Hoàn thành đăng nhập trong cửa sổ mới, rồi dán URL vào đây.'}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-xs font-bold flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* ── STEP 1: Initiate button ── */}
            {oobStep === 'idle' && (
              <div className="pt-2">
                <button
                  id="btn-initiate-proxy-login"
                  onClick={handleInitiateLogin}
                  className="w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-3 bg-white text-slate-700 border-2 border-slate-100 hover:border-indigo-100 hover:bg-slate-50 hover:shadow-indigo-500/10 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Đăng nhập với Google (qua Proxy)</span>
                </button>
              </div>
            )}

            {/* ── STEP 2: Paste URL ── */}
            {oobStep === 'awaiting_url' && (
              <div className="space-y-4 pt-2">
                {/* Instruction callout */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-amber-700 text-[12px] font-semibold leading-relaxed">
                    Sau khi đăng nhập trên cửa sổ mới, trình duyệt sẽ báo lỗi{' '}
                    <span className="font-black text-amber-800">"Không thể kết nối"</span>.
                    Hãy copy toàn bộ URL của trang lỗi đó và dán vào đây.
                  </p>
                </div>

                {/* URL input */}
                <div>
                  <label htmlFor="callback-url-input" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    URL trang lỗi (localhost://…)
                  </label>
                  <input
                    id="callback-url-input"
                    type="text"
                    value={pastedUrl}
                    onChange={(e) => setPastedUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitUrl()}
                    placeholder="http://localhost/?state=...&code=..."
                    className="w-full border-2 border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 text-sm text-slate-700 font-mono outline-none transition-all placeholder:text-slate-300"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {/* Confirm button */}
                <button
                  id="btn-confirm-callback-url"
                  onClick={handleSubmitUrl}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-3
                    ${isLoading
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-500/30'}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Đang xác nhận…</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Xác nhận URL</span>
                    </>
                  )}
                </button>

                {/* Back link */}
                <button
                  onClick={() => { setOobStep('idle'); setError(null); setPastedUrl(''); }}
                  className="w-full text-xs text-slate-400 hover:text-indigo-600 transition-colors py-1"
                  disabled={isLoading}
                >
                  ← Quay lại
                </button>
              </div>
            )}

            {/* Guest mode */}
            <div className="mt-2 text-center pt-6 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-slate-100 rounded-full" />
              <button
                type="button"
                id="btn-guest-mode"
                onClick={handleGuest}
                className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 rounded-xl uppercase tracking-[1px] transition-all flex items-center justify-center w-full py-3 gap-2 group"
              >
                <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Khám phá với tư cách Khách</span>
              </button>
              <p className="text-[10px] text-slate-400 mt-3 px-2 leading-relaxed">
                Lưu ý: Không hỗ trợ các tính năng Trí tuệ Nhân tạo và Đồng bộ Dữ liệu.
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[1px]">OAuth 2.0 · Out-of-Band Flow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
