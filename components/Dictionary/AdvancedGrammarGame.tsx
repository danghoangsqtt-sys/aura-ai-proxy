import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { wordStressRules, partsOfSpeechRules } from '../../data/grammarGuidesData';

type GameMode = 'stress-tap' | 'contextual-pos';

interface Question {
  type: GameMode;
  word?: string; // For stress-tap
  syllables?: string[]; // For stress-tap
  correctSyllableIndex?: number; // For stress-tap
  sentence?: string; // For contextual-pos
  highlightWord?: string; // For contextual-pos
  options?: string[]; // For contextual-pos
  correctOption?: string; // For contextual-pos
}

const AdvancedGrammarGame: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [mode, setMode] = useState<GameMode>('stress-tap');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const generateQuestions = useCallback((selectedMode: GameMode) => {
    const newQuestions: Question[] = [];
    if (selectedMode === 'stress-tap') {
      // Pick 10 random words from stress rules and split into syllables
      // In a real app, you'd have more data or a syllable splitter. 
      // Here we'll map existing examples to syllable structures manually for the game.
      const pool = wordStressRules.flatMap(r => r.examples);
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
      
      shuffled.forEach(ex => {
        const parts = ex.stressedWord.split('-');
        const correctIdx = parts.findIndex(p => p === p.toUpperCase());
        newQuestions.push({
          type: 'stress-tap',
          word: ex.word,
          syllables: parts.map(p => p.toLowerCase()),
          correctSyllableIndex: correctIdx
        });
      });
    } else {
      // Pick 10 random POS positions
      const pool = partsOfSpeechRules.flatMap(r => r.positions.map(p => ({ ...p, type: r.type.split(' ')[0] })));
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
      
      shuffled.forEach(pos => {
        newQuestions.push({
          type: 'contextual-pos',
          sentence: pos.example.replace(/\*\*(.*?)\*\*/g, '$1'),
          highlightWord: pos.example.match(/\*\*(.*?)\*\*/)?.[1] || '',
          options: ['Danh từ', 'Động từ', 'Tính từ', 'Trạng từ'],
          correctOption: pos.type
        });
      });
    }
    setQuestions(newQuestions);
  }, []);

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    generateQuestions(selectedMode);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameState('playing');
    setFeedback(null);
    console.info(`[AdvancedGrammarGame] -> [Action]: Started ${selectedMode} session.`);
  };

  const handleAnswer = (index: number | string) => {
    if (feedback) return;

    const currentQ = questions[currentQuestionIndex];
    let isCorrect = false;

    if (mode === 'stress-tap') {
      isCorrect = index === currentQ.correctSyllableIndex;
    } else {
      isCorrect = index === currentQ.correctOption;
    }

    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback({ isCorrect: true, message: 'Chính xác! 🎉' });
    } else {
      const correctText = mode === 'stress-tap' 
        ? currentQ.syllables![currentQ.correctSyllableIndex!].toUpperCase() 
        : currentQ.correctOption;
      setFeedback({ isCorrect: false, message: `Sai rồi. Đáp án đúng là: ${correctText}` });
    }
    
    console.info(`[AdvancedGrammarGame] -> [Result]: ${isCorrect ? 'Correct' : 'Incorrect'}`);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setFeedback(null);
    } else {
      setGameState('result');
      console.info(`[AdvancedGrammarGame] -> [Finish]: Score ${score}/${questions.length}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30 rounded-3xl p-6 border border-slate-100/50 relative overflow-hidden">
      {gameState === 'menu' && (
        <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in zoom-in duration-500">
          <div className="text-center">
            <h2 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Grammar Master</h2>
            <p className="text-slate-500 font-bold">Thử thách trình độ ngữ pháp và phát âm hạng nặng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <button 
              onClick={() => startGame('stress-tap')}
              className="p-8 bg-white border-2 border-slate-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:border-indigo-500 hover:-translate-y-2 transition-all duration-300 group text-left"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors">
                <svg className="w-6 h-6 text-indigo-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-indigo-600">Syllable Stress Tap</h3>
              <p className="text-xs font-bold text-slate-400">Chọn chính xác âm tiết nhận trọng âm trong từ được bóc tách.</p>
            </button>

            <button 
              onClick={() => startGame('contextual-pos')}
              className="p-8 bg-white border-2 border-slate-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:border-blue-500 hover:-translate-y-2 transition-all duration-300 group text-left"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                <svg className="w-6 h-6 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-blue-600">Contextual POS</h3>
              <p className="text-xs font-bold text-slate-400">Xác định từ loại của từ được bôi đậm dựa trên ngữ cảnh câu.</p>
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-xl font-black text-sm">{currentQuestionIndex + 1}</span>
              <div className="h-2 w-48 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Score: {score}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto w-full">
            {mode === 'stress-tap' ? (
              <div className="w-full">
                <h3 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em] mb-6 underline decoration-indigo-500 decoration-4 underline-offset-8">Click the stressed syllable</h3>
                <h2 className="text-5xl font-black text-slate-900 mb-12 tracking-tight">{questions[currentQuestionIndex].word}</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {questions[currentQuestionIndex].syllables?.map((syl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={!!feedback}
                      className={`px-8 py-4 rounded-3xl text-2xl font-black uppercase tracking-widest border-2 transition-all duration-300 ${
                        feedback 
                          ? idx === questions[currentQuestionIndex].correctSyllableIndex 
                            ? 'bg-green-500 border-green-500 text-white shadow-xl shadow-green-200'
                            : 'bg-white border-slate-100 text-slate-300'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 hover:-translate-y-1'
                      }`}
                    >
                      {syl}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full">
                <h3 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em] mb-8">Identify Part of Speech</h3>
                <div className="p-10 bg-white border border-slate-100 rounded-[48px] shadow-sm mb-12 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
                  <p className="text-2xl font-bold text-slate-700 leading-relaxed italic">
                    "{questions[currentQuestionIndex].sentence?.split(questions[currentQuestionIndex].highlightWord || '').map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span className="text-blue-600 px-2 py-1 bg-blue-50 rounded-lg font-black border-b-4 border-blue-200">{questions[currentQuestionIndex].highlightWord}</span>
                        )}
                      </React.Fragment>
                    ))}"
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                  {questions[currentQuestionIndex].options?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      disabled={!!feedback}
                      className={`py-4 rounded-3xl font-black uppercase text-sm border-2 transition-all duration-300 ${
                        feedback 
                          ? opt === questions[currentQuestionIndex].correctOption 
                            ? 'bg-green-500 border-green-500 text-white shadow-lg'
                            : 'bg-white border-slate-100 text-slate-300'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {feedback && (
            <div className="absolute inset-x-0 bottom-24 flex justify-center animate-in slide-in-from-bottom duration-300">
              <div className={`px-10 py-5 rounded-[32px] shadow-2xl flex flex-col items-center ${feedback.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                <p className="text-lg font-black">{feedback.message}</p>
                <button 
                  onClick={nextQuestion}
                  className="mt-3 px-6 py-2 bg-white text-slate-900 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === 'result' && (
        <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in zoom-in duration-500">
          <div className="relative">
            <div className="w-56 h-56 rounded-full border-[12px] border-slate-100 flex items-center justify-center">
              <span className="text-7xl font-black text-slate-900">{score}<span className="text-2xl text-slate-300">/10</span></span>
            </div>
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-900 uppercase">Hoàn thành!</h2>
            <p className="text-slate-500 font-bold mt-2">{score >= 8 ? 'Bạn là bậc thầy ngữ pháp!' : 'Hãy cố gắng hơn ở lượt tới nhé.'}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setGameState('menu')}
              className="px-10 py-5 bg-slate-900 text-white rounded-full font-black uppercase text-xs tracking-widest shadow-xl hover:shadow-slate-300 hover:scale-105 transition-all"
            >
              Về Menu
            </button>
            <button 
              onClick={() => startGame(mode)}
              className="px-10 py-5 bg-indigo-500 text-white rounded-full font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:shadow-indigo-300 hover:scale-105 transition-all"
            >
              Chơi lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedGrammarGame;
