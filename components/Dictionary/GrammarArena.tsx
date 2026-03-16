import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Question, 
  grammarArenaQuestions, 
  QuestionType,
  MCQQuestion,
  MatchingQuestion,
  FillBlankQuestion,
  ContextPOSQuestion,
  StressTapQuestion
} from '../../data/grammarArenaData';
import { X, CheckCircle2, XCircle, ArrowRight, RotateCcw, HelpCircle, LayoutGrid, Type, Waves } from 'lucide-react';

const GrammarArena: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'explanation' | 'result'>('menu');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; show: boolean } | null>(null);

  // Matching specific state
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ left: string; right: string }[]>([]);
  const [failedMatch, setFailedMatch] = useState<boolean>(false);

  const startNewGame = useCallback((topic?: 'word-formation' | 'pos' | 'stress') => {
    let pool = [...grammarArenaQuestions];
    if (topic) pool = pool.filter(q => q.topic === topic);
    
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setGameState('playing');
    setFeedback(null);
    setUserAnswer(null);
    setMatchedPairs([]);
    console.info(`[GrammarArena] -> [Action]: Started game session with ${shuffled.length} questions.`);
  }, []);

  const handleMCQ = (choice: string) => {
    const q = questions[currentIdx] as MCQQuestion;
    const correct = choice === q.correctAnswer;
    setFeedback({ isCorrect: correct, show: true });
    if (correct) setScore(s => s + 1);
    setUserAnswer(choice);
  };

  const handleFillBlank = (choice: string) => {
    const q = questions[currentIdx] as FillBlankQuestion;
    const correct = choice === q.correctAnswer;
    setFeedback({ isCorrect: correct, show: true });
    if (correct) setScore(s => s + 1);
    setUserAnswer(choice);
  };

  const handleContextPOS = (pos: string) => {
    const q = questions[currentIdx] as ContextPOSQuestion;
    const correct = pos === q.correctPOS;
    setFeedback({ isCorrect: correct, show: true });
    if (correct) setScore(s => s + 1);
    setUserAnswer(pos);
  };

  const handleStressTap = (idx: number) => {
    const q = questions[currentIdx] as StressTapQuestion;
    const correct = idx === q.correctStressIndex;
    setFeedback({ isCorrect: correct, show: true });
    if (correct) setScore(s => s + 1);
    setUserAnswer(idx);
  };

  const handleMatching = (item: string, side: 'left' | 'right') => {
    if (feedback?.show) return;

    if (side === 'left') {
      setSelectedLeft(item);
    } else {
      if (!selectedLeft) return;
      
      const q = questions[currentIdx] as MatchingQuestion;
      const pair = q.pairs.find(p => p.left === selectedLeft && p.right === item);
      
      if (pair) {
        const newMatches = [...matchedPairs, { left: selectedLeft, right: item }];
        setMatchedPairs(newMatches);
        setSelectedLeft(null);
        
        if (newMatches.length === q.pairs.length) {
          setFeedback({ isCorrect: true, show: true });
          setScore(s => s + 1);
        }
      } else {
        setFailedMatch(true);
        setTimeout(() => setFailedMatch(false), 500);
        setSelectedLeft(null);
      }
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setFeedback(null);
      setUserAnswer(null);
      setMatchedPairs([]);
      setSelectedLeft(null);
    } else {
      setGameState('result');
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-3xl p-6 border border-slate-200 relative overflow-hidden transition-all duration-500">
      
      {/* MENU STATE */}
      {gameState === 'menu' && (
        <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in zoom-in duration-500">
          <div className="text-center space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
               <Waves className="w-3 h-3" />
               Grammar Arena
             </div>
             <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Quest of Knowledge</h2>
             <p className="text-slate-500 font-bold max-w-md mx-auto">Chọn vũ đài và bắt đầu thử thách kiến thức chuyên sâu của bạn ngay bây giờ.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {[
              { id: 'stress', icon: <Waves />, title: 'Word Stress', color: 'indigo' },
              { id: 'pos', icon: <LayoutGrid />, title: 'Parts of Speech', color: 'blue' },
              { id: 'word-formation', icon: <Type />, title: 'Word Formation', color: 'emerald' }
            ].map(topic => (
              <button 
                key={topic.id}
                onClick={() => startNewGame(topic.id as any)}
                className="group p-8 bg-white border border-slate-200 rounded-[48px] shadow-sm hover:shadow-2xl hover:border-slate-900 hover:-translate-y-2 transition-all duration-300 text-left relative overflow-hidden"
              >
                <div className={`w-14 h-14 bg-${topic.color}-50 rounded-2xl flex items-center justify-center mb-6 text-${topic.color}-600 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-500`}>
                  {React.cloneElement(topic.icon as React.ReactElement, { className: 'w-7 h-7' })}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{topic.title}</h3>
                <p className="text-xs font-bold text-slate-400 group-hover:text-slate-600">Thử thách {topic.id === 'stress' ? 'đánh trọng âm' : topic.id === 'pos' ? 'phân loại từ' : 'cấu tạo từ'} từ cơ bản đến nâng cao.</p>
              </button>
            ))}
          </div>

          <button 
            onClick={() => startNewGame()}
            className="mt-8 px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-[4px] shadow-2xl hover:bg-slate-800 hover:scale-105 transition-all active:scale-95"
          >
            Bắt đầu tất cả
          </button>
        </div>
      )}

      {/* PLAYING & EXPLANATION STATE */}
      {(gameState === 'playing' || gameState === 'explanation') && currentQ && (
        <div className="flex flex-col h-full space-y-6 animate-in slide-in-from-right duration-500">
          
          {/* Header Progress */}
          <div className="flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-900">
                  {currentIdx + 1}
                </div>
                <div className="h-2 w-48 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-900 transition-all duration-700 ease-out" 
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
             </div>
             <div className="flex items-center gap-3">
               <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
                 <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Score: {score}</span>
               </div>
               <button 
                onClick={() => setGameState('menu')}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
               >
                 <X className="w-6 h-6" />
               </button>
             </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full py-4 space-y-10">
            <div className="text-center space-y-4">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[4px] border-b-2 border-indigo-200 pb-1">{currentQ.topic.replace('-', ' ')}</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">{currentQ.questionText}</h2>
            </div>

            {/* RENDER DYNAMIC UI BY TYPE */}
            <div className="w-full">
              {currentQ.type === 'mcq' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {currentQ.options.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => !feedback?.show && handleMCQ(opt)}
                      disabled={!!feedback?.show}
                      className={`p-6 rounded-[32px] text-lg font-bold border-2 transition-all duration-300 text-left flex items-center gap-4 ${
                        feedback?.show && opt === currentQ.correctAnswer 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 scale-[1.02]' 
                          : feedback?.show && opt === userAnswer && opt !== currentQ.correctAnswer
                          ? 'bg-rose-50 border-rose-500 text-rose-700'
                          : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black ${
                        feedback?.show && opt === currentQ.correctAnswer
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-200 text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'context-pos' && (
                <div className="w-full max-w-2xl mx-auto space-y-8">
                  <div className="p-10 bg-white border border-slate-100 rounded-[48px] shadow-sm relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
                    <p className="text-2xl font-bold text-slate-700 leading-relaxed italic">
                      "{currentQ.sentence.split(currentQ.highlightedWord).map((part, i, arr) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="text-white px-3 py-1 bg-indigo-600 rounded-xl font-black shadow-lg shadow-indigo-100 mx-1">{currentQ.highlightedWord}</span>
                          )}
                        </React.Fragment>
                      ))}"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Noun', 'Verb', 'Adjective', 'Adverb'].map(pos => (
                      <button 
                        key={pos}
                        onClick={() => !feedback?.show && handleContextPOS(pos as any)}
                        disabled={!!feedback?.show}
                        className={`py-5 rounded-[24px] font-black uppercase text-xs tracking-widest border-2 transition-all duration-300 ${
                          feedback?.show && pos === currentQ.correctPOS
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-100'
                            : feedback?.show && pos === userAnswer && pos !== currentQ.correctPOS
                            ? 'bg-rose-500 border-rose-500 text-white'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-500 hover:text-indigo-600'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentQ.type === 'stress-tap' && (
                <div className="flex flex-wrap justify-center gap-4 py-8">
                  {currentQ.wordSyllables.map((syl, i) => (
                    <button 
                      key={i}
                      onClick={() => !feedback?.show && handleStressTap(i)}
                      disabled={!!feedback?.show}
                      className={`min-w-[100px] h-[100px] rounded-[32px] text-2xl font-black uppercase tracking-[0.2em] border-4 transition-all duration-300 flex items-center justify-center ${
                        feedback?.show && i === currentQ.correctStressIndex
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-110'
                          : feedback?.show && i === userAnswer && i !== currentQ.correctStressIndex
                          ? 'bg-rose-500 border-rose-500 text-white'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900 group'
                      }`}
                    >
                      {syl}
                      {!feedback?.show && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <HelpCircle className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'fill-blank' && (
                <div className="w-full max-w-2xl mx-auto space-y-12">
                   <div className="text-center">
                      <p className="text-3xl font-black text-slate-800 tracking-tight leading-loose">
                        {currentQ.sentence.split('___').map((part, i, arr) => (
                          <React.Fragment key={i}>
                            {part}
                            {i < arr.length - 1 && (
                              <span className={`inline-block min-w-[120px] mx-2 border-b-[6px] transition-all duration-300 ${
                                feedback?.show 
                                  ? feedback.isCorrect ? 'text-emerald-600 border-emerald-200' : 'text-rose-600 border-rose-200'
                                  : 'text-indigo-600 border-slate-200'
                              }`}>
                                {userAnswer || '...'}
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </p>
                   </div>
                   <div className="flex flex-wrap justify-center gap-3">
                     {currentQ.options.map((opt, i) => (
                       <button 
                        key={i}
                        onClick={() => !feedback?.show && handleFillBlank(opt)}
                        disabled={!!feedback?.show}
                        className={`px-8 py-4 rounded-2xl font-bold border-2 transition-all duration-300 ${
                          feedback?.show && opt === currentQ.correctAnswer
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : feedback?.show && opt === userAnswer && opt !== currentQ.correctAnswer
                            ? 'bg-rose-50 text-rose-500 border-rose-100'
                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900'
                        }`}
                       >
                         {opt}
                       </button>
                     ))}
                   </div>
                </div>
              )}

              {currentQ.type === 'matching' && (
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 max-w-3xl mx-auto py-4">
                  <div className="space-y-3">
                    {currentQ.pairs.map(p => {
                      const isMatched = matchedPairs.some(m => m.left === p.left);
                      const isSelected = selectedLeft === p.left;
                      return (
                        <button 
                          key={p.left}
                          onClick={() => !isMatched && handleMatching(p.left, 'left')}
                          disabled={isMatched || !!feedback?.show}
                          className={`w-full p-5 rounded-[24px] text-sm font-black text-left border-2 transition-all duration-300 ${
                            isMatched 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-400' 
                              : isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl -translate-x-2'
                              : 'bg-white border-slate-100 text-slate-600 hover:border-slate-900'
                          }`}
                        >
                          {p.left}
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-3">
                    {useMemo(() => [...currentQ.pairs].sort((a,b) => a.right.localeCompare(b.right)).map(p => {
                      const isMatched = matchedPairs.some(m => m.right === p.right);
                      return (
                        <button 
                          key={p.right}
                          onClick={() => !isMatched && handleMatching(p.right, 'right')}
                          disabled={isMatched || !!feedback?.show}
                          className={`w-full p-5 rounded-[24px] text-sm font-bold text-left border-2 transition-all duration-300 ${
                            isMatched 
                              ? 'bg-emerald-100 border-emerald-100 text-emerald-600' 
                              : failedMatch
                              ? 'border-rose-500 bg-rose-50 text-rose-500 animate-shake'
                              : 'bg-white border-slate-100 text-slate-600 hover:border-slate-900'
                          }`}
                        >
                          {p.right}
                        </button>
                      );
                    }), [currentQ, matchedPairs, failedMatch])}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feedback & Explanation Panel */}
          {feedback?.show && (
            <div className="absolute inset-x-0 bottom-0 bg-white border-t-4 border-slate-100 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] p-8 animate-in slide-in-from-bottom duration-500 z-[100] rounded-t-[48px]">
               <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start">
                  <div className={`shrink-0 w-20 h-20 rounded-[32px] flex items-center justify-center text-white shadow-2xl ${feedback.isCorrect ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'}`}>
                    {feedback.isCorrect ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                  </div>
                  <div className="flex-1 space-y-3">
                    <h4 className={`text-2xl font-black uppercase tracking-tight ${feedback.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {feedback.isCorrect ? 'Tuyệt vời! Chính xác' : 'Tiếc quá! Chưa đúng'}
                    </h4>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic">
                       <p className="text-slate-600 text-[15px] font-bold leading-relaxed">{currentQ.explanation}</p>
                    </div>
                  </div>
                  <button 
                    onClick={nextQuestion}
                    className="shrink-0 flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black uppercase text-xs tracking-[4px] hover:bg-indigo-600 transition-all active:scale-95 shadow-xl"
                  >
                    Tiếp theo
                    <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          )}
        </div>
      )}

      {/* RESULT STATE */}
      {gameState === 'result' && (
        <div className="flex flex-col items-center justify-center h-full space-y-10 animate-in zoom-in duration-500">
           <div className="relative">
              <div className="w-64 h-64 rounded-full border-[16px] border-slate-100 flex flex-col items-center justify-center">
                 <span className="text-8xl font-black text-slate-900 leading-none">{score}</span>
                 <span className="text-sm font-black text-slate-300 uppercase tracking-widest mt-2">Dưới {questions.length}</span>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-[32px] flex items-center justify-center shadow-2xl shadow-yellow-100 rotate-12 animate-bounce">
                <LayoutGrid className="w-10 h-10 text-white" />
              </div>
           </div>

           <div className="text-center space-y-3">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Đấu trường kết thúc!</h2>
              <p className="text-slate-500 font-bold text-lg">
                {score === questions.length ? 'Bái phục! Bạn là một Master Ngôn ngữ.' : score >= 7 ? 'Rất tốt! Bạn đã nắm vững kiến thức căn bản.' : 'Cố gắng lên! Đấu trường luôn mở cửa cho bạn.'}
              </p>
           </div>

           <div className="flex gap-4">
              <button 
                onClick={() => setGameState('menu')}
                className="px-10 py-5 bg-slate-100 text-slate-900 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Về Menu
              </button>
              <button 
                onClick={() => startNewGame()}
                className="px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-[4px] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"
              >
                Chơi lại lượt mới
              </button>
           </div>
        </div>
      )}

      {/* Shake animation CSS inline for Matching fail */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
          transform: translate3d(0, 0, 0);
        }
      `}</style>
    </div>
  );
};

export default GrammarArena;
