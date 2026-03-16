
import React, { useState, useEffect } from 'react';
import { ExamConfig, ExamPaper as ExamPaperType, Question } from './types';
import { generateExamContent } from './services/geminiService';
import { storage, STORAGE_KEYS } from './services/storageAdapter';
import ConfigPanel from './components/ConfigPanel';
import ExamPaper from './components/ExamPaper';
import AnswerSheet from './components/AnswerSheet';
import GameCenter from './components/GameCenter';
import SettingsPanel from './components/SettingsPanel';
import LibraryPanel from './components/LibraryPanel';
import ChatbotPanel from './components/ChatbotPanel';
import DictionaryPanel from './components/DictionaryPanel';
import SpeakingArena from './components/SpeakingArena';
import FloatingAura from './components/FloatingAura';
import MacaronicStory from './components/MacaronicStory';
import IPAMaster from './components/IPA/IPAMaster';
import GearSidebar from './components/GearSidebar';
import { authService } from './services/authService';
import { cloudSyncService } from './services/cloudSyncService';
import AuthModal from './components/Auth/AuthModal';
import WritingMaster from './components/Writing/WritingMaster';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'game' | 'chatbot' | 'settings' | 'dictionary' | 'speaking' | 'story' | 'ipa' | 'writing'>('create');
  const [examList, setExamList] = useState<ExamPaperType[]>([]);
  const [currentExamIndex, setCurrentExamIndex] = useState<number>(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'exam' | 'answer' | 'both'>('exam');
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const currentExam = currentExamIndex >= 0 ? examList[currentExamIndex] : null;

  useEffect(() => {
    const initApp = async () => {
      console.info('[App] -> [Action]: Checking user session...');
      setIsAuthChecking(true);
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          // Đồng bộ dữ liệu từ Cloud khi login thành công
          const cloudData = await cloudSyncService.fetchDataFromCloud(user.$id);
          if (cloudData && cloudData.exams) {
            setExamList(cloudData.exams);
          } else {
            // Nếu cloud chưa có, dùng local tạm
            const savedExams = await storage.get<ExamPaperType[]>(STORAGE_KEYS.EXAMS, []);
            setExamList(savedExams);
          }
        }
      } catch (err) {
        console.error('[App] -> [ERROR]: Session check failed:', err);
      } finally {
        setIsAuthChecking(false);
      }
    };
    initApp();
  }, []);

  const handleAuthSuccess = async (user: any) => {
    setCurrentUser(user);
    // Kéo data cloud sau khi login
    const cloudData = await cloudSyncService.fetchDataFromCloud(user.$id);
    if (cloudData && cloudData.exams) {
      setExamList(cloudData.exams);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Bạn có chắc muốn đăng xuất?")) return;
    try {
      await authService.logout();
      setCurrentUser(null);
      setExamList([]);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleGenerate = async (config: ExamConfig) => {
    setIsGenerating(true);
    try {
      const questions = await generateExamContent(config);
      const newExam: ExamPaperType = {
        id: `EXAM-${Date.now()}`,
        config,
        questions,
        createdAt: new Date().toISOString(),
        version: config.examCode
      };
      const newList = [newExam, ...examList];
      setExamList(newList);
      
      // LƯU XUỐNG Ổ CỨNG
      await storage.set(STORAGE_KEYS.EXAMS, newList);
      
      // ĐỒNG BỘ LÊN CLOUD
      if (currentUser) {
        await cloudSyncService.syncDataToCloud(currentUser.$id, { exams: newList });
      }
      
      setCurrentExamIndex(0);
      setActiveTab('library');
    } catch (err: any) {
      alert(err.message || 'Lỗi không xác định.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateQuestion = async (index: number, updated: Question) => {
    if (currentExamIndex < 0) return;
    const updatedExamList = [...examList];
    const updatedExam = { ...updatedExamList[currentExamIndex] };
    const updatedQuestions = [...updatedExam.questions];
    updatedQuestions[index] = updated;
    updatedExam.questions = updatedQuestions;
    updatedExamList[currentExamIndex] = updatedExam;
    
    setExamList(updatedExamList);
    await storage.set(STORAGE_KEYS.EXAMS, updatedExamList);
    if (currentUser) {
      await cloudSyncService.syncDataToCloud(currentUser.$id, { exams: updatedExamList });
    }
  };

  const deleteExam = async (id: string) => {
    if (!window.confirm("Xác nhận xóa đề thi?")) return;
    const newList = examList.filter(e => e.id !== id);
    setExamList(newList);
    await storage.set(STORAGE_KEYS.EXAMS, newList);
    
    if (currentUser) {
      await cloudSyncService.syncDataToCloud(currentUser.$id, { exams: newList });
    }
    
    if (currentExam?.id === id) setCurrentExamIndex(-1);
  };

  const handlePrint = (mode: 'exam' | 'answer' | 'both') => {
    setViewMode(mode);
    setShowPrintMenu(false);
    setTimeout(() => window.print(), 500);
  };

  // Skip desktop update checks and window controls as we migrated to web

  if (isAuthChecking) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang khởi tạo...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthModal onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="desktop-window">
      <div className="h-14 bg-white border-b px-6 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
           <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
             <span className="text-[10px] text-white font-black italic">A</span>
           </div>
           <span className="text-xs font-black text-slate-800 uppercase tracking-[3px]">Aura Edu Studio</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-600">
              {currentUser.name.charAt(0)}
            </div>
            <span className="text-[11px] font-black text-slate-700">{currentUser.name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            title="Đăng xuất"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>

      <div className="app-body" style={{ height: 'calc(100vh - 56px)' }}>
        <GearSidebar activeTab={activeTab as any} onTabChange={(tab: any) => { 
          console.info('[App] -> [Routing]: Switching to tab:', tab);
          setActiveTab(tab); 
          if (tab === 'library') setCurrentExamIndex(-1); 
        }} />

        <main className="main-workspace" style={{ marginLeft: 0 }}>
          {activeTab === 'create' && (
            <div className="flex h-full animate-content">
              <aside className="w-[320px] border-r bg-white p-4 overflow-y-auto no-print flex flex-col">
                <ConfigPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
              </aside>
              <div className="flex-1 flex flex-col items-center justify-center grayscale opacity-10 p-10 text-center">
                <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <h2 className="text-2xl font-black uppercase tracking-[12px]">Thiết lập đề thi</h2>
                <p className="text-xs font-bold mt-2 tracking-widest">SỬ DỤNG BẢNG CẤU HÌNH BÊN TRÁI</p>
              </div>
            </div>
          )}

          {activeTab === 'library' && !currentExam && <LibraryPanel exams={examList} onSelect={(id) => setCurrentExamIndex(examList.findIndex(e => e.id === id))} onDelete={deleteExam} />}
          {activeTab === 'story' && <MacaronicStory />}
          {activeTab === 'speaking' && <div className="h-full animate-content"><SpeakingArena /></div>}
          {activeTab === 'ipa' && <IPAMaster />}
          {activeTab === 'writing' && <div className="h-full animate-content"><WritingMaster /></div>}
          {activeTab === 'dictionary' && <div className="h-full p-6 animate-content"><DictionaryPanel /></div>}
          {activeTab === 'chatbot' && <div className="h-full animate-content"><ChatbotPanel /></div>}
          {activeTab === 'game' && <div className="h-full animate-content"><GameCenter initialQuestions={currentExam?.questions || []} initialExamTitle={currentExam?.config.title || ""} examList={examList} /></div>}
          {activeTab === 'settings' && <div className="h-full animate-content"><SettingsPanel /></div>}

          {isGenerating && (
            <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-sm font-black text-slate-600 uppercase tracking-[6px] animate-pulse">AI đang phân tích kiến thức...</p>
            </div>
          )}

          {currentExam && (activeTab === 'library' || activeTab === 'create') && (
            <div className="flex-1 flex flex-col h-full overflow-hidden animate-content">
              <div className="h-14 bg-white border-b px-8 flex justify-between items-center no-print shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={() => setCurrentExamIndex(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg></button>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setViewMode('exam')} className={`px-5 py-1.5 text-[10px] font-black rounded-lg transition-all ${viewMode === 'exam' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>ĐỀ THI</button>
                    <button onClick={() => setViewMode('answer')} className={`px-5 py-1.5 text-[10px] font-black rounded-lg transition-all ${viewMode === 'answer' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>ĐÁP ÁN</button>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setShowPrintMenu(!showPrintMenu)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>XUẤT BẢN PDF</button>
                  {showPrintMenu && (
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                      <button onClick={() => handlePrint('exam')} className="w-full px-5 py-3 text-left text-[11px] font-bold hover:bg-indigo-50 transition-colors">In đề thi chuẩn</button>
                      <button onClick={() => handlePrint('answer')} className="w-full px-5 py-3 text-left text-[11px] font-bold hover:bg-indigo-50 transition-colors">In đáp án chi tiết</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100/30 p-8"><div className="a4-wrapper">{viewMode === 'exam' ? <ExamPaper data={currentExam} onUpdateQuestion={handleUpdateQuestion} /> : <AnswerSheet data={currentExam} />}</div></div>
            </div>
          )}
        </main>
      </div>
      <FloatingAura />
    </div>
  );
};

export default App;
