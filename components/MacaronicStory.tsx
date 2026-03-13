import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateMacaronicStory } from '../services/geminiService';

const MacaronicStory: React.FC = () => {
  const [words, setWords] = useState('');
  const [topic, setTopic] = useState('');
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!words.trim()) {
      setError('Vui lòng nhập danh sách từ vựng tiếng Anh.');
      return;
    }
    if (!topic.trim()) {
      setError('Vui lòng nhập chủ đề cho câu chuyện.');
      return;
    }

    setError('');
    setStory('');
    setIsGenerating(true);

    try {
      const result = await generateMacaronicStory(words.trim(), topic.trim());
      setStory(result);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tạo truyện. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-content">
      {/* Header */}
      <div className="bg-white border-b px-8 py-5 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
            <span className="text-lg">📖</span>
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Truyện Chêm (Macaronic Story)</h2>
            <p className="text-[11px] text-slate-400 font-medium">Học từ vựng qua ngữ cảnh câu chuyện song ngữ</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Input Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
              Danh sách từ vựng tiếng Anh (cách nhau bởi dấu phẩy)
            </label>
            <textarea
              value={words}
              onChange={(e) => setWords(e.target.value)}
              placeholder="Ví dụ: resilient, mitigate, ubiquitous, procrastinate"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all resize-none"
              rows={2}
            />
            
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-4">
              Chủ đề câu chuyện
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Đời sống công sở, Khoa học viễn tưởng, Du lịch..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
            />

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-5 w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-3 rounded-xl font-bold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  AI đang sáng tác...
                </>
              ) : (
                <>✨ Tạo Truyện Chêm</>
              )}
            </button>

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600 font-medium">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          {isGenerating && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 animate-pulse">
              <div className="h-4 bg-slate-200 rounded-full w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded-full w-full"></div>
              <div className="h-4 bg-slate-200 rounded-full w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded-full w-full"></div>
              <div className="h-4 bg-slate-200 rounded-full w-2/3"></div>
              <div className="h-4 bg-slate-200 rounded-full w-full"></div>
              <div className="h-4 bg-slate-200 rounded-full w-4/5"></div>
            </div>
          )}

          {/* Story Display */}
          {story && !isGenerating && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="text-lg">📜</span>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Câu chuyện của bạn</h3>
              </div>
              <div className="prose prose-sm prose-slate max-w-none leading-relaxed text-[15px]">
                <ReactMarkdown>{story}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MacaronicStory;
