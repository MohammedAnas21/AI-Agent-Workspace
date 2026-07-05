import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Brain, Search, Trash2, Edit3, Pin, Plus, ToggleLeft, ToggleRight, Check, X, ShieldAlert } from 'lucide-react';
import { Memory } from '../types';

export const MemoryPage: React.FC = () => {
  const {
    memories,
    memoryEnabled,
    setMemoryEnabled,
    addMemory,
    deleteMemory,
    updateMemory,
    pinMemory
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newMemoryText, setNewMemoryText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const categories = [
    { value: 'all', label: 'All facts' },
    { value: 'preference', label: 'Preferences' },
    { value: 'goal', label: 'Goals' },
    { value: 'project', label: 'Projects' },
    { value: 'tool', label: 'Tools' },
    { value: 'workflow', label: 'Workflows' },
    { value: 'general', label: 'General' }
  ];

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemoryText.trim()) {
      addMemory(newMemoryText.trim(), (selectedCategory === 'all' ? 'general' : selectedCategory) as Memory['category']);
      setNewMemoryText('');
    }
  };

  const handleStartEdit = (mem: Memory) => {
    setEditingId(mem.id);
    setEditingText(mem.content);
  };

  const handleSaveEdit = (id: string) => {
    if (editingText.trim()) {
      updateMemory(id, editingText.trim());
    }
    setEditingId(null);
  };

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pinned = filteredMemories.filter(m => m.isPinned);
  const unpinned = filteredMemories.filter(m => !m.isPinned);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'preference': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'goal': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'project': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'tool': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'workflow': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-250';
    }
  };

  const renderMemoryRow = (mem: Memory) => {
    const isEditing = editingId === mem.id;

    return (
      <div
        key={mem.id}
        className="group flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-300 transition-all duration-200 shadow-2xs"
      >
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded text-[8px] font-mono border uppercase tracking-wider ${getCategoryColor(mem.category)}`}>
              {mem.category}
            </span>
            <span className="text-[9px] font-mono text-neutral-450">
              {new Date(mem.createdAt).toLocaleDateString()}
            </span>
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editingText}
                onChange={e => setEditingText(e.target.value)}
                className="flex-1 bg-neutral-50 border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-black"
                autoFocus
              />
              <button
                onClick={() => handleSaveEdit(mem.id)}
                className="p-1.5 bg-black text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="p-1.5 bg-neutral-200 text-neutral-600 hover:bg-neutral-300 rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-xs font-semibold text-neutral-800 leading-relaxed break-words font-sans">
              {mem.content}
            </p>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
          <button
            onClick={() => handleStartEdit(mem)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors cursor-pointer"
            title="Edit fact"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => pinMemory(mem.id)}
            className={`p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer ${
              mem.isPinned ? 'text-black font-semibold' : 'text-neutral-400 hover:text-black'
            }`}
            title={mem.isPinned ? 'Unpin' : 'Pin fact'}
          >
            <Pin className={`w-3.5 h-3.5 ${mem.isPinned ? 'fill-black text-black' : ''}`} />
          </button>
          <button
            onClick={() => deleteMemory(mem.id)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
            title="Delete fact"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#EDEDED] px-6 py-8 md:px-12 md:py-12 scrollbar-none">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-neutral-300/60 mt-6 md:mt-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-neutral-200 text-neutral-850 border border-neutral-300">
                Cognitive Registry
              </span>
            </div>
            <h2 className="text-3xl font-semibold text-black tracking-tight flex items-center gap-2.5 font-sans">
              <Brain className="w-8 h-8 text-black shrink-0" />
              Long-Term Memory Bank
            </h2>
            <p className="text-xs text-neutral-500 mt-2 max-w-xl font-sans leading-relaxed">
              This system aggregates goals, workflows, and tools you share. The assistant uses this list to tailor and customize responses.
            </p>
          </div>

          {/* Toggle Memory */}
          <div className="flex items-center gap-3 bg-white border border-neutral-200 p-3 rounded-2xl shrink-0 shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-neutral-850 font-sans">Active Memory</p>
              <p className="text-[10px] text-neutral-450 font-sans">Enable facts parsing</p>
            </div>
            <button
              onClick={() => setMemoryEnabled(!memoryEnabled)}
              className="text-neutral-400 hover:text-black transition-colors cursor-pointer focus:outline-none"
            >
              {memoryEnabled ? (
                <ToggleRight className="w-10 h-10 text-black" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-neutral-350" />
              )}
            </button>
          </div>
        </div>

        {!memoryEnabled && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3 text-xs text-amber-700 font-sans shadow-2xs">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Contextual Memory is Disabled</p>
              <p className="text-neutral-500 mt-0.5">The agents will not recall or reference saved memories until you enable them.</p>
            </div>
          </div>
        )}

        {/* Input New Memory */}
        <form onSubmit={handleCreateMemory} className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Add user preference, e.g. 'I prefer writing utility codes in TypeScript...'"
            value={newMemoryText}
            onChange={e => setNewMemoryText(e.target.value)}
            className="flex-1 bg-white border border-neutral-300 rounded-xl px-4 py-3 text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-neutral-400 transition-all min-h-[44px] shadow-2xs font-sans"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-5 py-3 bg-black text-white hover:bg-neutral-850 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-xs min-h-[44px] active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Fact</span>
          </button>
        </form>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer font-sans ${
                  selectedCategory === cat.value
                    ? 'bg-black border-black text-white'
                    : 'bg-white border-neutral-355 text-neutral-600 hover:text-black hover:border-neutral-350'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-450" />
            <input
              type="text"
              placeholder="Search memory records..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-neutral-350 rounded-xl py-1.5 pl-8 pr-3 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-neutral-450 shadow-2xs transition-all font-sans"
            />
          </div>
        </div>

        {/* Memories Display */}
        {pinned.length === 0 && unpinned.length === 0 ? (
          <div className="border border-neutral-300 rounded-2xl p-12 text-center bg-white/40">
            <p className="text-xs text-neutral-500 font-mono italic">No memory records stored yet. Prompt your workspace assistant to 'Remember this fact' to start!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pinned Records */}
            {pinned.length > 0 && (
              <div>
                <h3 className="text-xs font-mono tracking-wider text-neutral-500 uppercase mb-3 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-black fill-black shrink-0" />
                  Pinned Facts
                </h3>
                <div className="space-y-3">
                  {pinned.map(mem => renderMemoryRow(mem))}
                </div>
              </div>
            )}

            {/* Unpinned Records */}
            {unpinned.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <h3 className="text-xs font-mono tracking-wider text-neutral-500 uppercase mb-3 mt-6">
                    Other Facts
                  </h3>
                )}
                <div className="space-y-3">
                  {unpinned.map(mem => renderMemoryRow(mem))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
