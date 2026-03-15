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
        // Tự động login sau khi register thành công
        await authService.login(email, password);
      }
      
      const user = await authService.getCurrentUser();
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
        
        {/* Header Tabs */}
        <div className="flex bg-slate-50 border-b border-slate-100">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-6 font-black uppercase tracking-widest text-xs transition-all
              ${isLogin ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Đăng nhập
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-6 font-black uppercase tracking-widest text-xs transition-all
              ${!isLogin ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Đăng ký
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-black text-slate-800">
              {isLogin ? 'Chào mừng trở lại! 👋' : 'Tạo tài khoản mới 🚀'}
            </h2>
            <p className="text-slate-500 font-bold text-sm">
              {isLogin ? 'Đăng nhập để tiếp tục hành trình học tập' : 'Gia nhập cộng đồng EduGen để lưu trữ tri thức'}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 animate-in shake">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tên của bạn</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Họ và tên..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-300"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mật khẩu</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-300"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-[0.98]
              ${isLoading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-indigo-500/10'}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Đang xử lý...</span>
              </div>
            ) : (
              isLogin ? 'Đăng nhập ngay' : 'Tạo tài khoản'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400">
            Hệ thống bảo mật bởi 
            <span className="text-indigo-500 ml-1">Appwrite Cloud</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
