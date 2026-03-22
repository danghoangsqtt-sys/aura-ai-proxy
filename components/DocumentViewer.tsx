import React, { useEffect, useState, useRef, useCallback } from 'react';
import { DocFileType } from '../types';
import { FileStorageService } from '../services/fileStorageService';
import { 
  FileText, 
  Film, 
  FileSpreadsheet, 
  Download, 
  Loader2, 
  AlertCircle,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  StickyNote,
  PanelRightClose,
  PanelRightOpen,
  ExternalLink
} from 'lucide-react';

interface DocumentViewerProps {
  fileType: DocFileType;
  content?: string;           // For text type
  fileStorageKey?: string;     // For file types (key in IndexedDB/FS)
  fileName?: string;
  docId?: string;              // Document ID for notes persistence
  onClose?: () => void;
}

// ──────────────────────────────────────────────
// Notes Panel (localStorage-based)
// ──────────────────────────────────────────────
const NotesPanel: React.FC<{ docId: string }> = ({ docId }) => {
  const storageKey = `aura_note_${docId}`;
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setNote(stored);
      setLastSaved(new Date().toLocaleTimeString('vi-VN'));
    }
    setSaved(true);
  }, [storageKey]);

  const handleSave = useCallback(() => {
    localStorage.setItem(storageKey, note);
    setSaved(true);
    setLastSaved(new Date().toLocaleTimeString('vi-VN'));
  }, [storageKey, note]);

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (saved) return;
    const timer = setTimeout(() => handleSave(), 2000);
    return () => clearTimeout(timer);
  }, [note, saved, handleSave]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2">
          <StickyNote className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ghi chú</span>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-[8px] text-slate-400 font-medium">
              {saved ? `Đã lưu ${lastSaved}` : 'Chưa lưu...'}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider transition-all ${
              saved 
                ? 'bg-slate-50 text-slate-300 cursor-default' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
            }`}
          >
            <Save className="w-2.5 h-2.5" />
            Lưu
          </button>
        </div>
      </div>
      <textarea
        className="flex-1 w-full resize-none p-3 text-[12px] text-slate-700 leading-relaxed bg-amber-50/30 placeholder-slate-400 outline-none custom-scrollbar font-medium"
        placeholder="Viết ghi chú cho tài liệu này...&#10;&#10;💡 Ghi chú sẽ tự động lưu sau 2 giây."
        value={note}
        onChange={e => { setNote(e.target.value); setSaved(false); }}
        spellCheck={false}
      />
    </div>
  );
};

// ──────────────────────────────────────────────
// Text Viewer
// ──────────────────────────────────────────────
const TextViewer: React.FC<{ content: string }> = ({ content }) => (
  <div className="bg-slate-50 rounded-xl p-5 text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto custom-scrollbar border border-slate-100">
    {content || <span className="text-slate-400 italic">Không có nội dung</span>}
  </div>
);

// ──────────────────────────────────────────────
// Video Viewer
// ──────────────────────────────────────────────
const VideoViewer: React.FC<{ storageKey: string }> = ({ storageKey }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let currentUrl: string | null = null;
    FileStorageService.getFileUrl(storageKey)
      .then(u => { currentUrl = u; setUrl(u); })
      .catch(() => setError(true));
    return () => {
      // Only revoke if it's a blob URL — local-file:// URLs are static strings
      if (currentUrl && currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [storageKey]);

  if (error) return <ViewerError message="Không thể tải video" />;
  if (!url) return <ViewerLoading />;

  return (
    <div className="rounded-xl overflow-hidden bg-black">
      <video 
        src={url} 
        controls 
        preload="metadata"
        className="w-full max-h-[500px]"
        controlsList="nodownload"
      >
        <source src={url} type="video/mp4" />
        Trình duyệt không hỗ trợ phát video.
      </video>
    </div>
  );
};

// ──────────────────────────────────────────────
// PDF Viewer (with Zoom + HiDPI rendering)
// ──────────────────────────────────────────────
// TODO: Highlight support requires pdfjs TextLayerBuilder.
// To enable: render a div overlay with textLayer.render({ viewport, textContent })
// and apply CSS for ::selection highlighting. This is a future enhancement.
const PdfViewer: React.FC<{ storageKey: string }> = ({ storageKey }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1.2);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3.0;
  const SCALE_STEP = 0.2;

  useEffect(() => {
    let objectUrl: string | null = null;
    FileStorageService.getFileUrl(storageKey)
      .then(u => { objectUrl = u; setUrl(u); })
      .catch(() => setError(true));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [storageKey]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    const renderPdf = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        // Point directly to the worker file in the public folder
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        
        const pdf = await pdfjsLib.getDocument(url).promise;
        if (cancelled) return;
        setNumPages(pdf.numPages);

        const page = await pdf.getPage(currentPage);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Use devicePixelRatio for crisp HiDPI rendering
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale });

        // Set the actual pixel dimensions (high-res)
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);

        // Set the CSS display dimensions
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Scale the context for HiDPI
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        await page.render({ canvas: canvas, canvasContext: ctx, viewport }).promise;
      } catch (err) {
        console.error('[DocumentViewer] PDF render error:', err);
        if (!cancelled) setError(true);
      }
    };

    renderPdf();
    return () => { cancelled = true; };
  }, [url, currentPage, scale]);

  const zoomIn = () => setScale(s => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(1)));
  const zoomOut = () => setScale(s => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(1)));
  const zoomReset = () => setScale(1.2);

  if (error) return <ViewerError message="Không thể mở file PDF" />;
  if (!url) return <ViewerLoading />;

  return (
    <div ref={containerRef} className={`bg-slate-100 rounded-xl border border-slate-200 overflow-hidden ${isFullscreen ? 'fixed inset-4 z-[9998] shadow-2xl flex flex-col' : ''}`}>
      {/* PDF toolbar */}
      <div className="bg-white border-b border-slate-100 px-3 py-1.5 flex items-center justify-between shrink-0">
        {/* Page Navigation */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 transition-all"
            title="Trang trước"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider min-w-[70px] text-center">
            Trang {currentPage} / {numPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
            className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 transition-all"
            title="Trang sau"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-50 rounded-lg px-1 py-0.5 border border-slate-100">
          <button
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-all"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-3.5 h-3.5 text-slate-600" />
          </button>
          <button
            onClick={zoomReset}
            className="px-2 py-0.5 rounded-md hover:bg-white transition-all"
            title="Khôi phục zoom"
          >
            <span className="text-[9px] font-black text-slate-600 tracking-wider">{Math.round(scale * 100)}%</span>
          </button>
          <button
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            className="p-1 rounded-md hover:bg-white disabled:opacity-30 transition-all"
            title="Phóng to"
          >
            <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>

        {/* Fullscreen */}
        <button 
          onClick={() => setIsFullscreen(f => !f)} 
          className="p-1 rounded-md hover:bg-slate-100 transition-all"
          title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className={`flex items-start justify-center overflow-auto custom-scrollbar p-4 bg-slate-200/50 ${isFullscreen ? 'flex-1' : 'max-h-[500px]'}`}>
        <canvas ref={canvasRef} className="shadow-lg rounded-lg" />
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Native Fallback Viewer (DOCX, PPTX, etc.)
// Opens file with the system's default application
// ──────────────────────────────────────────────
const FILE_META: Record<string, { icon: React.ReactNode; gradient: string; border: string; label: string; app: string; description: string }> = {
  docx: {
    icon: <FileText className="w-12 h-12 text-blue-500" />,
    gradient: 'from-blue-50 via-indigo-50 to-sky-50',
    border: 'border-blue-200',
    label: 'Microsoft Word (.DOCX)',
    app: 'Microsoft Word',
    description: 'Để đảm bảo giữ nguyên định dạng, kiểu chữ và bảng biểu, vui lòng mở tài liệu này bằng phần mềm Microsoft Word hoặc LibreOffice Writer.',
  },
  pptx: {
    icon: <FileSpreadsheet className="w-12 h-12 text-orange-500" />,
    gradient: 'from-orange-50 via-amber-50 to-yellow-50',
    border: 'border-orange-200',
    label: 'Microsoft PowerPoint (.PPTX)',
    app: 'Microsoft PowerPoint',
    description: 'Để đảm bảo giữ nguyên hiệu ứng chuyển slide, animation và định dạng, vui lòng mở bài trình bày này bằng Microsoft PowerPoint hoặc LibreOffice Impress.',
  },
};

/**
 * Parse a `local-file:///` URL or absolute path → clean absolute filesystem path
 */
const toAbsolutePath = (urlOrPath: string): string => {
  let p = urlOrPath;
  if (p.startsWith('local-file:')) {
    p = p.replace(/^local-file:\/{2,3}/, '');
  }
  p = decodeURIComponent(p);
  if (/^[a-zA-Z]\//.test(p)) {
    p = p[0] + ':' + p.slice(1);
  }
  return p;
};

const NativeFallbackViewer: React.FC<{
  storageKey: string;
  fileName?: string;
  fileTypeKey: 'docx' | 'pptx';
}> = ({ storageKey, fileName, fileTypeKey }) => {
  const [opening, setOpening] = useState(false);
  const [success, setSuccess] = useState(false);

  const meta = FILE_META[fileTypeKey] || FILE_META.docx;

  const handleOpenNative = async () => {
    const api = (window as any).electronAPI;
    if (!api) return;
    setOpening(true);
    try {
      const absPath = toAbsolutePath(storageKey);
      const result = await api.invoke('open-file-native', absPath);
      if (result?.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(`[${fileTypeKey.toUpperCase()}] Failed to open natively:`, err);
    }
    setOpening(false);
  };

  return (
    <div className={`bg-gradient-to-br ${meta.gradient} rounded-2xl border ${meta.border} p-12 flex flex-col items-center justify-center gap-6 min-h-[320px]`}>
      <div className="w-24 h-24 bg-white/80 rounded-3xl flex items-center justify-center shadow-lg border border-white">
        {meta.icon}
      </div>
      <div className="text-center max-w-md space-y-2">
        <h3 className="text-lg font-bold text-slate-800">{fileName || 'Tài liệu'}</h3>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{meta.label}</p>
        <div className="h-px w-16 bg-slate-200 mx-auto my-2" />
        <p className="text-[11px] text-slate-500 leading-relaxed">{meta.description}</p>
      </div>
      <button
        onClick={handleOpenNative}
        disabled={opening}
        className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-lg ${
          success
            ? 'bg-emerald-600 text-white shadow-emerald-100'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl shadow-indigo-100'
        } disabled:opacity-60`}
      >
        {success ? (
          <>✓ Đã mở thành công</>
        ) : opening ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Đang mở...</>
        ) : (
          <><ExternalLink className="w-4 h-4" /> Mở bằng {meta.app}</>
        )}
      </button>
      <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold text-center">
        Định dạng cần phần mềm chuyên dụng · File sẽ mở bằng ứng dụng mặc định
      </p>
    </div>
  );
};



// ──────────────────────────────────────────────
// Helper components
// ──────────────────────────────────────────────
const ViewerLoading: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
    <span className="text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-wider">Đang tải tài liệu...</span>
  </div>
);

const ViewerError: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
    <p className="text-[11px] font-bold text-rose-500">{message}</p>
    <p className="text-[9px] text-slate-400 mt-1">File có thể đã bị xóa hoặc hỏng.</p>
  </div>
);

// ──────────────────────────────────────────────
// Main DocumentViewer (with Notes Panel)
// ──────────────────────────────────────────────
const DocumentViewer: React.FC<DocumentViewerProps> = ({ fileType, content, fileStorageKey, fileName, docId }) => {
  const [showNotes, setShowNotes] = useState(false);

  const renderViewer = () => {
    switch (fileType) {
      case 'text':
        return <TextViewer content={content || ''} />;
      case 'video':
        if (!fileStorageKey) return <ViewerError message="Không có file video" />;
        return <VideoViewer storageKey={fileStorageKey} />;
      case 'pdf':
        if (!fileStorageKey) return <ViewerError message="Không có file PDF" />;
        return <PdfViewer storageKey={fileStorageKey} />;
      case 'docx':
        if (!fileStorageKey) return <ViewerError message="Không có file DOCX" />;
        return <NativeFallbackViewer storageKey={fileStorageKey} fileName={fileName} fileTypeKey="docx" />;
      case 'pptx':
        if (!fileStorageKey) return <ViewerError message="Không có file PPTX" />;
        return <NativeFallbackViewer storageKey={fileStorageKey} fileName={fileName} fileTypeKey="pptx" />;
      default:
        return <TextViewer content={content || ''} />;
    }
  };

  // No notes available if no docId
  if (!docId) {
    return renderViewer();
  }

  return (
    <div className="flex gap-0 h-full">
      {/* Document Area */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${showNotes ? '' : ''}`}>
        {renderViewer()}
      </div>

      {/* Notes Toggle Button */}
      <div className="flex flex-col items-center shrink-0 ml-2">
        <button
          onClick={() => setShowNotes(s => !s)}
          className={`p-1.5 rounded-lg border transition-all ${
            showNotes 
              ? 'bg-amber-50 border-amber-200 text-amber-600' 
              : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200'
          }`}
          title={showNotes ? 'Ẩn ghi chú' : 'Hiện ghi chú'}
        >
          {showNotes ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Notes Panel (collapsible) */}
      {showNotes && (
        <div className="w-72 shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden animate-in slide-in-from-right-4 duration-200 ml-1 flex flex-col" style={{ minHeight: '300px', maxHeight: '500px' }}>
          <NotesPanel docId={docId} />
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
