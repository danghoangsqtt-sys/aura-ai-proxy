import React, { useState, useEffect, useCallback } from 'react';
import { IPASound } from '../../data/ipaData';
import { TTSService } from '../../services/ttsService';

interface IPAQuizProps {
  sound: IPASound;
}

interface Question {
  wordToSpeak: string;
  options: string[];
}

const IPAQuiz: React.FC<IPAQuizProps> = ({ sound }) => {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateQuestion = useCallback(() => {
    let wordToSpeak = '';
    let options: string[] = [];

    if (sound.minimalPairs && sound.minimalPairs.length > 0) {
      // Pick a random minimal pair
      const randomPair = sound.minimalPairs[Math.floor(Math.random() * sound.minimalPairs.length)];
      options = [randomPair.word1, randomPair.word2];
      
      // Randomly shuffle options for display
      options.sort(() => Math.random() - 0.5);
      
      // Randomly pick one to speak
      wordToSpeak = options[Math.floor(Math.random() * options.length)];
    } else {
      // Fallback to examples if no minimal pairs exist
      // Need at least 2 examples to form options
      if (sound.examples.length >= 2) {
        options = [...sound.examples].sort(() => Math.random() - 0.5).slice(0, 2);
        wordToSpeak = options[Math.floor(Math.random() * options.length)];
      } else {
        // Safe fallback if not enough examples
        options = [sound.examples[0] || 'apple', 'banana'];
        wordToSpeak = sound.examples[0] || 'apple';
      }
    }

    setCurrentQuestion({ wordToSpeak, options });
    setFeedback(null);
  }, [sound]);

  useEffect(() => {
    setScore(0);
    generateQuestion();
    
    // Cleanup speech synth on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [sound, generateQuestion]);

  // Dùng TTSService (giọng nữ Google Aura) để phát âm từ IPA quiz
  const playSound = useCallback(() => {
    if (!currentQuestion) return;
    setIsPlaying(true);
    TTSService.getInstance().speak(
      currentQuestion.wordToSpeak,
      undefined,
      () => setIsPlaying(false)  // onEnd callback
    );
  }, [currentQuestion]);


  // Auto-play when question changes
  useEffect(() => {
    if (currentQuestion && feedback === null) {
      // Small delay so the user realizes a new question started before it speaks
      const timer = setTimeout(() => {
        playSound();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, feedback, playSound]);

  const handleAnswer = (selectedWord: string) => {
    if (feedback !== null || !currentQuestion) return; // Prevent multiple clicks

    if (selectedWord === currentQuestion.wordToSpeak) {
      setFeedback('correct');
      setScore(prev => prev + 1);
    } else {
      setFeedback('incorrect');
      // Reset score on fail for "survival" mode (optional, but requested simple score increment)
      // I'll keep just incrementing for now, survival implies game over, but instructions say "update score"
    }

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      generateQuestion();
    }, 1500);
  };

  if (!currentQuestion) return null;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center h-full min-h-[400px] animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8 px-4">
        <h3 className="text-xl font-bold text-slate-800">
          Luyện Tai <span className="text-slate-400 font-normal">| Âm /{sound.symbol}/</span>
        </h3>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-100 rounded-full border border-amber-200">
          <span className="text-amber-600 font-black">🔥 Điểm:</span>
          <span className="text-xl font-black text-amber-700">{score}</span>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex flex-col items-center w-full bg-slate-50 border border-slate-200 rounded-3xl p-8 relative overflow-hidden">
        
        {/* Play Button */}
        <button
          onClick={playSound}
          disabled={isPlaying}
          className={`relative w-32 h-32 rounded-full mb-10 flex items-center justify-center transition-all duration-300 shadow-xl
            ${isPlaying 
              ? 'bg-indigo-200 text-indigo-500 scale-95 shadow-indigo-200/50' 
              : 'bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-105 hover:shadow-indigo-500/30 active:scale-95'
            }
          `}
        >
          {/* Ripple effect when playing */}
          {isPlaying && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-400 opacity-50 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-2 border-indigo-300 opacity-30 animate-ping delay-200"></div>
            </>
          )}
          <svg className="w-16 h-16 ml-2" fill="currentColor" viewBox="0 0 20 20">
             <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
          </svg>
        </button>

        <p className="text-slate-500 font-medium mb-6 text-center">Nghe thật kỹ và chọn từ bạn vừa nghe thấy</p>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {currentQuestion.options.map((option, idx) => {
            let btnClass = "px-6 py-5 text-2xl font-bold rounded-2xl border-2 transition-all duration-200 shadow-sm outline-none focus:ring-4 relative overflow-hidden group ";
            
            if (feedback === null) {
              btnClass += "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 focus:ring-indigo-100 active:scale-95";
            } else {
                // Determine styling after answer is clicked
                if (option === currentQuestion.wordToSpeak) {
                    // This is the correct answer
                    btnClass += feedback === 'correct' 
                        ? "bg-emerald-500 border-emerald-600 text-white scale-105 shadow-emerald-500/40 z-10" 
                        : "bg-emerald-100 border-emerald-300 text-emerald-700"; // Missed correct answer
                } else {
                    // This is the wrong answer
                    btnClass += feedback === 'incorrect' && option !== currentQuestion.wordToSpeak
                        ? "bg-rose-50 border-rose-200 text-rose-300 opacity-50" // Other wrong answer
                        : "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
                }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={feedback !== null}
                className={btnClass}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback Area */}
        <div className={`mt-8 h-12 flex items-center justify-center w-full rounded-xl transition-all duration-300 ${
          feedback === 'correct' ? 'bg-emerald-100 text-emerald-700 font-bold opacity-100 translate-y-0' :
          feedback === 'incorrect' ? 'bg-rose-100 text-rose-700 font-bold opacity-100 translate-y-0' : 
          'opacity-0 translate-y-4'
        }`}>
          {feedback === 'correct' && "Chính xác! 🎉"}
          {feedback === 'incorrect' && "Chưa đúng, thử lại nhé! ❌"}
        </div>
      </div>
    </div>
  );
};

export default IPAQuiz;
