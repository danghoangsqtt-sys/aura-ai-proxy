import React, { useState } from 'react';
import { analyzeWordFormation, WordFormationResponse } from '../services/geminiService';

const WordFormationPanel: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<WordFormationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    console.info(`[WordFormation] -> [Action]: Analyzing word morphology for: ${inputText}`);

    try {
      const data = await analyzeWordFormation(inputText.trim());
      setResult(data);
      console.info('[WordFormation] -> [Success]: Received morphology data.');
    } catch (err: any) {
      const errMsg = err.message || 'Lỗi hệ thống AI.';
      setError(errMsg);
      console.error('[WordFormation] -> [ERROR]: Failed to analyze word:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-content">
      {/* Search Input Area */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
        <div className="relative flex items-center bg-white rounded-[28px] p-2 shadow-2xl border border-slate-100">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="Nhập từ cần giải phẫu (VD: unbelievable, transformation...)"
            className="flex-1 bg-transparent px-6 py-4 outline-none text-lg text-slate-800 font-bold placeholder:text-slate-300"
          />
          <button 
            onClick={handleAnalyze}
            disabled={isLoading || !inputText.trim()}
            className={`px-8 py-4 rounded-[22px] font-black uppercase tracking-widest text-sm transition-all shadow-xl
              ${isLoading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black hover:scale-105 active:scale-95 shadow-indigo-500/20'}`}
          >
            {isLoading ? 'Đang mổ xẻ...' : 'Giải phẫu từ'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-3xl flex items-center gap-4 text-rose-600 animate-in slide-in-from-top-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* Visual Morphem Blocks */}
          <div className="flex flex-wrap justify-center items-stretch gap-4">
            {/* Prefix */}
            {result.prefix && (
              <div className="group relative">
                <div className="bg-blue-600 p-6 md:p-10 rounded-[40px] shadow-2xl shadow-blue-200 transform hover:-translate-y-2 transition-transform duration-500 flex flex-col items-center">
                  <span className="text-[10px] font-black text-blue-100 uppercase tracking-[4px] mb-4">Prefix</span>
                  <span className="text-4xl md:text-5xl font-black text-white">{result.prefix.morpheme}</span>
                  <div className="mt-6 bg-blue-700/50 px-4 py-2 rounded-2xl text-[11px] font-bold text-blue-50 text-center max-w-[150px]">
                    {result.prefix.meaning}
                  </div>
                </div>
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-blue-200 opacity-50 hidden md:block">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                </div>
              </div>
            )}

            {/* Root */}
            <div className="group relative">
              <div className="bg-emerald-600 p-6 md:p-12 rounded-[40px] shadow-2xl shadow-emerald-200 transform hover:-translate-y-2 transition-transform duration-500 flex flex-col items-center ring-8 ring-emerald-50">
                <span className="text-[10px] font-black text-emerald-100 uppercase tracking-[4px] mb-4">Root (Gốc từ)</span>
                <span className="text-5xl md:text-6xl font-black text-white italic">{result.root.morpheme}</span>
                <div className="mt-6 bg-emerald-700/50 px-4 py-2 rounded-2xl text-[11px] font-bold text-emerald-50 text-center max-w-[200px]">
                  {result.root.meaning}
                </div>
              </div>
            </div>

            {/* Suffix */}
            {result.suffix && (
              <div className="group relative">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-orange-200 opacity-50 hidden md:block">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                </div>
                <div className="bg-orange-600 p-6 md:p-10 rounded-[40px] shadow-2xl shadow-orange-200 transform hover:-translate-y-2 transition-transform duration-500 flex flex-col items-center">
                  <span className="text-[10px] font-black text-orange-100 uppercase tracking-[4px] mb-4">Suffix</span>
                  <span className="text-4xl md:text-5xl font-black text-white">{result.suffix.morpheme}</span>
                  <div className="mt-6 bg-orange-700/50 px-4 py-2 rounded-2xl text-[11px] font-bold text-orange-50 text-center max-w-[150px]">
                    {result.suffix.meaning}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Word Family Section */}
          <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L4 9v12h16V9l-8-6zm0 2.5L18.5 10H5.5L12 5.5zM6 11h12v8H6v-8z"/></svg>
            </div>
            
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[5px] mb-8 text-center">Word Family (Họ từ liên quan)</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {result.family.map((f, i) => (
                <div 
                  key={i} 
                  className="px-8 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 font-black hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-default shadow-sm"
                >
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Placeholder / Welcome */}
      {!result && !isLoading && !error && (
        <div className="py-20 flex flex-col items-center text-center space-y-6 opacity-30 select-none">
          <svg className="w-24 h-24 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-800">Word Formation Lab</h3>
            <p className="font-bold text-slate-500">Nhập một từ bất kỳ để khám phá cấu trúc ngôn ngữ của nó</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordFormationPanel;
