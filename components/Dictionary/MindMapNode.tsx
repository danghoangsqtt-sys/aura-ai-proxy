
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

  const onDelete = () => {
    console.info(`[MindMapNode] Requesting deletion for node: ${id}`);
    if (typeof (data as any).onDeleteNode === 'function') {
      (data as any).onDeleteNode(id);
    }
  };

  // Determine text color and glow based on background
  const bgColor = (data.color as string) || '#ffffff';
  const isDark = ['#4f46e5', '#ef4444', '#22c55e', '#6366f1'].includes(bgColor);
  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const glassBg = bgColor === '#ffffff' ? 'bg-white/70' : '';

  return (
    <div 
      className={`group relative p-4 rounded-[2rem] border transition-all duration-500 backdrop-blur-md shadow-2xl min-w-[150px]
        ${glassBg}
        ${selected ? 'ring-[6px] ring-indigo-500/10 border-indigo-400 shadow-indigo-100/50' : 'border-white/20 hover:border-indigo-300 shadow-slate-200/50'}`}
      style={{ backgroundColor: bgColor !== '#ffffff' ? `${bgColor}dd` : undefined, borderColor: selected ? undefined : bgColor === '#ffffff' ? undefined : `${bgColor}44` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-2 bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/50 mb-2 animate-in fade-in zoom-in-95 duration-300">
        {/* Colors */}
        <div className="flex gap-1 border-r border-slate-200 pr-2 mr-2">
            {['#ffffff', '#4f46e5', '#6366f1', '#22c55e', '#ef4444', '#f59e0b'].map(c => (
                <button 
                    key={c}
                    onClick={() => onColorChange(c)}
                    title={`Chọn màu: ${c}`}
                    className="w-5 h-5 rounded-full border border-slate-100 transition-all hover:scale-125 hover:rotate-12 shadow-sm"
                    style={{ backgroundColor: c }}
                />
            ))}
        </div>

        {/* Delete */}
        <button 
            onClick={onDelete}
            title="Xóa nhánh"
            className="p-2 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl transition-all active:scale-95"
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
        className={`w-full bg-transparent border-none outline-none text-center font-bold text-[12px] tracking-wide resize-none overflow-hidden custom-scrollbar ${textColor} leading-tight`}
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
