import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { useAuraLocalVoice } from '../hooks/useAuraLocalVoice';
import { AIConfigService, AIProvider } from '../services/aiConfigService';
import {
  Loader2, AlertCircle, Wifi, HardDrive, Mic, MicOff,
  Volume2, Square, Play, RotateCcw, X
} from 'lucide-react';

// ═══════════════════════════════════════════════
// System Prompt — Chuyên gia Ngữ âm học IPA
// ═══════════════════════════════════════════════
const buildIpaInstruction = (targetWord: string): string =>
  `You are a strict and expert English pronunciation coach and phonetician. The user is practicing the pronunciation of: "${targetWord}".

YOUR TASK (follow this EXACT format):
1. Listen carefully to the user's pronunciation.
2. Transcribe EXACTLY what you heard using IPA notation (e.g., if they said "ship" instead of "sheep", write /ʃɪp/).
3. Show the CORRECT dictionary IPA transcription for "${targetWord}".
4. Compare: Highlight which specific sounds were wrong.
5. Give ONE brief, actionable tip on tongue/lip placement to fix it.

RESPONSE FORMAT (use this template):
🎤 You said: /[user's actual IPA]/
✅ Correct: /[dictionary IPA]/
❌ Error: [specific sound difference]
💡 Fix: [one sentence tip about mouth position]

Be direct, concise, and encouraging. Do NOT generate long paragraphs. Maximum 4-5 lines.`;

// ═══════════════════════════════════════════════
// Trạng thái luồng xử lý
// ═══════════════════════════════════════════════
type ClinicPhase = 'idle' | 'connecting' | 'listening' | 'analyzing' | 'speaking' | 'error';

// ═══════════════════════════════════════════════
// IPAClinic Component
// ═══════════════════════════════════════════════
const IPAClinic: React.FC = () => {
  // --- State ---
  const [targetWord, setTargetWord] = useState('');
  const [phase, setPhase] = useState<ClinicPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]); // Lịch sử phản hồi AI

  // --- Provider routing (auto-fallback) ---
  const [activeProvider, setActiveProvider] = useState<AIProvider>(() => {
    const configured = AIConfigService.getProvider();
    if (configured === 'gemini' && !AIConfigService.getGeminiApiKey()) return 'ollama';
    return configured;
  });

  const [fallbackNotice, setFallbackNotice] = useState<string | null>(() => {
    const configured = AIConfigService.getProvider();
    if (configured === 'gemini' && !AIConfigService.getGeminiApiKey())
      return '☁️ Gemini chưa có API Key → Tự động dùng Ollama Local.';
    return null;
  });

  // --- Hooks (khởi tạo cả 2 ở top-level — Rule of Hooks) ---
  const gemini = useGeminiLive();
  const localVoice = useAuraLocalVoice();

  // --- Derived state ---
  const isActive = activeProvider === 'gemini' ? gemini.connected : localVoice.connected;
  const isSpeaking = activeProvider === 'gemini' ? gemini.isSpeaking : localVoice.isSpeaking;
  const messages = activeProvider === 'gemini' ? gemini.messages : localVoice.messages;
  const isRecordingLocal = localVoice.isRecording;
  const isThinkingLocal = localVoice.isThinking;

  // Track phase from hook states
  useEffect(() => {
    if (!isActive && phase !== 'connecting' && phase !== 'idle' && phase !== 'error') {
      setPhase('idle');
    }
    if (isActive) {
      if (isSpeaking) setPhase('speaking');
      else if (isThinkingLocal && activeProvider === 'ollama') setPhase('analyzing');
      else if (isRecordingLocal && activeProvider === 'ollama') setPhase('listening');
      else if (activeProvider === 'gemini') setPhase('listening'); // Gemini: always listening when connected
    }
  }, [isActive, isSpeaking, isRecordingLocal, isThinkingLocal, activeProvider]);

  // Collect AI messages as results
  const prevMsgCountRef = useRef(0);
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      const newMsgs = messages.slice(prevMsgCountRef.current);
      const aiMsgs = newMsgs.filter(m => m.role === 'model').map(m => m.text);
      if (aiMsgs.length > 0) {
        setResults(prev => [...aiMsgs, ...prev]);
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // --- Unified Disconnect ---
  const handleStop = useCallback(() => {
    try {
      if (activeProvider === 'gemini') gemini.disconnect();
      else localVoice.disconnect();
    } catch { /* silent */ }
    setPhase('idle');
    setError(null);
    prevMsgCountRef.current = 0;
  }, [activeProvider]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { handleStop(); };
  }, [handleStop]);

  // --- Start Exam ---
  const handleStart = async () => {
    if (!targetWord.trim()) return;

    setError(null);
    setResults([]);
    setPhase('connecting');
    prevMsgCountRef.current = 0;

    const instruction = buildIpaInstruction(targetWord.trim());
    let currentProvider = activeProvider;

    try {
      if (currentProvider === 'gemini') {
        await gemini.connect(instruction);
      } else {
        // Ollama: connect với lời chào ban đầu
        await localVoice.connect(
          `Xin chào! Hãy đọc to từ "${targetWord.trim()}" vào microphone. Tôi sẽ phân tích phát âm của bạn.`
        );
      }
      // Phase sẽ tự cập nhật qua useEffect tracking
    } catch (err: any) {
      console.error('[IPAClinic] Connection error:', err);

      // Auto-fallback: Gemini lỗi → thử Ollama
      if (currentProvider === 'gemini') {
        setToast('☁️ Gemini lỗi → Đang thử Ollama Local...');
        setActiveProvider('ollama');
        try {
          await localVoice.connect(
            `Xin chào! Hãy đọc to từ "${targetWord.trim()}" vào microphone. Tôi sẽ phân tích phát âm của bạn.`
          );
          setFallbackNotice('☁️ Đã tự động chuyển sang Ollama Local.');
          return;
        } catch (fallbackErr) {
          setError('Không thể kết nối cả Gemini lẫn Ollama. Kiểm tra Cài đặt.');
        }
      } else {
        setError('Không thể kết nối Ollama. Đảm bảo Ollama đang chạy.');
      }
      setPhase('error');
    }
  };

  // --- Ollama: Press-to-Record controls ---
  const handleStartRec = () => {
    if (activeProvider === 'ollama' && localVoice.connected) {
      localVoice.startRecording();
    }
  };
  const handleStopRec = () => {
    if (activeProvider === 'ollama' && localVoice.isRecording) {
      localVoice.stopRecording();
    }
  };

  // --- Reset ---
  const handleReset = () => {
    handleStop();
    setTargetWord('');
    setResults([]);
    setError(null);
    setFallbackNotice(null);
  };

  // --- Phase display helpers ---
  const phaseInfo: Record<ClinicPhase, { label: string; icon: React.ReactNode; color: string; pulse: boolean }> = {
    idle: { label: 'Sẵn sàng', icon: <Mic className="w-8 h-8" />, color: 'bg-slate-100 ring-slate-300 text-slate-400', pulse: false },
    connecting: { label: 'Đang kết nối...', icon: <Loader2 className="w-8 h-8 animate-spin" />, color: 'bg-indigo-100 ring-indigo-300 text-indigo-500', pulse: true },
    listening: { label: '🎤 Đang nghe...', icon: <Mic className="w-8 h-8" />, color: 'bg-teal-100 ring-teal-400 text-teal-600', pulse: true },
    analyzing: { label: '⚙️ Đang phân tích...', icon: <Loader2 className="w-8 h-8 animate-spin" />, color: 'bg-amber-100 ring-amber-300 text-amber-600', pulse: true },
    speaking: { label: '🔊 AI đang trả lời...', icon: <Volume2 className="w-8 h-8" />, color: 'bg-orange-100 ring-orange-300 text-orange-600', pulse: true },
    error: { label: 'Lỗi kết nối', icon: <AlertCircle className="w-8 h-8" />, color: 'bg-rose-100 ring-rose-300 text-rose-500', pulse: false },
  };

  const currentPhase = phaseInfo[phase];

  // ═══════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════
  return (
    <div className="h-full flex flex-col animate-content">
      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-2.5 rounded-xl shadow-2xl text-xs font-semibold bg-slate-900 text-white animate-in slide-in-from-bottom-4 fade-in duration-300">
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-white border-b px-8 py-5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200">
              <span className="text-lg">🔬</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Phòng Khám Phát Âm IPA</h2>
              <p className="text-[11px] text-slate-400 font-medium">Kiểm tra và cải thiện phát âm tiếng Anh cùng Aura</p>
            </div>
          </div>
          {/* Provider badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
            activeProvider === 'gemini'
              ? 'bg-sky-50 text-sky-600 border-sky-200'
              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}>
            {activeProvider === 'gemini'
              ? <><Wifi className="w-3 h-3" /> Gemini Live</>
              : <><HardDrive className="w-3 h-3" /> Ollama Local</>
            }
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Fallback notice */}
          {fallbackNotice && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 animate-in fade-in duration-300">
              <span className="text-lg">💡</span>
              <p className="text-[11px] text-amber-700 font-medium flex-1">{fallbackNotice}</p>
              <button onClick={() => setFallbackNotice(null)} className="text-amber-400 hover:text-amber-600 font-bold">×</button>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-rose-700">Lỗi kết nối</p>
                <p className="text-[11px] text-rose-600 mt-0.5">{error}</p>
              </div>
              <button onClick={() => { setError(null); setPhase('idle'); }} className="text-rose-400 hover:text-rose-600 font-bold">×</button>
            </div>
          )}

          {/* ═══ Input Section ═══ */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
              Từ vựng hoặc câu cần luyện phát âm
            </label>
            <input
              type="text"
              value={targetWord}
              onChange={(e) => setTargetWord(e.target.value)}
              placeholder='Ví dụ: "ubiquitous", "sheep", "I thoroughly enjoyed it"...'
              disabled={isActive || phase === 'connecting'}
              onKeyDown={e => e.key === 'Enter' && !isActive && handleStart()}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all disabled:bg-slate-50 disabled:text-slate-400"
            />

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              {!isActive ? (
                <button
                  onClick={handleStart}
                  disabled={!targetWord.trim() || phase === 'connecting'}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 text-white py-3 rounded-xl font-bold text-sm tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-teal-200"
                >
                  {phase === 'connecting'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang kết nối...</>
                    : <><Play className="w-4 h-4" /> Bắt đầu kiểm tra phát âm</>
                  }
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white py-3 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                >
                  <Square className="w-4 h-4" /> Dừng kiểm tra
                </button>
              )}
              {results.length > 0 && (
                <button onClick={handleReset} className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all" title="Reset">
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>
          </div>

          {/* ═══ Live Status Panel ═══ */}
          {isActive && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-in fade-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center gap-4 py-4">
                {/* Phase indicator orb */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ring-4 ${currentPhase.color} ${currentPhase.pulse ? 'animate-pulse' : ''}`}>
                  {currentPhase.icon}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700">{currentPhase.label}</p>
                  <p className="text-xl font-black text-teal-600 mt-1">"{targetWord}"</p>

                  {/* Ollama: Press-to-Record button */}
                  {activeProvider === 'ollama' && !isSpeaking && !isThinkingLocal && (
                    <div className="mt-4">
                      <button
                        onMouseDown={handleStartRec}
                        onMouseUp={handleStopRec}
                        onTouchStart={handleStartRec}
                        onTouchEnd={handleStopRec}
                        className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center transition-all shadow-lg ${
                          isRecordingLocal
                            ? 'bg-rose-500 ring-4 ring-rose-200 scale-110'
                            : 'bg-teal-600 hover:bg-teal-700 ring-4 ring-teal-100'
                        }`}
                        title="Giữ để nói"
                      >
                        {isRecordingLocal ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                      </button>
                      <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                        {isRecordingLocal ? 'Thả chuột để gửi...' : 'Giữ để nói'}
                      </p>
                    </div>
                  )}

                  {/* Gemini: auto-listen → no button needed */}
                  {activeProvider === 'gemini' && !isSpeaking && (
                    <p className="text-xs text-slate-400 mt-3">Hãy phát âm rõ ràng vào microphone</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ Results Cards ═══ */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 bg-teal-600 rounded-md flex items-center justify-center text-white text-[8px]">📊</span>
                Kết quả phân tích ({results.length})
              </h3>
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center shrink-0 border border-teal-100">
                      <span className="text-xs">#{results.length - idx}</span>
                    </div>
                    <div className="flex-1 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                      {result}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ Instructions (idle state) ═══ */}
          {!isActive && phase === 'idle' && results.length === 0 && (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Hướng dẫn sử dụng</h3>
              <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                <li>Nhập từ vựng hoặc câu tiếng Anh bạn muốn luyện phát âm.</li>
                <li>Nhấn <strong>"Bắt đầu kiểm tra"</strong> để kết nối với {activeProvider === 'gemini' ? 'Gemini' : 'Ollama'}.</li>
                {activeProvider === 'ollama' && <li><strong>Giữ nút microphone</strong> để ghi âm, thả ra để gửi.</li>}
                {activeProvider === 'gemini' && <li>Nói trực tiếp vào mic — Gemini Live tự động nghe.</li>}
                <li>AI sẽ phân tích phiên âm IPA và hướng dẫn sửa lỗi phát âm.</li>
              </ol>
              <p className="text-[10px] text-slate-400 mt-3 font-medium">
                💡 Đổi AI Provider trong <strong>Cài đặt</strong> nếu muốn dùng {activeProvider === 'gemini' ? 'Ollama Local' : 'Gemini Cloud'}.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default IPAClinic;
