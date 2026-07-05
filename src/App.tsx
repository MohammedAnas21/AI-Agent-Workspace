import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { AgentsPage } from './components/AgentsPage';
import { FilesPage } from './components/FilesPage';
import { MemoryPage } from './components/MemoryPage';
import { ProductivityHub } from './components/ProductivityHub';
import { SettingsPage } from './components/SettingsPage';
import {
  Menu,
  Search,
  Keyboard,
  X,
  Compass,
  FileText,
  Brain,
  FolderOpen,
  CornerDownLeft,
  MessageSquare,
  CheckSquare
} from 'lucide-react';

function WorkspaceLayout() {
  const {
    currentTab,
    setCurrentTab,
    chats,
    activeChatId,
    setActiveChatId,
    selectedAgent,
    createNewChat,
    sidebarCollapsed,
    setSidebarCollapsed,
    files,
    memories,
    notes,
    todos,
    calendarEvents,
    settings
  } = useWorkspace();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Command Palette & Keyboard Shortcuts Helpers State
  const [searchPaletteOpen, setSearchPaletteOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [paletteSearchQuery, setPaletteSearchQuery] = useState('');
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);

  const activeChat = chats.find(c => c.id === activeChatId);

  type PaletteResult = {
    type: string;
    label: string;
    sublabel: string;
    shortcut?: string;
    action: () => void;
  };

  const baseActions = useMemo<PaletteResult[]>(() => [
    {
      type: 'action',
      label: 'Create New Chat',
      sublabel: 'Open a fresh sandbox workspace session',
      shortcut: '⌘ N',
      action: () => { createNewChat(); setCurrentTab('chat'); setSearchPaletteOpen(false); }
    },
    {
      type: 'action',
      label: 'Go to Chat Console',
      sublabel: 'View current active conversation stream',
      shortcut: '⌘ 1',
      action: () => { setCurrentTab('chat'); setSearchPaletteOpen(false); }
    },
    {
      type: 'action',
      label: 'Go to Specialized Agents',
      sublabel: 'Browse professional persona registry',
      shortcut: '⌘ 2',
      action: () => { setCurrentTab('agents'); setSearchPaletteOpen(false); }
    },
    {
      type: 'action',
      label: 'Go to Files Cabinet',
      sublabel: 'Manage uploaded PDFs, images, and text context files',
      shortcut: '⌘ 3',
      action: () => { setCurrentTab('files'); setSearchPaletteOpen(false); }
    },
    {
      type: 'action',
      label: 'Go to Memory Bank',
      sublabel: 'Audit preferences & contextual cognitive facts',
      shortcut: '⌘ 4',
      action: () => { setCurrentTab('memory'); setSearchPaletteOpen(false); }
    },
    {
      type: 'action',
      label: 'Go to Productivity Suite',
      sublabel: 'Access notes, todo lists, calendars, and alerts',
      shortcut: '⌘ 5',
      action: () => { setCurrentTab('productivity'); setSearchPaletteOpen(false); }
    },
    {
      type: 'action',
      label: 'Go to Settings Panel',
      sublabel: 'Configure themes, model speeds, and speaking voices',
      shortcut: '⌘ ,',
      action: () => { setCurrentTab('settings'); setSearchPaletteOpen(false); }
    },
    {
      type: 'action',
      label: 'Toggle Sidebar Panel',
      sublabel: 'Expand or collapse the left sidebar',
      shortcut: '⌘ B',
      action: () => { setSidebarCollapsed(!sidebarCollapsed); setSearchPaletteOpen(false); }
    },
  ], [sidebarCollapsed]);

  const filteredResults = useMemo<PaletteResult[]>(() => {
    if (!paletteSearchQuery.trim()) {
      return baseActions;
    }

    const query = paletteSearchQuery.toLowerCase();
    const results: PaletteResult[] = [];

    baseActions.forEach(act => {
      if (act.label.toLowerCase().includes(query) || act.sublabel.toLowerCase().includes(query)) {
        results.push(act);
      }
    });

    chats.forEach(c => {
      if (c.title.toLowerCase().includes(query)) {
        results.push({
          type: 'chat',
          label: c.title,
          sublabel: 'Go to active conversation thread',
          action: () => { setActiveChatId(c.id); setCurrentTab('chat'); setSearchPaletteOpen(false); }
        });
      }
      c.messages.forEach(m => {
        if (m.content.toLowerCase().includes(query)) {
          if (!results.some(r => r.type === 'chat' && r.label === c.title)) {
            results.push({
              type: 'chat',
              label: c.title,
              sublabel: `Message matches: "${m.content.substring(0, 35)}..."`,
              action: () => { setActiveChatId(c.id); setCurrentTab('chat'); setSearchPaletteOpen(false); }
            });
          }
        }
      });
    });

    files.forEach(f => {
      if (f.name.toLowerCase().includes(query)) {
        results.push({
          type: 'file',
          label: f.name,
          sublabel: `Uploaded session file (${f.type})`,
          action: () => { setCurrentTab('files'); setSearchPaletteOpen(false); }
        });
      }
    });

    memories.forEach(m => {
      if (m.content.toLowerCase().includes(query)) {
        results.push({
          type: 'memory',
          label: m.content,
          sublabel: 'User Cognitive Fact',
          action: () => { setCurrentTab('memory'); setSearchPaletteOpen(false); }
        });
      }
    });

    notes.forEach(n => {
      if (n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query)) {
        results.push({
          type: 'note',
          label: n.title,
          sublabel: 'Productivity text note',
          action: () => { setCurrentTab('productivity'); setSearchPaletteOpen(false); }
        });
      }
    });

    todos.forEach(t => {
      if (t.text.toLowerCase().includes(query)) {
        results.push({
          type: 'todo',
          label: t.text,
          sublabel: 'Active productivity task item',
          action: () => { setCurrentTab('productivity'); setSearchPaletteOpen(false); }
        });
      }
    });

    return results;
  }, [paletteSearchQuery, chats, files, memories, notes, todos, baseActions]);

  // 3. Register global keyboard shortcuts listeners
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const isModKey = e.ctrlKey || e.metaKey;

      // Esc closes menus and search palettes
      if (e.key === 'Escape') {
        if (searchPaletteOpen) {
          e.preventDefault();
          setSearchPaletteOpen(false);
        }
        if (shortcutsHelpOpen) {
          e.preventDefault();
          setShortcutsHelpOpen(false);
        }
      }

      // Ctrl + N (Cmd + N) -> Start new chat
      if (isModKey && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createNewChat();
        setCurrentTab('chat');
      }

      // Ctrl + Shift + F (Cmd + Shift + F) -> Open Search Chat History
      if (isModKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearchPaletteOpen(true);
        setPaletteSearchQuery('');
      }

      // Ctrl + B (Cmd + B) -> Toggle Sidebar
      if (isModKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }

      // Ctrl + , (Cmd + ,) -> Open Settings
      if (isModKey && e.key === ',') {
        e.preventDefault();
        setCurrentTab('settings');
      }

      // Ctrl + / (Cmd + /) -> Show Shortcuts list overlay
      if (isModKey && e.key === '/') {
        e.preventDefault();
        setShortcutsHelpOpen(true);
      }

      // Ctrl + K (Cmd + K) -> Quick search command palette
      if (isModKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchPaletteOpen(true);
        setPaletteSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [sidebarCollapsed, searchPaletteOpen, shortcutsHelpOpen]);

  // Reset index on search query change
  useEffect(() => {
    setSelectedPaletteIndex(0);
  }, [paletteSearchQuery]);

  // Handle Command Palette arrow keys & selection
  useEffect(() => {
    const handlePaletteKeys = (e: KeyboardEvent) => {
      if (!searchPaletteOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedPaletteIndex(prev => (prev + 1) % Math.max(1, filteredResults.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedPaletteIndex(prev => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedPaletteIndex]) {
          filteredResults[selectedPaletteIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handlePaletteKeys);
    return () => window.removeEventListener('keydown', handlePaletteKeys);
  }, [searchPaletteOpen, selectedPaletteIndex, filteredResults]);

  const handleMobileNewChat = () => {
    createNewChat();
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[#EDEDED] font-sans antialiased text-neutral-800 selection:bg-neutral-200 selection:text-black">
      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          id="mobile-sidebar-backdrop"
        />
      )}

      {/* 1. Left Sidebar (Drawer on mobile, standard sidebar on desktop) */}
      <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />

      {/* 2. Main Workspace Viewport */}
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">

        {/* Top-Right Corner Actions (As requested: Tiny profile/avatar and Get Pro button) */}
        <div className="absolute top-4 right-6 z-40 hidden md:flex items-center gap-3" id="top-right-header-actions">
          {/* Keyboard Shortcuts Trigger Button */}
          <button
            onClick={() => setShortcutsHelpOpen(true)}
            className="p-1.5 hover:bg-neutral-200/80 rounded-lg text-neutral-500 hover:text-black transition-colors cursor-pointer"
            title="Keyboard Shortcuts Guide (⌘/)"
            aria-label="Keyboard Shortcuts Guide"
          >
            <Keyboard className="w-4.5 h-4.5" />
          </button>

          {/* Quick Search Palette Button */}
          <button
            onClick={() => setSearchPaletteOpen(true)}
            className="p-1.5 hover:bg-neutral-200/80 rounded-lg text-neutral-500 hover:text-black transition-colors cursor-pointer"
            title="Search & Commands (⌘K)"
            aria-label="Quick Command Palette"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Silver/Grey 3D Metallic style Profile Avatar */}
          <button
            className="w-8 h-8 rounded-full border border-neutral-300 shadow-[inset_0_2.5px_5px_rgba(255,255,255,0.75),0_1.5px_3px_rgba(0,0,0,0.15)] bg-gradient-to-tr from-neutral-500 via-neutral-100 to-neutral-400 cursor-pointer hover:scale-105 transition-transform"
            title="Profile Settings"
            aria-label="Profile Settings"
          />
          <button
            onClick={() => setCurrentTab('settings')}
            className="px-4 py-2 bg-black hover:bg-neutral-900 text-white font-medium text-xs rounded-full cursor-pointer transition-all active:scale-95 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
            id="get-pro-button"
          >
            Get Pro
          </button>
        </div>

        {/* Unified Mobile Header Bar (Visible on mobile only, beautifully styled in light theme) */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#EDEDED] border-b border-neutral-200 text-neutral-800 z-30 shrink-0" id="mobile-header-bar">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-neutral-200 text-neutral-600 hover:text-black transition-colors cursor-pointer shrink-0"
              title="Open Navigation"
              id="mobile-menu-hamburger"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-semibold text-neutral-800 truncate">
                {currentTab === 'chat' && (activeChat ? activeChat.title : (selectedAgent ? `${selectedAgent.name} Workspace` : 'Chat Console'))}
                {currentTab === 'agents' && 'Specialized Agents'}
                {currentTab === 'files' && 'Files Cabinet'}
                {currentTab === 'memory' && 'Memory Bank'}
                {currentTab === 'productivity' && 'Productivity Suite'}
                {currentTab === 'settings' && 'System Settings'}
              </span>
            </div>
          </div>

          {/* Get Pro + Profile Avatar on mobile as well to preserve the same high-end feel! */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setSearchPaletteOpen(true)}
              className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-600"
              title="Search"
              aria-label="Command palette"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTab('settings')}
              className="px-3 py-1.5 bg-black hover:bg-neutral-900 text-white font-medium text-[10px] rounded-full cursor-pointer transition-all"
              id="get-pro-button-mobile"
            >
              Get Pro
            </button>
            <div
              className="w-7 h-7 rounded-full border border-neutral-300 shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.7),0_1px_1.5px_rgba(0,0,0,0.1)] bg-gradient-to-tr from-neutral-500 via-neutral-100 to-neutral-400"
            />
          </div>
        </div>

        {/* Tab content screens */}
        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative" id="main-content-area">
          {currentTab === 'chat' && <ChatInterface />}
          {currentTab === 'agents' && <AgentsPage />}
          {currentTab === 'files' && <FilesPage />}
          {currentTab === 'memory' && <MemoryPage />}
          {currentTab === 'productivity' && <ProductivityHub />}
          {currentTab === 'settings' && <SettingsPage />}
        </div>
      </div>

      {/* ========================================== */}
      {/* 4. QUICK COMMAND & SEARCH PALETTE OVERLAY */}
      {/* ========================================== */}
      {searchPaletteOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-start justify-center p-4 md:p-12 animate-fade-in"
          onClick={() => setSearchPaletteOpen(false)}
          id="search-palette-modal"
        >
          <div
            className="w-full max-w-xl bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden mt-12 flex flex-col max-h-[70vh] transition-all animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center gap-3">
              <Search className="w-4 h-4 text-neutral-450 shrink-0" />
              <input
                type="text"
                placeholder="Type command or query chat log database..."
                value={paletteSearchQuery}
                onChange={e => setPaletteSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-xs text-black placeholder-neutral-400 focus:outline-none"
                autoFocus
              />
              <span className="px-2 py-0.5 text-[9px] font-mono text-neutral-400 border border-neutral-200 rounded">
                ESC
              </span>
            </div>

            {/* Quick Helper */}
            <div className="px-4 py-1.5 bg-neutral-50 border-b border-neutral-100 text-[9px] text-neutral-400 font-mono flex justify-between">
              <span>Use arrow keys to traverse, enter to execute</span>
              <span>Total results: {filteredResults.length}</span>
            </div>

            {/* Results list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none max-h-[350px]">
              {filteredResults.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-xs text-neutral-400 font-mono italic">No workspace elements matched "{paletteSearchQuery}"</p>
                </div>
              ) : (
                filteredResults.map((res, idx) => {
                  const isSelected = idx === selectedPaletteIndex;
                  return (
                    <button
                      key={`${res.type}-${idx}`}
                      onClick={() => res.action()}
                      className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                        isSelected ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-800'
                      }`}
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                        }`}>
                          {res.type === 'action' && <Compass className="w-3.5 h-3.5" />}
                          {res.type === 'chat' && <MessageSquare className="w-3.5 h-3.5" />}
                          {res.type === 'file' && <FolderOpen className="w-3.5 h-3.5" />}
                          {res.type === 'memory' && <Brain className="w-3.5 h-3.5" />}
                          {res.type === 'note' && <FileText className="w-3.5 h-3.5" />}
                          {res.type === 'todo' && <CheckSquare className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{res.label}</p>
                          <p className={`text-[10px] truncate ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                            {res.sublabel}
                          </p>
                        </div>
                      </div>
                      
                      {res.shortcut ? (
                        <span className={`px-2 py-0.5 text-[9px] font-mono rounded ${
                          isSelected ? 'bg-neutral-800 text-neutral-200 border border-neutral-700' : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                        }`}>
                          {res.shortcut}
                        </span>
                      ) : (
                        <CornerDownLeft className="w-3 h-3 text-neutral-400 opacity-60" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 5. KEYBOARD SHORTCUTS HELPER PANEL OVERLAY */}
      {/* ========================================== */}
      {shortcutsHelpOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShortcutsHelpOpen(false)}
          id="keyboard-shortcuts-modal"
        >
          <div
            className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden transition-all animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4.5 h-4.5 text-neutral-800" />
                <h3 className="text-xs font-semibold text-neutral-800 font-sans">Workspace Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShortcutsHelpOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-black transition-colors"
                aria-label="Close"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* List */}
            <div className="p-4 space-y-4 font-sans max-h-[60vh] overflow-y-auto">
              {/* Category 1: Chatting */}
              <div>
                <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">Chat Console</p>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Send message</span>
                    <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-250">Enter</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Insert new line</span>
                    <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-250">Shift + Enter</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Force send (multiline)</span>
                    <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-250">⌘ + Enter</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Load last user message</span>
                    <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-250">↑ (empty input)</span>
                  </div>
                </div>
              </div>

              {/* Category 2: Navigating & UI */}
              <div>
                <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">Global Navigation</p>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Open command palette</span>
                    <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-250">⌘ + K</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Show keyboard shortcuts</span>
                    <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-250">⌘ + /</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Start a new chat session</span>
                    <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-250">⌘ + N</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Search chat logs database</span>
                    <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-250">⌘ + Shift + F</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Toggle left sidebar</span>
                    <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-250">⌘ + B</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Open system settings</span>
                    <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-250">⌘ + ,</span>
                  </div>
                </div>
              </div>

              {/* Category 3: System Controls */}
              <div>
                <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">Controls</p>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Cancel generation / speech / dialogs</span>
                    <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-250">Esc</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Select full message bubble</span>
                    <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-250">Double-Click</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Select full code block</span>
                    <span className="text-neutral-800 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-250">Triple-Click</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center text-[10px] text-neutral-400">
              Note: Option key can be used instead of Command key on Windows.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceLayout />
    </WorkspaceProvider>
  );
}

