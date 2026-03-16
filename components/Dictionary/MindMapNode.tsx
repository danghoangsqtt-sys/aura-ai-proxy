
import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, NodeToolbar } from '@xyflow/react';

const MindMapNode = ({ id, data, selected }: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const onAddChild = (direction: 'top' | 'right' | 'bottom' | 'left') => {
    if (typeof (data as any).onAddChild === 'function') {
      (data as any).onAddChild(id, direction);
    }
  };

  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (typeof (data as any).onChange === 'function') {
      (data as any).onChange(id, e.target.value);
    }
  };

  const onColorChange = (color: string) => {
    if (typeof (data as any).onColorChange === 'function') {
      (data as any).onColorChange(id, color);
    }
  };

  const onAiSuggest = () => {
    if (typeof (data as any).onAiSuggest === 'function') {
      (data as any).onAiSuggest(id, data.label);
    }
  };

  const onDelete = () => {
    if (typeof (data as any).onDeleteNode === 'function') {
      (data as any).onDeleteNode(id);
    }
  };

  // Determine text color based on background
  const bgColor = (data.color as string) || '#ffffff';
  const isDark = ['#4f46e5', '#ef4444', '#22c55e', '#6366f1'].includes(bgColor);
  const textColor = isDark ? 'text-white' : 'text-slate-800';

  return (
    <div 
      className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 shadow-xl min-w-[150px]
        ${selected ? 'ring-4 ring-indigo-50 border-indigo-400' : 'border-slate-100 hover:border-indigo-300'}`}
      style={{ backgroundColor: bgColor, borderColor: selected ? undefined : bgColor === '#ffffff' ? undefined : bgColor }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Node Toolbar (Pro Features) */}
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-2 bg-white p-2 rounded-2xl shadow-2xl border border-slate-100 mb-2 animate-in fade-in zoom-in-95 duration-200">
        {/* Colors */}
        <div className="flex gap-1 border-r border-slate-100 pr-2 mr-2">
            {['#ffffff', '#4f46e5', '#6366f1', '#22c55e', '#ef4444', '#f59e0b'].map(c => (
                <button 
                    key={c}
                    onClick={() => onColorChange(c)}
                    title={`Chọn màu: ${c}`}
                    className="w-5 h-5 rounded-full border border-slate-200 transition-transform hover:scale-125"
                    style={{ backgroundColor: c }}
                />
            ))}
        </div>
        
        {/* AI Suggest */}
        <button 
            onClick={onAiSuggest}
            disabled={!!data.isAiLoading}
            title="Gợi ý từ vựng AI"
            className={`p-2 rounded-lg transition-colors ${data.isAiLoading ? 'bg-indigo-50 text-indigo-300' : 'hover:bg-indigo-50 text-indigo-600'}`}
        >
            {data.isAiLoading ? (
                <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
            )}
        </button>

        {/* Delete */}
        <button 
            onClick={onDelete}
            title="Xóa nhánh"
            className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </NodeToolbar>
      {/* Handles (Hidden but functional) */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Left} className="opacity-0" />
      <Handle type="target" position={Position.Right} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />

      {/* Inline Text Editor */}
      <textarea
        value={data.label as string}
        onChange={onTextChange}
        placeholder="Nhập nội dung..."
        rows={1}
        className={`w-full bg-transparent border-none outline-none text-center font-black uppercase text-[11px] tracking-widest resize-none overflow-hidden custom-scrollbar ${textColor}`}
        style={{ height: 'auto' }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'inherit';
          target.style.height = `${target.scrollHeight}px`;
        }}
      />

      {/* Branching Buttons (+) */}
      {(selected || isHovered) && (
        <>
          <button 
            onClick={() => onAddChild('top')}
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg hover:scale-125 transition-transform z-50 shadow-lg"
          >
            +
          </button>
          <button 
            onClick={() => onAddChild('right')}
            className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg hover:scale-125 transition-transform z-50 shadow-lg"
          >
            +
          </button>
          <button 
            onClick={() => onAddChild('bottom')}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg hover:scale-125 transition-transform z-50 shadow-lg"
          >
            +
          </button>
          <button 
            onClick={() => onAddChild('left')}
            className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg hover:scale-125 transition-transform z-50 shadow-lg"
          >
            +
          </button>
        </>
      )}

      {/* Visual Decoration for Root */}
      {data.isRoot && (
        <div className="absolute -inset-1 bg-indigo-500/10 blur-xl rounded-full -z-10 animate-pulse"></div>
      )}
    </div>
  );
};

export default memo(MindMapNode);
