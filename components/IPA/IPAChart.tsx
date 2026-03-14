import React from 'react';
import { IPASound, ipaSounds } from '../../data/ipaData';

interface IPAChartProps {
  onSelectSound: (sound: IPASound) => void;
}

const IPAChart: React.FC<IPAChartProps> = ({ onSelectSound }) => {
  const monophthongs = ipaSounds.filter(s => s.type === 'monophthong');
  const diphthongs = ipaSounds.filter(s => s.type === 'diphthong');
  const consonants = ipaSounds.filter(s => s.type === 'consonant');

  const renderSoundBox = (sound: IPASound, additionalClasses: string = "") => {
    const isVoiced = sound.voiced;
    
    let baseStyles = `relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl hover:z-10 aspect-square ${additionalClasses} `;
    
    if (sound.type === 'monophthong' || sound.type === 'diphthong') {
      baseStyles += "bg-amber-50 border-amber-200 text-slate-800 hover:border-amber-400 hover:bg-amber-100 ";
    } else if (isVoiced) {
      baseStyles += "bg-blue-50 border-blue-200 text-slate-800 hover:border-blue-400 hover:bg-blue-100 ";
    } else {
      baseStyles += "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-400 hover:bg-slate-100 ";
    }

    return (
      <div 
        key={sound.symbol} 
        onClick={() => onSelectSound(sound)}
        className={baseStyles}
        title={sound.description}
      >
        <span className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif leading-none mb-1 text-slate-800">{sound.symbol}</span>
        <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-slate-500 truncate w-full text-center px-1">
          {sound.examples[0]}
        </span>
        
        {/* Voiced indicator dot for consonants */}
        {sound.type === 'consonant' && (
          <div 
            className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
              sound.voiced ? 'bg-blue-400' : 'bg-slate-300'
            }`} 
            title={sound.voiced ? 'Voiced (Hữu thanh)' : 'Unvoiced (Vô thanh)'}
          />
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      
      {/* Vowels Section */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-b border-amber-100/50">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Monophthongs (12) - 4x3 Grid */}
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-800 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Nguyên Âm Đơn (Monophthongs)
            </h3>
            {/* 4 columns x 3 rows to match standard IPA chart */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {monophthongs.map(sound => renderSoundBox(sound))}
            </div>
          </div>

          {/* Diphthongs (8) - 3x3 Grid with an empty slot */}
          <div className="md:w-1/3">
            <h3 className="text-sm font-bold text-amber-800 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Nguyên Âm Đôi (Diphthongs)
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {diphthongs.map(sound => renderSoundBox(sound))}
              <div className="hidden sm:block aspect-square"></div> {/* Empty slot for alignment if needed, standard chart has 8 diphthongs */}
            </div>
          </div>

        </div>
      </div>

      {/* Consonants Section */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50/50 to-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
           <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Phụ Âm (Consonants)
           </h3>
           <div className="flex flex-wrap gap-3">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100/50 rounded-lg border border-blue-200/50">
               <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
               <span className="text-xs font-bold text-blue-800">Hữu thanh (Voiced)</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-lg border border-slate-200">
               <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
               <span className="text-xs font-bold text-slate-700">Vô thanh (Unvoiced)</span>
             </div>
           </div>
        </div>
        
        {/* Consonants (24) - standard layout pairs */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
          {consonants.map(sound => renderSoundBox(sound))}
        </div>
      </div>

    </div>
  );
};

export default IPAChart;
