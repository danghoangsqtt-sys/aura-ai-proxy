import React, { useState } from 'react';
import { generateVocabMindMap, VocabMindMapResponse } from '../services/geminiService';

const VocabMindMap: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [data, setData] = useState<VocabMindMapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setData(null);

    console.info(`[VocabMindMap] -> [Action]: Generating mind map for topic: ${topic}`);

    try {
      const result = await generateVocabMindMap(topic.trim());
      setData(result);
      console.info('[VocabMindMap] -> [Success]: Mind map data received and rendered.');
    } catch (err: any) {
      const errMsg = err.message || 'Lỗi hệ thống AI.';
      setError(errMsg);
      console.error('[VocabMindMap] -> [ERROR]: Failed to generate mind map:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-12 animate-content">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
        <div className="relative w-full max-w-md group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
          <input 
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Nhập chủ đề (VD: Environment, Technology...)"
            className="relative w-full px-6 py-4 bg-white rounded-xl border border-slate-200 outline-none font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
          />
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          className={`px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg active:scale-95
            ${isLoading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'}`}
        >
          {isLoading ? 'Đang vẽ sơ đồ...' : 'Vẽ Mind Map'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-2xl flex items-center gap-4 text-rose-600 animate-in fade-in">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* Mind Map Area */}
      {data && (
        <div className="relative py-10 flex flex-col items-center animate-in zoom-in duration-500">
          
          {/* Central Topic */}
          <div className="relative z-20 group">
            <div className="absolute -inset-4 bg-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition animate-pulse"></div>
            <div className="relative bg-white border-4 border-indigo-500 p-8 md:p-12 rounded-full shadow-2xl flex flex-col items-center min-w-[200px] transform transition-transform duration-500 hover:scale-110">
              <span className="text-5xl md:text-6xl mb-4 animate-bounce">{data.centralEmoji}</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter text-center leading-none">
                {data.centralTopic}
              </h2>
            </div>
          </div>

          {/* Branches Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full relative z-10">
            {/* SVG Connector Lines (Simplified Visual) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-16 w-full h-16 pointer-events-none hidden lg:block">
               <svg className="w-full h-full opacity-10" viewBox="0 0 1000 100" preserveAspectRatio="none">
                  <path d="M500 0 C 500 50, 125 50, 125 100 M 500 0 C 500 50, 375 50, 375 100 M 500 0 C 500 50, 625 50, 625 100 M 500 0 C 500 50, 875 50, 875 100" fill="none" stroke="currentColor" strokeWidth="4"/>
               </svg>
            </div>

            {data.branches.map((branch, idx) => (
              <div key={idx} className="group flex flex-col animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="bg-white rounded-[32px] p-6 shadow-xl border border-slate-100 hover:border-indigo-200 transition-all flex-1 flex flex-col relative overflow-hidden">
                  {/* Category Header */}
                  <div className="mb-6 pb-4 border-b border-slate-50">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[4px] block mb-2 opacity-50">Category</span>
                    <h3 className="text-lg font-black text-slate-800">{branch.categoryName}</h3>
                  </div>

                  {/* Word List */}
                  <div className="space-y-3 flex-1">
                    {branch.words.map((w, wIdx) => (
                      <div 
                        key={wIdx} 
                        className="group/word p-3 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 cursor-default"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl shrink-0">{w.emoji}</span>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 group-hover/word:text-indigo-600 transition-colors">{w.word}</span>
                            <span className="text-[11px] font-bold text-slate-400 group-hover/word:text-indigo-400">{w.meaning}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Decorative Sparkle */}
                  <div className="absolute -bottom-4 -right-4 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">
                     <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Welcome State */}
      {!data && !isLoading && !error && (
        <div className="py-24 text-center space-y-8 opacity-20">
          <div className="flex justify-center gap-8">
            <svg className="w-16 h-16 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">Vocab Mind Map Explorer</h3>
            <p className="font-bold text-lg mt-2">Biến một chủ đề trừu tượng thành sơ đồ tri thức trực quan</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabMindMap;
