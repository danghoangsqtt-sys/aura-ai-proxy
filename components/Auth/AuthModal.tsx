import React, { useState } from 'react';
import { authService } from '../../services/authService';

interface AuthModalProps {
  onSuccess: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await authService.login(email, password);
      } else {
        await authService.register(email, password, name);
        // Autologin after register
        await authService.login(email, password);
      }
      
      const user = await authService.getCurrentUser();
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra. Tên đăng nhập hoặc mật khẩu chưa đúng.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-100 overflow-hidden font-sans">
      
      {/* Subtle modern background elements */}
      <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-100/40 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-150px] left-[-150px] w-[600px] h-[600px] bg-indigo-100/40 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out px-4">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center mb-4 transform -rotate-3 hover:rotate-3 transition-transform duration-300">
             <span className="text-2xl text-white font-black italic tracking-tighter">A</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Aura Studio</h1>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px] mt-1.5">
             Nền tảng tri thức tương lai
          </p>
        </div>

        {/* The Card */}
        <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100/50 shadow-2xl shadow-slate-200/50">
          
          {/* Header Tabs */}
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-5 font-black uppercase tracking-widest text-[11px] transition-all duration-300 relative
                ${isLogin ? 'text-indigo-600 bg-white' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
              Đăng nhập
              {isLogin && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-5 font-black uppercase tracking-widest text-[11px] transition-all duration-300 relative
                ${!isLogin ? 'text-indigo-600 bg-white' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
              Đăng ký
              {!isLogin && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                {isLogin ? 'Chào mừng trở lại! 👋' : 'Tạo tài khoản mới'}
              </h2>
              <p className="text-slate-500 font-medium text-[13px]">
                {isLogin ? 'Đăng nhập để vào vùng không gian học tập' : 'Nhập thông tin để bắt đầu hành trình'}
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-xs font-bold font-sans flex items-start gap-3 animate-in shake">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5 flex flex-col items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-full text-left pl-2">Tên hiển thị</label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  />
                </div>
              )}

              <div className="space-y-1.5 flex flex-col items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-full text-left pl-2">Email</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-slate-800 placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-1.5 flex flex-col items-center">
                <div className="flex items-center justify-between w-full px-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mật khẩu</label>
                   {isLogin && <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">Quên mật khẩu?</a>}
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-slate-800 placeholder:text-slate-300 tracking-widest text-lg"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-[2px] text-xs transition-all duration-300 shadow-xl mt-4
                ${isLoading 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
                  : 'bg-slate-900 text-white hover:bg-black hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0'}`}
            >
              <div className="flex items-center justify-center p-1">
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>ĐANG XỬ LÝ...</span>
                  </div>
                ) : (
                  isLogin ? 'ĐĂNG NHẬP NGAY' : 'TẠO TÀI KHOẢN'
                )}
              </div>
            </button>
            
            <div className="mt-4 text-center border-t border-slate-100 pt-5">
               <button
                  type="button"
                  onClick={() => onSuccess({ email: 'guest@localhost', name: 'Khách (Dùng thử)' })}
                  className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl uppercase tracking-[1px] transition-all flex items-center justify-center w-full py-3 gap-2 group"
               >
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span>Chế độ dùng thử (Không cần đăng nhập)</span>
               </button>
               <p className="text-[10px] text-slate-400 mt-3 px-2 leading-relaxed">
                  Lưu ý: Chế độ này sẽ bỏ qua đồng bộ Cloud, dữ liệu chỉ lưu nội bộ trên máy bạn. Hoạt động tốt nhất với CLIProxyAPI.
               </p>
            </div>
          </form>

          {/* Secure Footer - Light theme */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-center gap-2">
             <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[1px]">Được bảo mật mã hóa 256-bit AES</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

