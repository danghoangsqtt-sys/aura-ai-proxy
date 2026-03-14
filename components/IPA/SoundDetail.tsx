import React, { useState } from 'react';
import { IPASound } from '../../data/ipaData';
import { useGeminiLive } from '../../hooks/useGeminiLive';
import IPAQuiz from './IPAQuiz';

interface SoundDetailProps {
  sound: IPASound;
  onBack: () => void;
}

const SoundDetail: React.FC<SoundDetailProps> = ({ sound, onBack }) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'practice' | 'pairs' | 'quiz'>('theory');

  // For Text-to-Speech
  const handlePlayWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; // slightly slower for clarity
      window.speechSynthesis.speak(utterance);
    }
  };

  // For Gemini Pronunciation Check
  const { connected, connect, disconnect } = useGeminiLive();
  const isPracticing = connected;

  const handleTogglePractice = async () => {
    if (isPracticing) {
      disconnect();
    } else {
      const instruction = `You are an expert phonetician. Listen to the user pronounce the sound [${sound.symbol}] and the words [${sound.examples.join(', ')}]. Provide exact IPA transcription of what you heard and correct them.`;
      await connect(instruction);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-12">
      {/* Header & Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Quay lại Bảng IPA
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Sidebar: Sound Profile */}
        <div className={`w-full md:w-80 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 ${
          sound.type === 'consonant' 
            ? (sound.voiced ? 'bg-blue-50/50' : 'bg-slate-50')
            : 'bg-amber-50/50'
        }`}>
          <div className="w-32 h-32 bg-white rounded-full shadow-lg border-4 border-white flex items-center justify-center mb-6">
            <span className="text-6xl font-black font-serif text-slate-800">{sound.symbol}</span>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Âm {sound.symbol}</h2>
          
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <span className="px-3 py-1 bg-white text-slate-600 text-xs font-bold uppercase rounded-full shadow-sm border border-slate-200">
              {sound.type === 'monophthong' ? 'Nguyên âm đơn' : sound.type === 'diphthong' ? 'Nguyên âm đôi' : 'Phụ âm'}
            </span>
            {sound.type === 'consonant' && (
              <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full shadow-sm border ${
                sound.voiced ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}>
                {sound.voiced ? 'Hữu thanh' : 'Vô thanh'}
              </span>
            )}
          </div>

          <p className="text-center text-slate-600 text-sm mb-8 leading-relaxed">
            "{sound.description}"
          </p>

          <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider text-center">Ví dụ tiêu biểu</h4>
            <div className="space-y-2">
              {sound.examples.map(ex => (
                <button 
                  key={ex}
                  onClick={() => handlePlayWord(ex)}
                  className="w-full flex items-center justify-between p-2 hover:bg-indigo-50 rounded-lg transition-colors group"
                  title={`Nghe ví dụ: ${ex}`}
                >
                  <span className="font-bold text-slate-700 text-lg">{ex}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content Area: Tabs */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Tabs Nav */}
          <div className="flex border-b border-slate-100 px-6 pt-6 overflow-x-auto no-scrollbar">
            {[
              { id: 'theory', label: 'Lý thuyết & Video' },
              { id: 'practice', label: 'Luyện phát âm AI' },
              { id: 'pairs', label: 'Cặp âm dễ nhầm' },
              { id: 'quiz', label: 'Bài tập' }
            ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`px-6 py-4 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
                   activeTab === tab.id 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                 }`}
               >
                 {tab.label}
               </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            
            {/* THEORY TAB */}
            {activeTab === 'theory' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Video Hướng Dẫn Kỹ Thuật</h3>
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(sound.youtubeQuery)}`}
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* PRACTICE TAB */}
            {activeTab === 'practice' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center h-full">
                <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                  <span className="text-4xl">🎙️</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Trợ Giảng AI Aura</h3>
                <p className="text-slate-500 text-center max-w-md mb-8">
                  Aura sẽ lắng nghe bạn phát âm âm /{sound.symbol}/ và các từ ví dụ, sau đó đánh giá trực tiếp độ chính xác của khẩu hình.
                </p>
                <button 
                  onClick={handleTogglePractice}
                  className={`px-8 py-4 rounded-full font-black text-lg shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 ${
                    isPracticing 
                      ? 'bg-rose-500 text-white shadow-rose-500/30' 
                      : 'bg-indigo-600 text-white shadow-indigo-600/30'
                  }`}
                >
                  {isPracticing ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                      Dừng Ghi Âm
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      Bắt Đầu Luyện Tập
                    </>
                  )}
                </button>
              </div>
            )}

            {/* PAIRS TAB */}
            {activeTab === 'pairs' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  So sánh cặp âm dễ nhầm
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full font-bold font-serif">/{sound.symbol}/ vs /{sound.pairTarget}/</span>
                </h3>
                
                {sound.minimalPairs ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sound.minimalPairs.map((pair, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-center gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 flex flex-col gap-2">
                             <div className="flex items-center gap-3">
                               <button onClick={() => handlePlayWord(pair.word1)} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-indigo-500 hover:bg-indigo-50" title={`Nghe từ: ${pair.word1}`}><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg></button>
                               <span className="text-2xl font-bold text-slate-800">{pair.word1}</span>
                             </div>
                             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-11">Chứa âm /{sound.symbol}/</span>
                          </div>
                          <div className="w-px h-16 bg-slate-200 mx-4"></div>
                          <div className="flex-1 flex flex-col gap-2 items-end">
                             <div className="flex items-center gap-3 flex-row-reverse">
                               <button onClick={() => handlePlayWord(pair.word2)} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-rose-500 hover:bg-rose-50" title={`Nghe từ: ${pair.word2}`}><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg></button>
                               <span className="text-2xl font-bold text-slate-800">{pair.word2}</span>
                             </div>
                             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pr-11">Chứa âm /{sound.pairTarget}/</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500">
                    Âm này không có cặp âm dễ nhầm phổ biến.
                  </div>
                )}
              </div>
            )}

            {/* QUIZ TAB */}
            {activeTab === 'quiz' && (
              <IPAQuiz sound={sound} />
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundDetail;
