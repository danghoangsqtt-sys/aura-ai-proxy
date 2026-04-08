import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../hooks/useAuraLocalVoice';

interface AuraLiveChatProps {
    messages: ChatMessage[];
    onClose: () => void;
    isAuraSpeaking: boolean;
    interimText?: string;
    isRecording?: boolean;
    onStartRecord?: () => void;
    onStopRecord?: () => void;
    isThinking?: boolean;
}

/**
 * Aura LiveChat — Compact floating voice-chat widget
 * Thiết kế nhỏ gọn giống ChatbotPanel, cho phép người dùng trò chuyện bằng giọng nói
 * trong khi vẫn tương tác được với các nội dung khác trên hệ thống.
 */
const AuraLiveChat: React.FC<AuraLiveChatProps> = ({
    messages,
    onClose,
    isAuraSpeaking,
    interimText,
    isRecording,
    onStartRecord,
    onStopRecord,
    isThinking
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, interimText, isThinking]);

    const handleRecordToggle = () => {
        if (isRecording) {
            onStopRecord?.();
        } else {
            onStartRecord?.();
        }
    };

    const getStatusText = () => {
        if (isRecording) return '🔴 Đang ghi âm…';
        if (isThinking) return '💭 Đang suy nghĩ…';
        if (isAuraSpeaking) return '🔊 Đang trả lời…';
        return '🟢 Sẵn sàng trò chuyện';
    };

    const getStatusDotColor = () => {
        if (isRecording) return 'bg-rose-500';
        if (isThinking) return 'bg-amber-500';
        if (isAuraSpeaking) return 'bg-emerald-500';
        return 'bg-emerald-500';
    };

    return (
        <div className="w-[400px] h-[65vh] max-h-[650px] flex flex-col bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden pointer-events-auto">

            {/* ─── Header ─── */}
            <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center shrink-0 z-10">
                <div className="flex items-center gap-2.5">
                    {/* Avatar */}
                    <div className="relative">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transform -rotate-2 transition-all duration-300 ${
                            isAuraSpeaking ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30' :
                            isRecording   ? 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30' :
                            isThinking    ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30' :
                                            'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'
                        }`}>
                            <span className="text-lg">🎙️</span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusDotColor()} border-2 border-slate-900 rounded-full ${
                            (isAuraSpeaking || isRecording) ? 'animate-pulse' : ''
                        }`}></div>
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white tracking-tight leading-none uppercase">Aura Voice</h2>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{getStatusText()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Sound wave khi Aura đang nói */}
                    {isAuraSpeaking && (
                        <div className="flex items-end gap-[2px] h-5 shrink-0 mr-1">
                            {[0.4, 0.7, 1.0, 0.7, 0.4].map((h, i) => (
                                <div key={i}
                                    className="w-[2px] bg-emerald-400 rounded-full animate-pulse"
                                    style={{
                                        height: `${h * 16}px`,
                                        animationDelay: `${i * 100}ms`,
                                        animationDuration: '0.6s'
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-white/5 text-white/40 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg transition-all flex items-center justify-center border border-white/5"
                        title="Đóng"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* ─── Message Area ─── */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar-compact"
            >
                {messages.length === 0 && !interimText ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                            <span className="text-2xl">🎤</span>
                        </div>
                        <p className="text-white/50 text-sm font-bold">Nhấn nút micro để bắt đầu</p>
                        <p className="text-white/25 text-xs mt-1">Aura sẵn sàng lắng nghe bạn</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div className={`relative max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    {/* Bubble */}
                                    <div className={`px-4 py-2.5 rounded-xl text-sm leading-relaxed shadow-sm transition-all ${
                                        msg.role === 'user'
                                            ? 'bg-indigo-500/30 text-indigo-100 rounded-tr-none border border-indigo-400/20'
                                            : 'bg-white/8 text-slate-200 rounded-tl-none border border-white/8'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    {/* Timestamp */}
                                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1 px-1">
                                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Interim (user đang nói) */}
                        {interimText && (
                            <div className="flex justify-end animate-in fade-in duration-200">
                                <div className="max-w-[85%] px-4 py-2.5 rounded-xl rounded-tr-none text-sm bg-rose-500/15 text-rose-200 italic border border-rose-500/20">
                                    {interimText}
                                    <span className="inline-block w-1 h-3.5 bg-rose-400 ml-1 animate-pulse align-middle rounded-sm" />
                                </div>
                            </div>
                        )}

                        {/* Aura đang suy nghĩ */}
                        {isThinking && (
                            <div className="flex justify-start animate-in fade-in duration-300">
                                <div className="px-4 py-3 rounded-xl rounded-tl-none bg-white/5 border border-white/8">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ─── Footer: Record Controls ─── */}
            <div className="px-4 py-4 bg-slate-900/50 border-t border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                    {/* Status Text */}
                    <p className="flex-1 text-[11px] text-white/30 font-bold">
                        {isRecording
                            ? '🔴 Nhấn ■ để gửi'
                            : isAuraSpeaking
                            ? '🔊 Chờ Aura nói xong…'
                            : '💬 Nhấn mic để nói'}
                    </p>

                    {/* Mic Button */}
                    <button
                        onClick={handleRecordToggle}
                        disabled={isAuraSpeaking || isThinking}
                        title={isRecording ? 'Dừng và gửi' : 'Bắt đầu nói'}
                        className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 shadow-lg ${
                            isRecording
                                ? 'bg-rose-500 shadow-rose-500/40 scale-110'
                                : isAuraSpeaking || isThinking
                                ? 'bg-white/8 text-white/20 cursor-not-allowed shadow-none'
                                : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105 shadow-indigo-500/30'
                        }`}
                    >
                        {/* Ripple khi recording */}
                        {isRecording && (
                            <span className="absolute inset-0 rounded-xl animate-ping bg-rose-400 opacity-20" />
                        )}

                        {isRecording ? (
                            /* Stop icon */
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                        ) : (
                            /* Mic icon */
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Scoped CSS */}
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar-compact::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-compact::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-compact::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar-compact::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}} />
        </div>
    );
};

export default AuraLiveChat;
