
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  ReactFlowProvider, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection, 
  Edge, 
  Node,
  Background,
  Controls,
  Panel,
  useReactFlow,
  getOutgoers
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { SavedWord, PersonalVocabData, MindMapTopic, MindMapData } from '../../types';
import { canvasStorage } from '../../services/localDataService';
import { extractVocabFromText, suggestMindMapBranches } from '../../services/geminiService';
import MindMapNode from './MindMapNode';

// Define custom node types
const nodeTypes = {
  mindmap: MindMapNode,
};

const VocabBankCanvasContent: React.FC = () => {
  const [data, setData] = useState<PersonalVocabData>({ inbox: [], folders: [], topics: [] });
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // React Flow States
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Scanner States
  const [scannedText, setScannedText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [draggedWord, setDraggedWord] = useState<SavedWord | null>(null);

  // Load Data
  useEffect(() => {
    const load = async () => {
      const savedData = await canvasStorage.get();
      setData(savedData);
      
      if (savedData.topics && savedData.topics.length > 0) {
        const firstTopic = savedData.topics[0];
        setActiveTopicId(firstTopic.id);
        setNodes(firstTopic.data.nodes || []);
        setEdges(firstTopic.data.edges || []);
      } else {
        // Create initial topic if none exists
        const initialTopicId = uuidv4();
        const initialNodes: Node[] = [{
          id: 'root',
          type: 'mindmap',
          data: { label: 'Chủ đề mới', isRoot: true },
          position: { x: 0, y: 0 },
        }];
        const initialTopic: MindMapTopic = {
          id: initialTopicId,
          name: 'Chủ đề mới',
          data: { nodes: initialNodes, edges: [] }
        };
        const newData = { ...savedData, topics: [initialTopic] };
        setData(newData);
        setActiveTopicId(initialTopicId);
        setNodes(initialNodes);
        await canvasStorage.save(newData);
      }
      setLoading(false);
    };
    load();
  }, [setNodes, setEdges]);

  // Sync React Flow state to Data and Storage
  useEffect(() => {
    if (loading || !activeTopicId) return;

    const syncState = async () => {
      const updatedTopics = data.topics?.map(t => {
        if (t.id === activeTopicId) {
          return { ...t, data: { nodes, edges } };
        }
        return t;
      }) || [];

      const newData = { ...data, topics: updatedTopics };
      setData(newData);
      await canvasStorage.save(newData);
    };

    // Debounce sync
    const timer = setTimeout(syncState, 500);
    return () => clearTimeout(timer);
  }, [nodes, edges, activeTopicId, loading]);

  // Topic Management
  const createTopic = async () => {
    const name = window.prompt("Nhập tên chủ đề mới:");
    if (!name) return;

    const newId = uuidv4();
    const newNodes: Node[] = [{
      id: 'root',
      type: 'mindmap',
      data: { label: name, isRoot: true },
      position: { x: 0, y: 0 },
    }];
    const newTopic: MindMapTopic = {
      id: newId,
      name,
      data: { nodes: newNodes, edges: [] }
    };

    const newData = { ...data, topics: [...(data.topics || []), newTopic] };
    setData(newData);
    setActiveTopicId(newId);
    setNodes(newNodes);
    setEdges([]);
    await canvasStorage.save(newData);
  };

  const switchTopic = (id: string) => {
    const topic = data.topics?.find(t => t.id === id);
    if (topic) {
      setActiveTopicId(id);
      setNodes(topic.data.nodes);
      setEdges(topic.data.edges);
    }
  };

  const deleteTopic = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ chủ đề này?")) return;
    
    const newTopics = data.topics?.filter(t => t.id !== id) || [];
    const newData = { ...data, topics: newTopics };
    setData(newData);
    await canvasStorage.save(newData);
    
    if (activeTopicId === id) {
        if (newTopics.length > 0) {
            switchTopic(newTopics[0].id);
        } else {
            setActiveTopicId(null);
            setNodes([]);
            setEdges([]);
        }
    }
  };

  const saveAll = async () => {
    const updatedTopics = data.topics?.map(t => {
        if (t.id === activeTopicId) {
            return { ...t, data: { nodes, edges } };
        }
        return t;
    }) || [];
    const newData = { ...data, topics: updatedTopics };
    setData(newData);
    await canvasStorage.save(newData);
    alert("Đã lưu toàn bộ tiến độ!");
  };

  // Branching Logic
  const handleAddChild = useCallback((parentId: string, direction: string) => {
    setNodes((nds) => {
      const parentNode = nds.find((n) => n.id === parentId);
      if (!parentNode) return nds;

      const id = uuidv4();
      const offset = 250;
      let x = parentNode.position.x;
      let y = parentNode.position.y;

      switch (direction) {
        case 'top': y -= offset; break;
        case 'bottom': y += offset; break;
        case 'left': x -= offset; break;
        case 'right': x += offset; break;
      }

      const newNode: Node = {
        id,
        type: 'mindmap',
        data: { label: 'Chi nhánh mới', onAddChild: handleAddChild, onChange: handleNodeLabelChange },
        position: { x, y },
      };

      setEdges((eds) => addEdge({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 3 },
      }, eds));

      return [...nds, newNode];
    });
  }, [setNodes, setEdges]);

  const handleNodeLabelChange = useCallback((id: string, label: string) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleColorChange = useCallback((id: string, color: string) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, color } };
        }
        return node;
      })
    );
    // Sync edge colors for outgoing edges
    setEdges((eds) => 
      eds.map((edge) => {
        if (edge.source === id) {
          return { ...edge, style: { ...edge.style, stroke: color } };
        }
        return edge;
      })
    );
  }, [setNodes, setEdges]);

  // PRO: Recursive Cascading Delete
  const { getNodes, getEdges } = useReactFlow();
  const handleDeleteNode = useCallback((id: string) => {
    const allNodes = getNodes();
    const allEdges = getEdges();

    const getChildIds = (nodeId: string): string[] => {
      const children = allEdges
        .filter((edge) => edge.source === nodeId)
        .map((edge) => edge.target);
      
      let allChildIds = [...children];
      for (const childId of children) {
          allChildIds = [...allChildIds, ...getChildIds(childId)];
      }
      return allChildIds;
    };

    const idsToRemove = [id, ...getChildIds(id)];
    
    setNodes((nds) => nds.filter((n) => !idsToRemove.includes(n.id)));
    setEdges((eds) => eds.filter((e) => !idsToRemove.includes(e.source) && !idsToRemove.includes(e.target)));
  }, [getNodes, getEdges, setNodes, setEdges]);

  // PRO: AI Suggestions (Hotfix UX)
  const handleAiSuggest = useCallback(async (id: string, text: string) => {
    const currentTopic = data.topics?.find(t => t.id === activeTopicId)?.name || 'General';
    
    // Set loading state on node
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, isAiLoading: true } } : n));

    try {
      const suggestions = await suggestMindMapBranches(currentTopic, text);
      
      setNodes((nds) => {
        const parentNode = nds.find(n => n.id === id);
        if (!parentNode) return nds;

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        const radius = 300;
        const parentColor = (parentNode.data.color as string) || '#6366f1';

        suggestions.forEach((word, index) => {
          const angle = (index / suggestions.length) * 2 * Math.PI;
          const x = parentNode.position.x + radius * Math.cos(angle);
          const y = parentNode.position.y + radius * Math.sin(angle);
          const childId = uuidv4();

          newNodes.push({
            id: childId,
            type: 'mindmap',
            data: { label: word, color: parentColor },
            position: { x, y }
          });

          newEdges.push({
            id: `e-${id}-${childId}`,
            source: id,
            target: childId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: parentColor, strokeWidth: 3 },
          });
        });

        setEdges(eds => [...eds, ...newEdges]);
        return [...nds, ...newNodes];
      });
    } catch (e: any) {
      alert(e.message);
    } finally {
      // Hotfix: Đảm bảo TẮT loading trong mọi trường hợp (kể cả lỗi 429)
      setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, isAiLoading: false } } : n));
    }
  }, [activeTopicId, data.topics, setNodes, setEdges]);

  // Inject functions into child nodes
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map(node => ({
        ...node,
        data: { 
            ...node.data, 
            onAddChild: handleAddChild, 
            onChange: handleNodeLabelChange,
            onColorChange: handleColorChange,
            onAiSuggest: handleAiSuggest,
            onDeleteNode: handleDeleteNode
        }
    }));
  }, [nodes, handleAddChild, handleNodeLabelChange, handleColorChange, handleAiSuggest, handleDeleteNode]);

  // AI Scanner Logic
  const handleScan = async () => {
    if (!scannedText.trim()) return;
    setIsScanning(true);
    try {
      const extracted = await extractVocabFromText(scannedText);
      const newWords: SavedWord[] = extracted.map((item: any) => ({
        id: `scan_${Date.now()}_${uuidv4().substring(0, 5)}`,
        word: item.word,
        meaning: item.meaning,
        ipa: item.ipa,
        partOfSpeech: item.pos,
        pronunciation: item.ipa
      }));

      const newData = {
        ...data,
        inbox: [...newWords, ...data.inbox]
      };
      setData(newData);
      await canvasStorage.save(newData);
      setScannedText('');
    } catch (e: any) {
      alert(e.message || "Lỗi AI không thể phân tích văn bản.");
    } finally {
      setIsScanning(false);
    }
  };

  // Drag & Drop onto Canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const wordDataStr = event.dataTransfer.getData('application/reactflow');
    if (!wordDataStr) return;

    const word = JSON.parse(wordDataStr) as SavedWord;
    
    // Calculate position relative to React Flow container
    const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    // Simple offset for demonstration
    const position = {
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top - 25,
    };

    const newNode: Node = {
      id: uuidv4(),
      type: 'mindmap',
      position,
      data: { 
        label: `${word.word} (${word.ipa})\n${word.meaning}`,
        onAddChild: handleAddChild,
        onChange: handleNodeLabelChange
      },
    };

    setNodes((nds) => [...nds, newNode]);
    
    // Remove from inbox
    const newInbox = data.inbox.filter(w => w.id !== word.id);
    const newData = { ...data, inbox: newInbox };
    setData(newData);
    canvasStorage.save(newData); // Save instantly for dnd
  }, [data, handleAddChild, handleNodeLabelChange, setNodes]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-[32px]">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-slate-50 rounded-[32px] overflow-hidden font-sans border border-slate-100 shadow-2xl">
      
      {/* Sidebar (30%) */}
      <div className="w-[400px] border-r border-slate-200 flex flex-col bg-white z-20 shadow-xl overflow-hidden">
        
        {/* Topic Selector */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-4">Danh sách chủ đề</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar mb-4">
                {data.topics?.map(topic => (
                    <div key={topic.id} className="relative group">
                        <button 
                            onClick={() => switchTopic(topic.id)}
                            className={`w-full p-3 rounded-xl flex items-center justify-between transition-all font-bold text-[11px] uppercase tracking-wider
                                ${activeTopicId === topic.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <span>{topic.name}</span>
                            {activeTopicId === topic.id && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
                        </button>
                        <button 
                            onClick={(e) => deleteTopic(topic.id, e)}
                            title="Xóa chủ đề"
                            className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>
            <button 
                onClick={createTopic}
                className="w-full py-3 bg-white border-2 border-dashed border-indigo-200 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
                + Chủ đề mới
            </button>
        </div>

        {/* AI Scanner */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/20">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-4">Quét văn bản AI</h3>
            <textarea 
                value={scannedText}
                onChange={(e) => setScannedText(e.target.value)}
                placeholder="Dán văn bản tiếng Anh vào đây..."
                className="w-full h-32 p-4 bg-white border border-slate-200 rounded-2xl text-[13px] font-medium text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all resize-none mb-4"
            />
            <button 
                onClick={handleScan}
                disabled={isScanning || !scannedText.trim()}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[3px] transition-all flex items-center justify-center gap-2 shadow-lg ${isScanning ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-indigo-600 transition-all'}`}
            >
                {isScanning ? "Đang xử lý..." : "Trích xuất từ vựng"}
            </button>
        </div>

        {/* Inbox */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/10">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] px-2 mb-2">Hộp thư (Inbox)</h3>
          {data.inbox.length === 0 ? (
            <p className="text-[10px] text-center text-slate-300 font-bold py-10">Kéo thả từ vựng vào sơ đồ</p>
          ) : (
            data.inbox.map(w => (
              <div
                key={w.id}
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', JSON.stringify(w));
                    e.dataTransfer.effectAllowed = 'move';
                }}
                className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] border-l-4 border-l-indigo-400"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black text-slate-800 uppercase">{w.word}</span>
                  <span className="text-[8px] font-serif italic text-indigo-400">{w.ipa}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 truncate">{w.meaning}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Mind Map Builder Area (70%) */}
      <div className="flex-1 relative bg-white">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodesWithCallbacks}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            defaultEdgeOptions={{ 
                type: 'smoothstep', 
                style: { stroke: '#6366f1', strokeWidth: 3 },
                animated: true 
            }}
          >
            <Background color="#f1f5f9" gap={20} />
            <Controls className="!bg-white !border-slate-100 !shadow-2xl !rounded-xl overflow-hidden" />
            <Panel position="top-right" className="flex items-center gap-3">
                <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-white shadow-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Mind Map Builder Pro v3.0</p>
                </div>
                <button 
                    onClick={saveAll}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-100 hover:scale-105 transition-transform"
                >
                    💾 Lưu toàn bộ
                </button>
            </Panel>
          </ReactFlow>
        </ReactFlowProvider>
      </div>

    </div>
  );
};

const VocabBankCanvas: React.FC = () => {
    return (
        <ReactFlowProvider>
            <VocabBankCanvasContent />
        </ReactFlowProvider>
    );
};

export default VocabBankCanvas;
