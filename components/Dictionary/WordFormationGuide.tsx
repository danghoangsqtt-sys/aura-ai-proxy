import React, { useState, useMemo } from 'react';
import { morphemesData, Morpheme } from '../../data/wordFormationData';

const WordFormationGuide: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'prefix' | 'root' | 'suffix'>('all');

  const filteredData = useMemo(() => {
    return morphemesData.filter(item => {
      const matchesSearch = 
        item.morpheme.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.examples.some(ex => ex.word.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [searchTerm, typeFilter]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden bg-slate-50/30 rounded-3xl p-6 border border-slate-100/50">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 shrink-0">
        <div className="relative flex-1 group">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Tìm kiếm gốc từ, tiền tố hoặc ví dụ..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300 placeholder:font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex bg-slate-200/50 p-1 rounded-2xl backdrop-blur-sm shrink-0">
          {(['all', 'prefix', 'root', 'suffix'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                typeFilter === type ? 'bg-white shadow-xl shadow-indigo-100 text-indigo-600' : 'text-slate-500 hover:text-indigo-500'
              }`}
            >
              {type === 'all' ? 'Tất cả' : type + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredData.map((item) => (
              <div 
                key={item.id} 
                className="group bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col">
                    <span className={`text-3xl font-black tracking-tighter ${
                      item.type === 'prefix' ? 'text-blue-600' : 
                      item.type === 'root' ? 'text-emerald-600' : 'text-orange-600'
                    }`}>
                      {item.morpheme}
                    </span>
                    {item.origin && (
                      <span className="text-[10px] font-bold text-slate-300 italic -mt-1">{item.origin}</span>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    item.type === 'prefix' ? 'bg-blue-50 text-blue-500' : 
                    item.type === 'root' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'
                  }`}>
                    {item.type}
                  </span>
                </div>
                
                <div className="mb-5">
                  <p className="text-[14px] font-bold text-slate-800 leading-snug">{item.meaning}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ví dụ tiêu biểu:</p>
                  <div className="space-y-2">
                    {item.examples.map((ex, exIdx) => (
                      <div key={exIdx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl group/ex hover:bg-indigo-50/50 hover:border-indigo-100 transition-all duration-300">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[13px] font-black text-indigo-600 group-hover/ex:scale-105 transition-transform origin-left">{ex.word}</span>
                          <span className="text-[11px] font-bold text-slate-500">{ex.meaning}</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 font-mono tracking-tight">{ex.breakdown}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Không tìm thấy kết quả</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center px-2">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[4px]">Etymology Ecosystem • Modern Linguistics</p>
        <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest italic">{filteredData.length} entries matching</p>
      </div>
    </div>
  );
};

export default WordFormationGuide;
