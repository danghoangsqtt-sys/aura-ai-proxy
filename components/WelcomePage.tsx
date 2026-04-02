import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Mic, FileText, BookOpen, PenTool, BrainCircuit, Heart } from 'lucide-react';

interface WelcomePageProps {
  onNavigate: (tab: any) => void;
}

// ----------------------------------------------------------------------
// 3D Parallax Tilt Card Component
// ----------------------------------------------------------------------
interface TiltProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  onClick?: () => void;
  depth?: number;
}

const TiltCard: React.FC<TiltProps> = ({ children, className = '', contentClassName = '', onClick, depth = 30 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const box = cardRef.current.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    
    // Mức độ nghiêng 3D (Tối đa 6-8 độ để giữ sự tinh tế)
    const rotateX = -((y - centerY) / centerY) * 6; 
    const rotateY = ((x - centerX) / centerX) * 6;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovering(true);
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ perspective: '1200px' }}
      className={`relative rounded-3xl cursor-pointer block ${className}`}
    >
      {/* Khối nền Card Chính (Có Transform 3D) */}
      <div 
        style={{ 
          transform: isHovering 
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.03, 1.03, 1.03)` 
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
          transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
        className={`w-full h-full rounded-3xl group overflow-hidden ${contentClassName}`}
      >
         {/* Lớp nội dung (Nổi bật lên trên mặt thẻ Z-axis) */}
         <div 
            style={{ 
             transform: isHovering ? `translateZ(${depth}px)` : 'translateZ(0px)',
             transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
           }}
           className="w-full h-full flex flex-col justify-between"
         >
           {children}
         </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Welcome Page
// ----------------------------------------------------------------------
const WelcomePage: React.FC<WelcomePageProps> = ({ onNavigate }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-full overflow-hidden bg-slate-50 font-sans p-4 lg:p-6 flex items-center justify-center">
      
      {/* Background Mesh */}
      <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-indigo-400/10 rounded-full blur-[120px] mix-blend-multiply opacity-80 animate-pulse pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[30rem] h-[30rem] bg-violet-400/10 rounded-full blur-[120px] mix-blend-multiply opacity-80 animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      {/* Main Unified Dashboard Container */}
      <div className={`relative z-10 w-full max-w-6xl mx-auto bg-white/40 backdrop-blur-2xl ring-1 ring-white/80 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-6 md:p-10 flex flex-col transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          
        {/* HERO SECTION DEVOID OF SYSTEM JARGON */}
        <header className="mb-8 text-center animate-in slide-in-from-bottom-4 fade-in duration-1000">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-white/80 backdrop-blur-md px-4 py-1.5 mb-5 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:scale-105">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-700 group-hover:text-indigo-600 transition-colors">
              Trải nghiệm Học thuật Thông minh
            </span>
          </div>
          
          <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-900 lg:text-5xl leading-tight">
            Chinh phục Tiếng Anh, <br className="hidden lg:block"/>
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">hành trình đầy cảm hứng.</span>
          </h1>
          <p className="mx-auto max-w-lg text-xs lg:text-sm font-medium leading-relaxed text-slate-500">
            Khai mở thế giới kiến thức cùng người bạn đồng hành Aura ảo. Giao tiếp tự nhiên, 
            truyền cảm hứng trọn vẹn từng khoảnh khắc học tập.
          </p>
        </header>

        {/* 3D BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 auto-rows-max" style={{ perspective: '2000px' }}>

          {/* BLOCK 1: Gia sư Aura */}
          <TiltCard 
            onClick={() => onNavigate('speaking')}
            depth={50}
            className="md:col-span-2 lg:col-span-2 md:row-span-2 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both"
            contentClassName="bg-gradient-to-br from-indigo-50/90 to-white/80 p-6 md:p-8 border border-white/90 shadow-sm hover:shadow-[0_20px_40px_rgba(99,102,241,0.2)]"
          >
            {/* Hologram Aura Core Glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-indigo-300">
              <Mic className="w-7 h-7" />
            </div>
            
            <div className="mt-auto pt-16">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Gia sư Aura 2D</h3>
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">Hot</span>
              </div>
              <p className="text-slate-500 font-medium text-xs lg:text-sm leading-relaxed max-w-xs">
                Người bạn đồng hành tương tác giọng nói 24/7. Cùng bạn trò chuyện nhàn rỗi hoặc luyện giao tiếp mạch lạc.
              </p>
            </div>
          </TiltCard>

          {/* BLOCK 2: Tạo Đề Thi */}
          <TiltCard 
            onClick={() => onNavigate('create')}
            depth={40}
            className="md:col-span-1 lg:col-span-2 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 fill-mode-both"
            contentClassName="bg-white/80 p-6 border border-white/80 shadow-sm hover:shadow-[0_15px_35px_rgba(139,92,246,0.15)]"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-black text-slate-800 mb-1 lg:mb-2 tracking-tight">AI Tạo bài tập</h3>
              <p className="text-slate-500 font-medium text-xs leading-relaxed">
                Thỏa sức khám phá những bộ câu đố, bài đọc sáng tạo dựa trên sở thích cá nhân của bạn.
              </p>
            </div>
          </TiltCard>

          {/* BLOCK 3: Từ Vựng */}
          <TiltCard 
            onClick={() => onNavigate('dictionary')}
            depth={30}
            className="lg:col-span-1 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both"
            contentClassName="bg-white/80 p-5 px-6 border border-white/80 shadow-sm hover:shadow-[0_15px_30px_rgba(245,158,11,0.15)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-500 mb-6 transition-transform duration-500 group-hover:scale-110">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[17px] font-black text-slate-800 mb-1">Thư Viện Lexicon</h3>
              <p className="text-slate-500 font-medium text-[11px] leading-relaxed">Bộ sưu tập từ vựng, bắt lỗi ngữ pháp thông minh.</p>
            </div>
          </TiltCard>

          {/* BLOCK 4: Luyện Viết */}
          <TiltCard 
            onClick={() => onNavigate('writing')}
            depth={30}
            className="lg:col-span-1 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-[400ms] fill-mode-both"
            contentClassName="bg-white/80 p-5 px-6 border border-white/80 shadow-sm hover:shadow-[0_15px_30px_rgba(16,185,129,0.15)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-500 mb-6 transition-transform duration-500 group-hover:scale-110">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[17px] font-black text-slate-800 mb-1">Không Gian Viết</h3>
              <p className="text-slate-500 font-medium text-[11px] leading-relaxed">Góc sáng tác luận văn tự do, mượt mà và sâu lắng.</p>
            </div>
          </TiltCard>

          {/* BLOCK 5: Truyện Chêm */}
          <TiltCard 
            onClick={() => onNavigate('story')}
            depth={40}
            className="md:col-span-2 lg:col-span-3 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-[500ms] fill-mode-both"
            contentClassName="bg-gradient-to-r from-rose-50/80 to-pink-50/80 p-5 lg:px-8 border border-white/90 shadow-sm hover:shadow-[0_20px_40px_rgba(244,63,94,0.15)] flow-root"
          >
             <div className="flex flex-col md:flex-row md:items-center gap-5 h-full">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <div className="flex-1 mt-auto md:mt-0">
                  <h3 className="text-lg lg:text-xl font-black text-slate-800 mb-1 tracking-tight">Truyện Chêm Macaronic</h3>
                  <p className="text-slate-500 font-medium text-xs leading-relaxed max-w-xl">
                    Đắm mình trong những mẫu chuyện song ngữ lôi cuốn, khắc ghi từ vựng vào trí nhớ một cách vô thức.
                  </p>
                </div>
             </div>
          </TiltCard>

          {/* NEW BLOCK 6: DHSystem Author Widget - Redesigned to be 'Creator' focused rather than 'Architecture' */}
          <TiltCard 
            depth={20}
            className="lg:col-span-1 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-[600ms] fill-mode-both"
            contentClassName="bg-slate-900 overflow-hidden p-6 shadow-xl flex flex-col justify-between"
          >
            {/* Soft Ambient Creator Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-pink-500/30 transition-colors duration-1000"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-pink-300 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <Heart className="w-5 h-5 fill-pink-300" />
              </div>
            </div>
            
            <div className="relative z-10 mt-auto pt-10">
              <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-1">Crafted With Passion</p>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                DHSystem
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400/80 mt-1 shadow-[0_0_10px_rgba(244,114,182,1)] animate-pulse"></span>
              </h3>
              <p className="text-[10px] font-medium text-slate-400 mt-1.5">Aura Learning Space © 2026</p>
            </div>
          </TiltCard>
          
        </div>

      </div>
      
    </div>
  );
};

export default WelcomePage;
