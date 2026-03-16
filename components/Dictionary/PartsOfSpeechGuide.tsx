import React from 'react';
import { partsOfSpeechRules } from '../../data/grammarGuidesData';

const PartsOfSpeechGuide: React.FC = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50/30 rounded-3xl p-6 border border-slate-100/50 animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {partsOfSpeechRules.map((pos, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
            >
              <h3 className="text-xl font-black text-indigo-600 mb-6 uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                {pos.type}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column: Suffixes */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Hậu tố nhận biết</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {pos.suffixes.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-600">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Column: Positions */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Vị trí & Ví dụ</h4>
                  <div className="space-y-4">
                    {pos.positions.map((p, pIdx) => (
                      <div key={pIdx} className="group/pos">
                        <p className="text-[11px] font-bold text-slate-500 mb-1 leading-snug group-hover/pos:text-indigo-500 transition-colors">
                          • {p.rule}
                        </p>
                        <p className="text-[12px] font-medium text-slate-700 italic bg-blue-50/50 p-2 rounded-xl border border-blue-100/30" dangerouslySetInnerHTML={{ __html: p.example.replace(/\*\*(.*?)\*\*/g, '<span class="text-indigo-600 font-black">$1</span>') }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[4px]">Linguistic Structure • Word Classes Dashboard</p>
      </div>
    </div>
  );
};

export default PartsOfSpeechGuide;
