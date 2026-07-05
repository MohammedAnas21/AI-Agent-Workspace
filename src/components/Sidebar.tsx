import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AGENTS } from '../agents';
import {
  MessageSquare,
  Search,
  Plus,
  Compass,
  Brain,
  Settings,
  FolderClosed,
  Pin,
  Trash2,
  Edit2,
  Check,
  Calendar,
  X,
  Sparkles,
  Columns,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    currentTab,
    setCurrentTab,
    chats,
    activeChatId,
    setActiveChatId,
    createNewChat,
    deleteChat,
    renameChat,
    pinChat,
    setSelectedAgent
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [secondaryPanelOpen, setSecondaryPanelOpen] = useState(false);

  const filteredChats = chats.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(c => c.isPinned);
  const recentChats = filteredChats.filter(c => !c.isPinned);

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      renameChat(id, editingTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleNewChat = () => {
    createNewChat();
    onCloseMobile?.();
  };

  const handleTabClick = (tab: typeof currentTab) => {
    setCurrentTab(tab);
    onCloseMobile?.();
  };

  const selectChat = (id: string) => {
    setActiveChatId(id);
    const chat = chats.find(c => c.id === id);
    if (chat && chat.agentId) {
      const agent = AGENTS.find(a => a.id === chat.agentId);
      setSelectedAgent(agent || null);
    } else {
      setSelectedAgent(null);
    }
    setCurrentTab('chat');
    onCloseMobile?.();
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 md:relative h-full flex transition-all duration-300 ease-in-out shrink-0 select-none ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      id="application-sidebar-container"
    >
      {/* 1. PRIMARY ICON-ONLY SIDEBAR (As requested in image) */}
      <div 
        className="w-16 h-full bg-[#EDEDED] border-r border-neutral-200 flex flex-col items-center py-4 justify-between shrink-0"
        id="sidebar-primary-rail"
      >
        {/* Top Section Cluster */}
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Toggle Panel / Columns Trigger */}
          <button
            onClick={() => setSecondaryPanelOpen(!secondaryPanelOpen)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
              secondaryPanelOpen ? 'bg-neutral-200 text-black' : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
            }`}
            title="Toggle workspaces drawer"
            id="sidebar-toggle-drawer"
          >
            <Columns className="w-5 h-5" />
          </button>

          {/* Solid Black New Chat App-style Square Icon (Directly like Reference Image) */}
          <button
            onClick={handleNewChat}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-black text-white hover:bg-neutral-900 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="New Conversation"
            id="sidebar-new-chat"
          >
            <Plus className="w-5 h-5 font-bold" />
          </button>

          <div className="w-8 h-[1px] bg-neutral-200 my-1" />

          {/* Chat Icon */}
          <button
            onClick={() => handleTabClick('chat')}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
              currentTab === 'chat' && !secondaryPanelOpen
                ? 'bg-neutral-200 text-black font-semibold'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
            }`}
            title="Chat Workspace"
            id="sidebar-tab-chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Files Cabinet Icon */}
          <button
            onClick={() => handleTabClick('files')}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
              currentTab === 'files'
                ? 'bg-neutral-200 text-black font-semibold'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
            }`}
            title="Files Cabinet"
            id="sidebar-tab-files"
          >
            <FolderClosed className="w-5 h-5" />
          </button>

          {/* Productivity Hub Icon */}
          <button
            onClick={() => handleTabClick('productivity')}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
              currentTab === 'productivity'
                ? 'bg-neutral-200 text-black font-semibold'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
            }`}
            title="Productivity Suite"
            id="sidebar-tab-productivity"
          >
            <Calendar className="w-5 h-5" />
          </button>

          {/* Memory Bank Icon */}
          <button
            onClick={() => handleTabClick('memory')}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
              currentTab === 'memory'
                ? 'bg-neutral-200 text-black font-semibold'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
            }`}
            title="Memory Bank"
            id="sidebar-tab-memory"
          >
            <Brain className="w-5 h-5" />
          </button>

          {/* Specialized Agents Icon */}
          <button
            onClick={() => handleTabClick('agents')}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
              currentTab === 'agents'
                ? 'bg-neutral-200 text-black font-semibold'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
            }`}
            title="Specialized Agents"
            id="sidebar-tab-agents"
          >
            <Compass className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Section Settings button */}
        <div className="flex flex-col items-center w-full gap-2">
          {/* Mobile close button (redundant but helpful on mobile layout) */}
          <button
            onClick={onCloseMobile}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-neutral-500 hover:text-red-500 hover:bg-red-50 hover:border hover:border-red-100 transition-all cursor-pointer md:hidden"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleTabClick('settings')}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-neutral-200 text-black font-semibold'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
            }`}
            title="System Settings"
            id="sidebar-tab-settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. SECONDARY Workspaces Drawer Panel */}
      <div 
        className={`h-full bg-[#F6F6F6] border-r border-neutral-200 flex flex-col transition-all duration-300 overflow-hidden ${
          secondaryPanelOpen ? 'w-64' : 'w-0 border-r-0'
        }`}
        id="sidebar-secondary-panel"
      >
        <div className="w-64 flex-1 flex flex-col h-full overflow-hidden">
          {/* Drawer Header */}
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-[#F1F1F1] shrink-0">
            <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider font-mono">Sessions Console</span>
            <button
              onClick={() => setSecondaryPanelOpen(false)}
              className="p-1 hover:bg-neutral-200 rounded-md text-neutral-500 hover:text-black transition-colors"
              title="Close Sessions Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Search */}
          <div className="p-3 border-b border-neutral-200 bg-[#FAFABA]/10 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-lg py-1.5 pl-8 pr-3 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-200 transition-all"
              />
            </div>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
            {/* Pinned Chats */}
            {pinnedChats.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 text-[10px] font-bold font-mono tracking-wider text-neutral-500 uppercase flex items-center gap-1">
                  <Pin className="w-3 h-3 text-black fill-black" />
                  <span>Pinned Workspaces</span>
                </div>
                <div className="space-y-0.5">
                  {pinnedChats.map(c => (
                    <div
                      key={c.id}
                      onClick={() => selectChat(c.id)}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 ${
                        activeChatId === c.id
                          ? 'bg-neutral-200 text-black font-semibold'
                          : 'hover:bg-neutral-100 text-neutral-600 hover:text-black'
                      }`}
                    >
                      {editingChatId === c.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={e => setEditingTitle(e.target.value)}
                          className="bg-white border border-neutral-300 rounded px-1.5 py-0.5 text-xs text-neutral-850 focus:outline-none w-4/5"
                          onClick={e => e.stopPropagation()}
                          autoFocus
                        />
                      ) : (
                        <span className="truncate max-w-[130px]">{c.title}</span>
                      )}

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                        {editingChatId === c.id ? (
                          <button
                            onClick={e => handleSaveRename(c.id, e)}
                            className="p-1 hover:text-emerald-600 text-neutral-500"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={e => handleStartRename(c.id, c.title, e)}
                              className="p-1 hover:text-black text-neutral-400"
                              title="Rename"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                pinChat(c.id);
                              }}
                              className="p-1 text-black hover:text-neutral-500"
                              title="Unpin"
                            >
                              <Pin className="w-3 h-3 fill-black" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                deleteChat(c.id);
                              }}
                              className="p-1 hover:text-red-600 text-neutral-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Conversations */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold font-mono tracking-wider text-neutral-500 uppercase">
                Recent Conversations
              </div>
              {recentChats.length === 0 ? (
                <div className="px-2 py-2 text-xs text-neutral-400 font-mono italic">
                  No active workspaces
                </div>
              ) : (
                <div className="space-y-0.5">
                  {recentChats.map(c => (
                    <div
                      key={c.id}
                      onClick={() => selectChat(c.id)}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 ${
                        activeChatId === c.id
                          ? 'bg-neutral-200 text-black font-semibold'
                          : 'hover:bg-neutral-100 text-neutral-600 hover:text-black'
                      }`}
                    >
                      {editingChatId === c.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={e => setEditingTitle(e.target.value)}
                          className="bg-white border border-neutral-300 rounded px-1.5 py-0.5 text-xs text-neutral-850 focus:outline-none w-4/5"
                          onClick={e => e.stopPropagation()}
                          autoFocus
                        />
                      ) : (
                        <span className="truncate max-w-[130px]">{c.title}</span>
                      )}

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                        {editingChatId === c.id ? (
                          <button
                            onClick={e => handleSaveRename(c.id, e)}
                            className="p-1 hover:text-emerald-600 text-neutral-500"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={e => handleStartRename(c.id, c.title, e)}
                              className="p-1 hover:text-black text-neutral-400"
                              title="Rename"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                pinChat(c.id);
                              }}
                              className="p-1 hover:text-black text-neutral-400"
                              title="Pin Workspace"
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                deleteChat(c.id);
                              }}
                              className="p-1 hover:text-red-600 text-neutral-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
