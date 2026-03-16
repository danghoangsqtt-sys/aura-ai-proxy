
import React, { useState, useEffect, useRef } from 'react';
import { analyzeLanguage, DictionaryResponse } from '../services/geminiService';
import { fetchExternalDictionary, ExternalWordData } from '../services/externalDictionaryService';
import WordFormationGuide from './Dictionary/WordFormationGuide';
import PartsOfSpeechGuide from './Dictionary/PartsOfSpeechGuide';
import WordStressGuide from './Dictionary/WordStressGuide';
import GrammarArena from './Dictionary/GrammarArena';
import VocabBankCanvas from './Dictionary/VocabBankCanvas';
import { canvasStorage } from '../services/localDataService';
import { SavedWord } from '../types';
import { runAntigravityTests } from '../utils/antigravityTester';

type DictionaryTab = 'lookup' | 'formation' | 'pos' | 'stress' | 'vocab-canvas' | 'adv-game';

const DictionaryPanel: React.FC = () => {
  const [viewMode, setViewMode] = useState<DictionaryTab>('lookup');
  
  useEffect(() => {
    runAntigravityTests();
  }, []);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // States cho 2 nguồn dữ liệu
  const [externalData, setExternalData] = useState<ExternalWordData | null>(null);
  const [aiData, setAiData] = useState<DictionaryResponse | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Autocomplete gợi ý từ
  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 2 || trimmedQuery.includes(' ')) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(trimmedQuery)}&max=6`);
        if (res.ok) {
          const json = await res.json();
          setSuggestions(json.map((item: any) => item.word));
          setShowSuggestions(true);
        }
      } catch (e) { setSuggestions([]); }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Đóng gợi ý khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (textInput: string = query) => {
    const text = textInput.trim();
    if (!text) return;

    setLoading(true);
    setShowSuggestions(false);
    setExternalData(null);
    setAiData(null);

    // Kiểm tra xem là từ đơn hay câu
    const isSingleWord = text.split(' ').length === 1;

    if (isSingleWord) {
      const extResult = await fetchExternalDictionary(text);
      if (extResult) {
        setExternalData(extResult);
        setLoading(false);
        return;
      }
    }

    // Nếu không tìm thấy trong từ điển hoặc là câu văn -> Gọi AI ngay
    handleAiAnalyze(text);
    setLoading(false);
  };

  const handleAiAnalyze = async (textInput: string = query) => {
    setAiLoading(true);
    try {
      const result = await analyzeLanguage(textInput);
      setAiData(result);
    } catch (error) {
      setAiData({ type: 'not_found' });
    } finally {
      setAiLoading(false);
    }
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveToCanvas = async (word: string, meaning: string, ipa: string, pos?: string, example?: string) => {
    try {
      const currentData = await canvasStorage.get();
      const newWord: SavedWord = {
        id: `word_${Date.now()}`,
        word,
        meaning,
        ipa,
        partOfSpeech: pos,
        example,
        pronunciation: ipa
      };

      await canvasStorage.save({
        ...currentData,
        inbox: [newWord, ...currentData.inbox]
      });
      alert(`Đã lưu "${word}" vào Hộp thư Sổ tay!`);
    } catch (e) {
      alert("Lỗi khi lưu từ vựng.");
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 flex flex-col h-full animate-in fade-in duration-500 overflow-hidden relative" ref={wrapperRef}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3">
             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none italic uppercase">EduGen <span className="text-indigo-600">Lexicon</span></h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[4px] mt-1.5">Tra cứu tích hợp & Phân tích AI</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shrink-0 overflow-x-auto no-scrollbar gap-1">
          {[
            { id: 'lookup', label: 'Tra từ', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
            { id: 'formation', label: 'Cấu tạo từ', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
            { id: 'pos', label: 'Từ loại', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
            { id: 'stress', label: 'Trọng âm', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> },
            { id: 'vocab-canvas', label: 'Bản đồ Sổ tay', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> },
            { id: 'adv-game', label: 'Luyện tập', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                console.info('[DictionaryPanel] -> [Navigation]: Switched to tab:', tab.id);
                setViewMode(tab.id as DictionaryTab);
              }}
              className={`px-4 py-2 text-[10px] whitespace-nowrap font-black rounded-xl transition-all flex items-center gap-2 ${
                viewMode === tab.id ? 'bg-white shadow-lg text-indigo-600 scale-105' : 'text-slate-500 hover:text-indigo-500 hover:bg-white/50'
              }`}
            >
              {tab.icon}
              <span className="uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lookup view elements (Search & Results) */}
      {viewMode === 'lookup' && (
        <>
          {/* Search Input Area */}
          <div className="relative mb-6 shrink-0 z-50 animate-in slide-in-from-top-4 duration-500">
            <div className="group relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Nhập từ vựng hoặc câu văn..."
                className="w-full pl-6 pr-16 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[15px] font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
              />
              <button
                onClick={() => handleSearch()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              </button>
            </div>

            {/* Autocomplete */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                {suggestions.map((s, idx) => (
                  <button key={idx} onClick={() => { setQuery(s); handleSearch(s); }} className="w-full px-6 py-3 text-left text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-b border-slate-50 last:border-0">{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Main Results Content (Wrapped for scrolling if needed, though main container handles it) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
            {!externalData && !aiData && !loading && !aiLoading && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 grayscale">
                <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <p className="text-[10px] font-black uppercase tracking-[8px]">Sẵn sàng tra cứu</p>
              </div>
            )}

            {/* 1. KẾT QUẢ TỪ ĐIỂN NGOÀI */}
            {externalData && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-900 rounded-[30px] p-8 text-white relative overflow-hidden shadow-xl">
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                          <h1 className="text-4xl font-black tracking-tighter">{externalData.word}</h1>
                          <span className="text-indigo-400 font-serif italic text-lg">{externalData.phonetic}</span>
                      </div>
                      <div className="flex gap-2">
                          {externalData.phonetics.map((p, i) => p.audio && (
                            <button key={i} onClick={() => playAudio(p.audio!)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>
                              Phát âm
                            </button>
                          ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSaveToCanvas(
                        externalData.word, 
                        externalData.meanings[0].definitions[0].definition, 
                        externalData.phonetic || '',
                        externalData.meanings[0].partOfSpeech
                      )}
                      className="bg-indigo-500 hover:bg-white hover:text-indigo-600 text-white px-5 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg text-[10px] font-black uppercase tracking-widest"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      Lưu vào Sổ tay
                    </button>
                  </div>
                  <div className="absolute -right-8 -bottom-8 opacity-10">
                    <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  </div>
                </div>
                {/* Meanings */}
                <div className="space-y-4">
                  {externalData.meanings.map((m, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 inline-block">{m.partOfSpeech}</span>
                      <div className="space-y-4">
                        {m.definitions.slice(0, 3).map((d, di) => (
                          <div key={di} className="space-y-1">
                            <p className="text-[15px] font-bold text-slate-800 leading-snug">● {d.definition}</p>
                            {d.example && <p className="text-sm font-medium text-slate-500 italic pl-5">"{d.example}"</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* AI Trigger */}
                <div className="pt-4 flex justify-center">
                  <button onClick={() => handleAiAnalyze()} disabled={aiLoading} className="group flex items-center gap-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-8 py-4 rounded-2xl transition-all shadow-lg active:scale-95">
                    {aiLoading ? <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin"></div> : <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    <div className="text-left"><p className="text-[10px] font-black uppercase tracking-widest leading-none">Phân tích sâu với AI</p><p className="text-[8px] font-bold opacity-60 uppercase mt-1">Giải nghĩa tiếng Việt & Ngữ pháp</p></div>
                  </button>
                </div>
              </div>
            )}

            {/* 2. KẾT QUẢ TỪ AI */}
            {aiData && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {aiData.type === 'not_found' ? (
                  <div className="text-center py-10 opacity-40 grayscale"><p className="text-[10px] font-black uppercase tracking-widest">Không tìm thấy thông tin bổ sung</p></div>
                ) : (
                  <>
                    {(aiData.type === 'sentence' || aiData.type === 'phrase' || aiData.translation) && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-[35px] p-8 shadow-sm">
                        <h3 className="text-[9px] font-black text-emerald-600 uppercase tracking-[5px] mb-4 flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>Bản dịch ngữ cảnh (AI)</h3>
                        <p className="text-2xl font-bold text-slate-800 leading-tight">{aiData.translation}</p>
                        {aiData.correction && <div className="mt-6 pt-6 border-t border-emerald-200/50"><p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2">Đề xuất tối ưu văn phong:</p><p className="text-xl font-black text-rose-600 italic">“{aiData.correction}”</p></div>}
                      </div>
                    )}
                    {aiData.type === 'word' && aiData.meanings && !externalData && (
                      <div className="space-y-4">
                        <div className="flex justify-end pr-4">
                            <button 
                                onClick={() => handleSaveToCanvas(
                                    aiData.word || query, 
                                    aiData.meanings![0].def, 
                                    aiData.ipa || '',
                                    aiData.meanings![0].partOfSpeech
                                )}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-900"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                Lưu vào Sổ tay
                            </button>
                        </div>
                        {aiData.meanings.map((m, i) => (
                          <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase mb-3 inline-block">{m.partOfSpeech}</span><p className="text-[15px] font-bold text-slate-800 mb-2">{m.def}</p><p className="text-sm font-medium text-slate-500 italic">Example: "{m.example}"</p></div>
                        ))}
                      </div>
                    )}
                    {aiData.grammarAnalysis && aiData.grammarAnalysis.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[4px] px-2">Báo cáo ngữ pháp</h4>
                        {aiData.grammarAnalysis.map((g, i) => (
                          <div key={i} className="bg-white rounded-2xl p-6 border-l-4 border-indigo-500 shadow-sm"><div className="flex flex-wrap items-center gap-3 mb-3"><span className="text-rose-500 font-bold line-through text-sm">{g.error}</span><svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg><span className="text-emerald-600 font-bold text-sm">{g.fix}</span></div><p className="text-[13px] font-medium text-slate-600 leading-relaxed">{g.explanation}</p></div>
                        ))}
                      </div>
                    )}
                    {(aiData.structure || aiData.usageNotes) && (
                      <div className="bg-slate-900 rounded-[35px] p-8 text-white shadow-2xl space-y-6">
                        {aiData.structure && (<div><h5 className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2">Cấu trúc câu (Structure)</h5><code className="text-xs font-mono bg-white/10 px-4 py-2 rounded-xl block border border-white/5">{aiData.structure}</code></div>)}
                        {aiData.usageNotes && (<div><h5 className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-2">Lưu ý mở rộng</h5><p className="text-xs font-medium text-slate-300 leading-relaxed">{aiData.usageNotes}</p></div>)}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Guide & Game Content View */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${viewMode === 'lookup' ? 'hidden' : 'block'}`}>
        {/* Word Formation Guide Mode */}
        {viewMode === 'formation' && (
          <div className="h-full animate-in slide-in-from-right duration-500">
            <WordFormationGuide />
          </div>
        )}

        {/* Parts of Speech Guide Mode */}
        {viewMode === 'pos' && (
          <div className="h-full animate-in slide-in-from-right duration-500">
            <PartsOfSpeechGuide />
          </div>
        )}

        {/* Word Stress Guide Mode */}
        {viewMode === 'stress' && (
          <div className="h-full animate-in slide-in-from-right duration-500">
            <WordStressGuide />
          </div>
        )}

        {/* Personal Vocab Canvas Mode */}
        {viewMode === 'vocab-canvas' && (
          <div className="h-full animate-in slide-in-from-right duration-500">
            <VocabBankCanvas />
          </div>
        )}

        {/* Advanced Grammar Game Mode (Grammar Arena) */}
        {viewMode === 'adv-game' && (
          <div className="h-full animate-in slide-in-from-right duration-500">
            <GrammarArena />
          </div>
        )}
      </div>

      {/* Loading Loading States Overlay */}
      {(loading || aiLoading) && viewMode === 'lookup' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-indigo-100 px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></div>
          <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">
            {loading ? "Đang truy vấn dữ liệu..." : "AI đang tư duy..."}
          </span>
        </div>
      )}

      
      {/* Footer Status */}
      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[8px] font-black text-slate-300 uppercase tracking-widest shrink-0">
        <div className="flex gap-4">
           <span className={externalData ? "text-emerald-500" : ""}>Dictionary API</span>
           <span className={aiData ? "text-indigo-500" : ""}>Gemini 3.0</span>
        </div>
        <span>DHsystem Engine 2026</span>
      </div>
    </div>
  );
};

export default DictionaryPanel;
