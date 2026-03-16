import React from 'react';
import { wordStressRules } from '../../data/grammarGuidesData';

const WordStressGuide: React.FC = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50/30 rounded-3xl p-6 border border-slate-100/50 animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {wordStressRules.map((rule) => (
            <div 
              key={rule.id} 
              className="group bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-500 flex flex-col"
            >
              <div className="mb-4">
                <h4 className="text-sm font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                  {rule.rule}
                </h4>
                <div className="h-1 w-12 bg-indigo-500 rounded-full mt-2" />
              </div>
              
              <p className="text-[12px] font-bold text-slate-500 leading-relaxed mb-6">
                {rule.description}
              </p>

              <div className="mt-auto space-y-2">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">Ví dụ minh họa:</p>
                <div className="grid grid-cols-1 gap-2">
                  {rule.examples.map((ex, idx) => (
                   <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl group/ex hover:bg-slate-900 hover:border-slate-800 transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] font-black tracking-widest uppercase text-slate-800 group-hover/ex:text-white transition-colors" dangerouslySetInnerHTML={{ __html: ex.stressedWord.replace(/([A-Z]{2,})/g, '<mark class="bg-indigo-600 text-white px-1.5 py-0.5 rounded-lg">$1</mark>') }} />
                        <span className="text-[10px] font-bold text-slate-400 group-hover/ex:text-slate-500">{ex.meaning}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[4px]">Phonetic Rules • Pronunciation Expert</p>
      </div>
    </div>
  );
};

export default WordStressGuide;
