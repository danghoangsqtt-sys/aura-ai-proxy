import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ExamPaper, Difficulty, DocFileType } from '../types';
import DocumentViewer from './DocumentViewer';
import {
  Search, Filter, Calendar, Clock, FileText, PlayCircle, Trash2,
  ChevronRight, ChevronDown, Database, BookOpen, FolderOpen, Folder,
  FolderPlus, X, Edit3, MoreVertical, Layers, Film, FileSpreadsheet,
  AlertTriangle, Home, ExternalLink, Loader2, RefreshCw, Plus
} from 'lucide-react';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface FileItem {
  name: string;
  isDirectory: boolean;
  path: string;
  size: number;
  extension: string;
}

interface LibraryPanelProps {
  exams: ExamPaper[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const getDifficultyColor = (level: string) => {
  switch (level) {
    case Difficulty.A1: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case Difficulty.A2: return 'bg-green-50 text-green-600 border-green-100';
    case Difficulty.B1: return 'bg-blue-50 text-blue-600 border-blue-100';
    case Difficulty.B2: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    case Difficulty.C1: return 'bg-purple-50 text-purple-600 border-purple-100';
    case Difficulty.C2: return 'bg-rose-50 text-rose-600 border-rose-100';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileTypeInfo = (ext: string) => {
  switch (ext) {
    case '.pdf': return { icon: <FileText className="w-3.5 h-3.5" />, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-200', label: 'PDF', bigIcon: <FileText className="w-6 h-6" /> };
    case '.docx': case '.doc': return { icon: <FileText className="w-3.5 h-3.5" />, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200', label: 'DOCX', bigIcon: <FileText className="w-6 h-6" /> };
    case '.pptx': case '.ppt': return { icon: <FileSpreadsheet className="w-3.5 h-3.5" />, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', label: 'PPTX', bigIcon: <FileSpreadsheet className="w-6 h-6" /> };
    case '.mp4': case '.webm': case '.mov': case '.avi': case '.mkv':
      return { icon: <Film className="w-3.5 h-3.5" />, color: 'text-violet-500', bg: 'bg-violet-50 border-violet-200', label: 'VIDEO', bigIcon: <Film className="w-6 h-6" /> };
    case '.jpg': case '.jpeg': case '.png': case '.gif': case '.webp':
      return { icon: <FileText className="w-3.5 h-3.5" />, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200', label: 'IMG', bigIcon: <FileText className="w-6 h-6" /> };
    default: return { icon: <FileText className="w-3.5 h-3.5" />, color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200', label: 'FILE', bigIcon: <FileText className="w-6 h-6" /> };
  }
};

const extToDocFileType = (ext: string): DocFileType => {
  switch (ext) {
    case '.pdf': return 'pdf';
    case '.docx': case '.doc': return 'docx';
    case '.pptx': case '.ppt': return 'pptx';
    case '.mp4': case '.webm': case '.mov': case '.avi': case '.mkv': return 'video';
    default: return 'text';
  }
};

const getElectronAPI = (): any => (window as any).electronAPI;

// ──────────────────────────────────────────────
// Recursive TreeNode (Lazy-loaded)
// ──────────────────────────────────────────────
const TreeNode: React.FC<{
  item: FileItem;
  level: number;
  activePath: string | null;
  onSelectFolder: (path: string) => void;
  onSelectFile: (item: FileItem) => void;
  onContextMenu: (item: FileItem) => void;
  contextMenuPath: string | null;
  refreshSignal: number;
}> = ({ item, level, activePath, onSelectFolder, onSelectFile, onContextMenu, contextMenuPath, refreshSignal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<FileItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const isActive = activePath === item.path;
  const isFolder = item.isDirectory;

  // Fetch children lazily
  const fetchChildren = useCallback(async () => {
    const api = getElectronAPI();
    if (!api) return;
    setLoading(true);
    try {
      const result = await api.invoke('read-library-dir', item.path);
      if (result?.success) {
        setChildren(result.items);
        setLoaded(true);
      }
    } catch (err) {
      console.error('[Tree] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [item.path]);

  // Refresh when signal changes (after CRUD)
  useEffect(() => {
    if (loaded && isExpanded) {
      fetchChildren();
    }
  }, [refreshSignal]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFolder) return;
    const next = !isExpanded;
    setIsExpanded(next);
    if (next && !loaded) fetchChildren();
  };

  const handleClick = () => {
    if (isFolder) {
      onSelectFolder(item.path);
      if (!isExpanded) {
        setIsExpanded(true);
        if (!loaded) fetchChildren();
      }
    } else {
      onSelectFile(item);
    }
  };

  const ft = isFolder ? null : getFileTypeInfo(item.extension);

  return (
    <div>
      {/* Node row */}
      <div
        className={`group flex items-center gap-1 py-[3px] pr-2 cursor-pointer transition-all text-[11px] rounded-md mx-1 ${
          isActive
            ? 'bg-indigo-50 text-indigo-700 font-bold'
            : 'text-slate-600 hover:bg-slate-100 font-medium'
        }`}
        style={{ paddingLeft: `${level * 14 + 6}px` }}
        onClick={handleClick}
      >
        {/* Expand/collapse arrow */}
        {isFolder ? (
          <button onClick={handleToggle} className="w-4 h-4 flex items-center justify-center shrink-0 text-slate-400 hover:text-indigo-500 transition-colors" title="Mở/đóng">
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        ) : (
          <div className="w-4 h-4 shrink-0" />
        )}

        {/* Icon */}
        {isFolder ? (
          isExpanded
            ? <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            : <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        ) : (
          <span className={`shrink-0 ${ft?.color || ''}`}>{ft?.icon}</span>
        )}

        {/* Name */}
        <span className="truncate flex-1 ml-1">{item.name}</span>

        {/* Extension badge for files */}
        {!isFolder && (
          <span className="text-[7px] font-black text-slate-300 uppercase shrink-0">{ft?.label}</span>
        )}

        {/* Context menu trigger */}
        <button
          onClick={e => { e.stopPropagation(); onContextMenu(item); }}
          className="w-4 h-4 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-500 transition-all rounded"
          title="Tùy chọn"
        >
          <MoreVertical className="w-3 h-3" />
        </button>
      </div>

      {/* Children (recursive) */}
      {isFolder && isExpanded && (
        <div>
          {children.map(child => (
            <TreeNode
              key={child.path}
              item={child}
              level={level + 1}
              activePath={activePath}
              onSelectFolder={onSelectFolder}
              onSelectFile={onSelectFile}
              onContextMenu={onContextMenu}
              contextMenuPath={contextMenuPath}
              refreshSignal={refreshSignal}
            />
          ))}
          {loaded && children.length === 0 && (
            <div className="text-[9px] text-slate-300 italic font-medium" style={{ paddingLeft: `${(level + 1) * 14 + 24}px` }}>
              Trống
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────
// ExamTab (preserved)
// ──────────────────────────────────────────────
const ExamTab: React.FC<{
  exams: ExamPaper[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ exams, onSelect, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiff, setFilterDiff] = useState('');

  const filtered = useMemo(() => {
    let list = exams;
    if (filterDiff) list = list.filter(e => e.config.difficulty === filterDiff);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(e => e.config.title.toLowerCase().includes(q) || e.config.subject.toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [exams, searchTerm, filterDiff]);

  if (exams.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-1000">
        <div className="w-20 h-20 mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center text-slate-200"><Layers className="w-10 h-10" /></div>
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Chưa có đề thi nào</h3>
        <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-wider">Hãy tạo đề thi đầu tiên của bạn</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Tìm kiếm đề thi..." className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-[11px] font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="relative">
          <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select title="Lọc theo độ khó" className="bg-white border border-slate-200 pl-8 pr-4 py-2.5 rounded-xl text-[11px] font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all appearance-none cursor-pointer" value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
            <option value="">Tất cả</option>
            {Object.values(Difficulty).map(d => (<option key={d} value={d}>{d}</option>))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 pb-10">
        {filtered.map((exam, idx) => (
          <div key={exam.id} className="group bg-white rounded-xl border border-slate-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms` }} onClick={() => onSelect(exam.id)}>
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shrink-0 group-hover:scale-110 transition-transform duration-500"><PlayCircle className="w-5 h-5 text-indigo-500" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">{exam.config.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{exam.config.subject}</p>
                </div>
              </div>
              <div className="mt-3"><span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border ${getDifficultyColor(exam.config.difficulty)} uppercase tracking-wider`}>{exam.config.difficulty}</span></div>
              <div className="mt-auto pt-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400">
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-300" />{new Date(exam.createdAt).toLocaleDateString('vi-VN')}</div>
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-300" />{exam.config.duration}'</div>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg"><FileText className="w-3 h-3" />{exam.questions.length}Q</div>
              </div>
            </div>
            <div className="bg-indigo-600 py-3 flex items-center justify-center gap-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-wider"><PlayCircle className="w-4 h-4" /> Mở đề thi</div>
              <button onClick={e => { e.stopPropagation(); onDelete(exam.id); }} className="ml-3 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all" title="Xóa đề thi"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// File Explorer — Split Pane (Tree + Content)
// ──────────────────────────────────────────────
const FileExplorerTab: React.FC = () => {
  const [libraryRoot, setLibraryRoot] = useState('');
  const [rootItems, setRootItems] = useState<FileItem[]>([]);
  const [activeFolderPath, setActiveFolderPath] = useState<string>('');
  const [folderItems, setFolderItems] = useState<FileItem[]>([]);
  const [viewingFile, setViewingFile] = useState<FileItem | null>(null);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  // Context menu & modals
  const [contextItem, setContextItem] = useState<FileItem | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParent, setNewFolderParent] = useState('');
  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteItem, setDeleteItem] = useState<FileItem | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const api = getElectronAPI();

  // Init: get root path & load root items
  useEffect(() => {
    if (!api) return;
    api.invoke('get-library-root').then((root: string) => setLibraryRoot(root));
    fetchRootItems();
  }, []);

  const fetchRootItems = async () => {
    if (!api) return;
    const result = await api.invoke('read-library-dir', '');
    if (result?.success) setRootItems(result.items);
  };

  // Fetch folder content for the grid view
  const fetchFolderGrid = useCallback(async (folderPath: string) => {
    if (!api) return;
    setLoadingGrid(true);
    try {
      const result = await api.invoke('read-library-dir', folderPath);
      if (result?.success) setFolderItems(result.items);
    } catch (err) {
      console.error('[Grid] fetch error:', err);
    } finally {
      setLoadingGrid(false);
    }
  }, [api]);

  // When active folder changes, load grid
  useEffect(() => {
    fetchFolderGrid(activeFolderPath);
    setViewingFile(null);
  }, [activeFolderPath, fetchFolderGrid]);

  const triggerRefresh = () => {
    setRefreshSignal(s => s + 1);
    fetchFolderGrid(activeFolderPath);
    fetchRootItems();
  };

  // ── CRUD Handlers ──
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const result = await api.invoke('create-library-folder', newFolderParent, newFolderName.trim());
    if (result?.success) {
      showToast(`📁 Đã tạo thư mục "${newFolderName.trim()}"`);
      setShowNewFolder(false);
      setNewFolderName('');
      triggerRefresh();
    } else {
      showToast(result?.error || 'Lỗi', 'error');
    }
  };

  const handleRename = async () => {
    if (!renameItem || !renameValue.trim()) return;
    const result = await api.invoke('rename-library-item', renameItem.path, renameValue.trim());
    if (result?.success) {
      showToast(`✏️ Đã đổi tên thành "${renameValue.trim()}"`);
      setRenameItem(null);
      if (viewingFile?.path === renameItem.path) setViewingFile(null);
      triggerRefresh();
    } else {
      showToast(result?.error || 'Lỗi', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const result = await api.invoke('delete-library-item', deleteItem.path);
    if (result?.success) {
      showToast(`🗑️ Đã chuyển "${deleteItem.name}" vào Thùng rác`);
      setDeleteItem(null);
      if (viewingFile?.path === deleteItem.path) setViewingFile(null);
      triggerRefresh();
    } else {
      showToast(result?.error || 'Lỗi', 'error');
    }
  };

  const openInExplorer = async () => {
    await api.invoke('open-in-os-explorer', activeFolderPath);
  };

  const getAbsolutePath = (item: FileItem) => {
    const sep = libraryRoot.includes('\\') ? '\\' : '/';
    return libraryRoot + sep + item.path.replace(/[/\\]/g, sep);
  };

  const onContextMenuAction = (item: FileItem) => {
    setContextItem(prev => prev?.path === item.path ? null : item);
  };

  // ── Breadcrumb ──
  const breadcrumbs = useMemo(() => {
    if (!activeFolderPath) return [];
    return activeFolderPath.split(/[/\\]/).filter(Boolean);
  }, [activeFolderPath]);

  // ── Render ──
  return (
    <div className="flex h-full min-h-[500px] rounded-xl overflow-hidden border border-slate-200 bg-white relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-2.5 rounded-xl shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom-4 fade-in duration-300 ${toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* ═══ LEFT: Tree Sidebar ═══ */}
      <div className="w-64 shrink-0 bg-slate-50/70 border-r border-slate-200 flex flex-col overflow-hidden">
        {/* Sidebar header */}
        <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Thư viện</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => triggerRefresh()} className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-all" title="Làm mới">
              <RefreshCw className="w-3 h-3" />
            </button>
            <button onClick={() => { setShowNewFolder(true); setNewFolderParent(activeFolderPath); setNewFolderName(''); }} className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-all" title="Thư mục mới">
              <FolderPlus className="w-3 h-3" />
            </button>
            <button onClick={openInExplorer} className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-all" title="Mở trong Explorer">
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
          {/* Root node (click = go to root) */}
          <div
            className={`flex items-center gap-1.5 px-3 py-[3px] cursor-pointer transition-all text-[11px] rounded-md mx-1 ${
              activeFolderPath === '' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
            onClick={() => setActiveFolderPath('')}
          >
            <Home className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">AuraGen_Library</span>
          </div>

          {/* Root items */}
          {rootItems.map(item => (
            <TreeNode
              key={item.path}
              item={item}
              level={1}
              activePath={activeFolderPath}
              onSelectFolder={setActiveFolderPath}
              onSelectFile={(f) => { setActiveFolderPath(f.path.substring(0, f.path.lastIndexOf('/')) || f.path.substring(0, f.path.lastIndexOf('\\')) || ''); setViewingFile(f); }}
              onContextMenu={onContextMenuAction}
              contextMenuPath={contextItem?.path || null}
              refreshSignal={refreshSignal}
            />
          ))}

          {rootItems.length === 0 && (
            <div className="px-4 py-8 text-center">
              <FolderOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-[9px] text-slate-300 font-bold">Thư viện trống</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT: Main Content ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar: Breadcrumb + actions */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 shrink-0 bg-white">
          <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
            <button
              onClick={() => { setActiveFolderPath(''); setViewingFile(null); }}
              className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${
                !activeFolderPath && !viewingFile ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-500'
              }`}
            >
              <Home className="w-2.5 h-2.5" /> Gốc
            </button>
            {breadcrumbs.map((part, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                <button
                  onClick={() => { setActiveFolderPath(breadcrumbs.slice(0, idx + 1).join('/')); setViewingFile(null); }}
                  className={`shrink-0 px-2 py-1 rounded-md text-[9px] font-bold transition-all ${
                    idx === breadcrumbs.length - 1 && !viewingFile ? 'bg-indigo-50 text-indigo-600 font-black' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-500'
                  }`}
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
            {viewingFile && (
              <>
                <ChevronRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md truncate max-w-[200px]">{viewingFile.name}</span>
              </>
            )}
          </div>
          {viewingFile && (
            <button onClick={() => setViewingFile(null)} className="shrink-0 p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-all" title="Đóng viewer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {viewingFile ? (
            /* ── File Viewer ── */
            <div className="p-5 animate-in fade-in duration-200">
              <DocumentViewer
                fileType={extToDocFileType(viewingFile.extension)}
                fileStorageKey={getAbsolutePath(viewingFile)}
                fileName={viewingFile.name}
                docId={`lib_${viewingFile.path}`}
              />
            </div>
          ) : loadingGrid ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              <span className="text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-wider">Đang tải...</span>
            </div>
          ) : folderItems.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
              <FolderOpen className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Thư mục trống</h3>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                Kéo file vào <button onClick={openInExplorer} className="text-indigo-500 hover:underline font-bold">thư mục trên máy tính</button> rồi bấm <RefreshCw className="w-3 h-3 inline" /> Làm mới
              </p>
              <button
                onClick={() => { setShowNewFolder(true); setNewFolderParent(activeFolderPath); setNewFolderName(''); }}
                className="mt-4 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm"
              >
                <FolderPlus className="w-3.5 h-3.5" /> Tạo thư mục
              </button>
            </div>
          ) : (
            /* ── Grid View ── */
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {folderItems.map((item, idx) => {
                const ft = item.isDirectory ? null : getFileTypeInfo(item.extension);
                return (
                  <div
                    key={item.path}
                    className="group relative bg-white rounded-xl border border-slate-100 hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${idx * 25}ms` }}
                    onClick={() => item.isDirectory ? setActiveFolderPath(item.path) : setViewingFile(item)}
                  >
                    <div className={`h-20 flex items-center justify-center ${item.isDirectory ? 'bg-amber-50/50' : 'bg-slate-50/50'} border-b border-slate-50`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        item.isDirectory ? 'bg-amber-50 border-amber-200 text-amber-500' : `${ft?.bg} ${ft?.color}`
                      } group-hover:scale-110 transition-transform duration-300`}>
                        {item.isDirectory ? <FolderOpen className="w-6 h-6" /> : ft?.bigIcon}
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[10px] font-bold text-slate-700 truncate" title={item.name}>{item.name}</p>
                      <p className="text-[8px] text-slate-400 font-bold mt-0.5">
                        {item.isDirectory ? 'Thư mục' : `${ft?.label} · ${formatFileSize(item.size)}`}
                      </p>
                    </div>
                    {/* Mini context button */}
                    <button
                      onClick={e => { e.stopPropagation(); onContextMenuAction(item); }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md opacity-0 group-hover:opacity-100 bg-white/90 text-slate-400 hover:text-slate-600 shadow-sm transition-all"
                      title="Tùy chọn"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Context Menu Dropdown (floating) ═══ */}
      {contextItem && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextItem(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest truncate border-b border-slate-50 mb-1">{contextItem.name}</div>
            {contextItem.isDirectory && (
              <button
                onClick={() => { const p = contextItem.path; setContextItem(null); setShowNewFolder(true); setNewFolderParent(p); setNewFolderName(''); }}
                className="w-full px-3 py-2 text-left text-[10px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
              >
                <FolderPlus className="w-3 h-3" /> Thư mục con mới
              </button>
            )}
            <button
              onClick={() => { setRenameItem(contextItem); setRenameValue(contextItem.name); setContextItem(null); }}
              className="w-full px-3 py-2 text-left text-[10px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
            >
              <Edit3 className="w-3 h-3" /> Đổi tên
            </button>
            <div className="h-px bg-slate-100 mx-2" />
            <button
              onClick={() => { setDeleteItem(contextItem); setContextItem(null); }}
              className="w-full px-3 py-2 text-left text-[10px] font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Xóa (Thùng rác)
            </button>
          </div>
        </>
      )}

      {/* ═══ New Folder Modal ═══ */}
      {showNewFolder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowNewFolder(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 flex items-center gap-3">
              <FolderPlus className="w-5 h-5 text-white" />
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Thư mục mới</h2>
            </div>
            <div className="p-6">
              <p className="text-[9px] text-slate-400 font-bold mb-2 uppercase tracking-wider">Thư mục cha: <span className="text-slate-600">{newFolderParent || '(Gốc)'}</span></p>
              <input autoFocus type="text" placeholder="Nhập tên thư mục..." className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-[12px] font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateFolder()} />
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setShowNewFolder(false)} className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-all">Hủy</button>
              <button onClick={handleCreateFolder} disabled={!newFolderName.trim()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-40">Tạo</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Rename Modal ═══ */}
      {renameItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setRenameItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
              <Edit3 className="w-5 h-5 text-white" />
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Đổi tên</h2>
            </div>
            <div className="p-6">
              <p className="text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-wider">Tên hiện tại: <span className="text-slate-600">{renameItem.name}</span></p>
              <input autoFocus type="text" placeholder="Nhập tên mới..." className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-[12px] font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all" value={renameValue} onChange={e => setRenameValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRename()} />
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setRenameItem(null)} className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-all">Hủy</button>
              <button onClick={handleRename} disabled={!renameValue.trim()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-40">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Delete Confirmation Modal ═══ */}
      {deleteItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-rose-600 to-red-600 px-6 py-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-white" />
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Xác nhận xóa</h2>
                <p className="text-[9px] text-white/70 font-bold mt-0.5">File sẽ được chuyển vào Thùng rác</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[12px] text-slate-700 leading-relaxed">
                Bạn có chắc chắn muốn xóa <span className="font-black text-rose-600">"{deleteItem.name}"</span>?
              </p>
              {deleteItem.isDirectory && (
                <p className="text-[10px] text-amber-600 mt-2 font-bold bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">⚠️ Toàn bộ file bên trong cũng sẽ bị xóa.</p>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setDeleteItem(null)} className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-all">Hủy</button>
              <button onClick={handleDelete} className="bg-rose-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-rose-700 transition-all shadow-sm">
                <Trash2 className="w-3.5 h-3.5" /> Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────
// Main LibraryPanel
// ──────────────────────────────────────────────
const LibraryPanel: React.FC<LibraryPanelProps> = ({ exams, onSelect, onDelete }) => {
  const [activeLibTab, setActiveLibTab] = useState<'exams' | 'explorer'>('explorer');

  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-4 overflow-y-auto bg-slate-50/30 custom-scrollbar">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl p-3 rounded-xl border border-white shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-500 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight uppercase">Kho <span className="text-indigo-600">Học Liệu</span></h1>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{exams.length} đề thi · File Explorer</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveLibTab('exams')} className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all flex items-center gap-2 ${activeLibTab === 'exams' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            <FileText className="w-3.5 h-3.5" /> Đề thi
            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[8px] font-black ${activeLibTab === 'exams' ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-200 text-slate-400'}`}>{exams.length}</span>
          </button>
          <button onClick={() => setActiveLibTab('explorer')} className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all flex items-center gap-2 ${activeLibTab === 'explorer' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            <FolderOpen className="w-3.5 h-3.5" /> Thư viện tài liệu
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeLibTab === 'exams' ? (
          <ExamTab exams={exams} onSelect={onSelect} onDelete={onDelete} />
        ) : (
          <FileExplorerTab />
        )}
      </div>
    </div>
  );
};

export default LibraryPanel;
