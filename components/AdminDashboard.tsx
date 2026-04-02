import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AdminDashboard: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      if (u) setUserEmail(u.email);
    });
  }, []);

  return (
    <div className="h-full bg-slate-50/50 p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Alert */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-rose-100">
             <span className="text-2xl">👑</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-rose-900 tracking-tight">Khu vực Giới hạn - Admin System</h1>
            <p className="text-rose-700/80 font-medium text-sm mt-1">Xin chào Quản trị viên <strong className="text-rose-600">{userEmail}</strong>. Bạn đang truy cập bằng đặc quyền tối cao. Mọi thay đổi tại đây sẽ áp dụng trên toàn bộ hệ thống Appwrite.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { title: 'TỔNG NGƯỜI DÙNG', value: '1,248', trend: '+12%', color: 'from-blue-600 to-indigo-600' },
             { title: 'ĐỀ THI ĐÃ TẠO', value: '8,451', trend: '+24%', color: 'from-emerald-500 to-teal-600' },
             { title: 'BĂNG THÔNG API', value: '14.2 GB', trend: '-5%', color: 'from-amber-500 to-orange-600' },
             { title: 'DOANH THU (DỰ KIẾN)', value: '$450', trend: '+8%', color: 'from-purple-600 to-fuchsia-600' }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700`}></div>
                <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2 relative z-10">{stat.title}</h3>
                <div className="flex items-end gap-3 relative z-10">
                   <span className="text-4xl font-black text-slate-800 tracking-tighter">{stat.value}</span>
                   <span className={`text-xs font-bold mb-1.5 ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{stat.trend}</span>
                </div>
             </div>
           ))}
        </div>

        {/* Placeholders for actual features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-8 h-[400px] flex flex-col items-center justify-center text-center">
              <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <h3 className="text-xl font-black text-slate-800 mb-2">Quản lý Tài Khoản</h3>
              <p className="text-sm font-medium text-slate-500 max-w-xs">Module kết nối Appwrite Users API cho phép vô hiệu hóa (ban) hoặc kiểm tra lịch sử học tập. Đang bảo trì bảo mật.</p>
              <button className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors" disabled>Đang phát triển</button>
           </div>
           
           <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-8 h-[400px] flex flex-col items-center justify-center text-center">
              <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              <h3 className="text-xl font-black text-slate-800 mb-2">Cấu hình API Key System</h3>
              <p className="text-sm font-medium text-slate-500 max-w-xs">Thay đổi Master API Key cho tính năng AI Proxy, giới hạn rate limit và kiểm tra hạn mức Google Cloud quota.</p>
              <button className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors" disabled>Đang phát triển</button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
