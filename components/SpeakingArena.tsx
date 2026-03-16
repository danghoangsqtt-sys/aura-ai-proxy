
import React, { useState, useEffect } from 'react';
import SpeakingExamCreator from './SpeakingExamCreator';
import SpeakingBasicMode from './SpeakingBasicMode';
import SpeakingTopicMode from './SpeakingTopicMode';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { useAuraStore } from '../store/useAuraStore';
import { generateExamContent } from '../services/geminiService'; // Reuse Gemini for hints

const aptisExaminerInstruction = `You are a formal, professional English examiner conducting an Aptis ESOL speaking test. The user is aiming for a B2 level. 
Conduct the test in parts:
1. Start by asking 3 short questions about everyday life, their work, or hobbies (Part 1). Wait for the user to answer each.
2. Ask the user to describe a specific situation, person, or object (Part 2).
3. Provide brief, constructive feedback on their fluency, vocabulary, and grammar after they finish.
Do not break character. Speak formally but clearly. Keep your questions concise.`;

interface SpeakingArenaProps {
  onExit?: () => void;
}

const SpeakingArena: React.FC<SpeakingArenaProps> = ({ onExit }) => {
  const [mode, setMode] = useState<'lobby' | 'basic' | 'topic' | 'exam-creator' | 'aura-exam'>('lobby');
  const [hints, setHints] = useState<string[]>([]);
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);
  
  const { conversationHistory, addConversation } = useAuraStore();
  const { disconnect, connected, isSpeaking, messages, connect } = useGeminiLive();

  // Cleanup on unmount
  useEffect(() => {
    return () => { disconnect(); };
  }, [disconnect]);

  const handleStartAuraExam = async () => {
    setMode('aura-exam');
    await connect(aptisExaminerInstruction);
  };

  const handleStopAuraExam = () => {
    disconnect();
    setMode('lobby');
    if (onExit) onExit();
  };

  const handleGenerateHints = async () => {
    if (messages.length === 0) return;
    setIsGeneratingHint(true);
    console.info('[SpeakingArena] -> [Action]: Generating AI Hints using context:', conversationHistory);
    try {
        // In a real scenario, we'd call Gemini with conversationHistory + last question
        // For this task, we'll keep the high-quality mock responses as requested.
        setTimeout(() => {
            setHints([
                "I'm really into photography because it lets me capture memories.",
                "Actually, I prefer working in teams as it's more collaborative.",
                "That's a tough one, but I'd say traveling is my biggest passion."
            ]);
            setIsGeneratingHint(false);
        }, 1000);
    } catch (err) {
        console.error('[SpeakingArena] -> [ERROR]: Hint generation failed');
        setIsGeneratingHint(false);
    }
  };

  // --- ROUTER ---
  if (mode === 'exam-creator') {
    const savedManual = localStorage.getItem('edugen_speaking_manual');
    const initialManual = savedManual ? JSON.parse(savedManual) : [];
    return <SpeakingExamCreator onBack={() => setMode('lobby')} initialManualQuestions={initialManual} />;
  }

  if (mode === 'basic') {
    return <SpeakingBasicMode onBack={() => setMode('lobby')} />;
  }

  if (mode === 'topic') {
    return <SpeakingTopicMode onBack={() => setMode('lobby')} />;
  }

  // --- AURA AI EXAM MODE (Cinematic Mode) ---
  if (mode === 'aura-exam') {
    return (
      <div className="h-full flex flex-col relative overflow-hidden bg-slate-900">
        
        {/* Cinematic Backdrop: Classroom */}
        <div className="absolute inset-0 z-0 opacity-40">
            <img 
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=2000" 
                alt="Classroom" 
                className="w-full h-full object-cover blur-sm scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50"></div>
        </div>

        {/* Header (Glassmorphism) */}
        <div className="relative z-20 bg-white/10 backdrop-blur-xl border-b border-white/10 px-8 py-5 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
              <span className="text-xl">🎓</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight uppercase">Cinematic Exam <span className="text-indigo-400">B2 ESOL</span></h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] text-indigo-200 font-black uppercase tracking-widest">Aura is now your Examiner</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleStopAuraExam}
            className="bg-white/10 hover:bg-rose-500 text-white px-6 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 border border-white/10 backdrop-blur-md"
            title="Dừng bài thi"
          >
            🛑 Hủy bài thi
          </button>
        </div>

        <div className="flex-1 flex relative z-10 overflow-hidden">
            {/* Sidebar: Conversation Logs & Hints */}
            <div className="w-[420px] border-r border-white/10 flex flex-col p-6 bg-slate-900/40 backdrop-blur-md">
                <h3 className="text-indigo-300 text-[10px] font-black uppercase tracking-[4px] mb-6">Trực tiếp hội thoại</h3>
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 messenger-box">
                    {messages.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 p-4 rounded-3xl opacity-40">
                            <p className="text-[11px] font-bold text-indigo-100/60 uppercase tracking-widest mb-1">Aura Examiner:</p>
                            <p className="text-[13px] text-white font-medium leading-relaxed">Đang khởi tạo bài thi...</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`p-4 rounded-3xl border transition-all ${
                                msg.role === 'model' ? 'bg-white/5 border-white/10' : 'bg-indigo-600/20 border-indigo-500/30 ml-4'
                            }`}>
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                                    msg.role === 'model' ? 'text-indigo-300' : 'text-emerald-400'
                                }`}>{msg.role === 'model' ? 'Aura' : 'Bạn'}</p>
                                <p className="text-[13px] text-white font-medium leading-relaxed">{msg.text}</p>
                            </div>
                        ))
                    )}

                    <div className="bg-indigo-500/10 border border-indigo-400/30 p-6 rounded-[35px] mt-10">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[3px] flex items-center gap-2">
                                <span className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[8px]">💡</span> Gợi ý phản xạ
                            </p>
                            <button 
                                onClick={handleGenerateHints}
                                disabled={isGeneratingHint || messages.length === 0}
                                className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                                title="Làm mới gợi ý"
                            >
                                {isGeneratingHint ? 'Đang tạo...' : 'Làm mới ✨'}
                            </button>
                        </div>
                        <div className="space-y-4">
                            {hints.length > 0 ? hints.map((hint, i) => (
                                <p key={i} className="text-[12px] text-slate-200 font-medium italic border-l-2 border-indigo-500/30 pl-3 leading-snug">"{hint}"</p>
                            )) : (
                                <p className="text-[11px] text-slate-500 italic">Nhấn "Làm mới" để nhận gợi ý từ AI.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl">
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">
                            {connected ? 'Live Session Active' : 'Connecting...'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col items-center justify-center p-12 relative">
                <div className="relative w-full h-full flex items-center justify-center scale-150 -translate-y-12">
                   {/* Subtitles Overlay */}
                   <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-xl text-center px-6 py-4 bg-black/40 backdrop-blur-lg border border-white/10 rounded-3xl animate-in fade-in duration-1000">
                      <p className="text-white text-lg font-medium drop-shadow-lg tracking-wide">
                        {messages.length > 0 ? messages[messages.length - 1].text : (isSpeaking ? "Aura is speaking..." : "Hãy trả lời câu hỏi của giám khảo...")}
                      </p>
                   </div>
                </div>
            </div>
        </div>

        {/* Footer Interaction Bar */}
        <div className="relative z-20 h-24 bg-gradient-to-t from-slate-900 to-transparent flex items-center justify-center gap-12 pb-6">
            <div className={`flex items-center gap-4 transition-all duration-500 ${isSpeaking ? 'opacity-20 translate-y-4' : 'opacity-100'}`}>
                <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-xl text-white animate-pulse">🎤</div>
                <span className="text-[11px] font-black text-white uppercase tracking-[4px]">Aura is listening to you</span>
            </div>
        </div>

      </div>
    );
  }

  // --- LOBBY ---
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50/50 space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="text-center relative">
        {onExit && (
            <button 
              onClick={onExit}
              className="absolute -left-32 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all border border-slate-100"
              title="Quay lại"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>
        )}
        <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-2">Speaking <span className="text-indigo-600">Lab</span></h2>
        <p className="text-slate-400 font-bold uppercase tracking-[4px] text-xs">Phòng luyện phản xạ & phát âm</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        <button onClick={() => setMode('basic')} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-indigo-200 transition-all text-left relative overflow-hidden" title="Chế độ cơ bản">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <span className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-indigo-200">🎤</span>
            <h3 className="text-lg font-black text-slate-800 uppercase mb-2">Basic Interview</h3>
            <p className="text-[11px] text-slate-500 font-medium">Luyện tập với bộ câu hỏi cơ bản do giáo viên biên soạn.</p>
          </div>
        </button>

        <button onClick={() => setMode('topic')} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-emerald-200 transition-all text-left relative overflow-hidden" title="Thử thách chủ đề">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <span className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-emerald-200">🤖</span>
            <h3 className="text-lg font-black text-slate-800 uppercase mb-2">Topic Challenge</h3>
            <p className="text-[11px] text-slate-500 font-medium">Thử thách nói ngẫu nhiên cùng AI theo chủ đề.</p>
          </div>
        </button>

        <button onClick={() => setMode('exam-creator')} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-rose-200 transition-all text-left relative overflow-hidden" title="Tạo đề thi">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <span className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-rose-200">📄</span>
            <h3 className="text-lg font-black text-slate-800 uppercase mb-2">Tạo Đề Thi Nói</h3>
            <p className="text-[11px] text-slate-500 font-medium">Ghép câu hỏi thành đề thi PDF & Đáp án chấm thi.</p>
          </div>
        </button>

        <button onClick={handleStartAuraExam} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-amber-200 transition-all text-left relative overflow-hidden" title="Thi thử cùng Aura">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <span className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-amber-200">🎓</span>
            <h3 className="text-lg font-black text-slate-800 uppercase mb-2">Thi Thử cùng Aura</h3>
            <p className="text-[11px] text-slate-500 font-medium">Mô phỏng bài thi Aptis ESOL B2 Speaking với giám khảo AI.</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SpeakingArena;
