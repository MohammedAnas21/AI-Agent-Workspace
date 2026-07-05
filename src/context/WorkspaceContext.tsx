import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import {
  Chat,
  Message,
  Memory,
  UploadedFile,
  Note,
  Todo,
  Reminder,
  CalendarEvent,
  WorkspaceSettings,
  Agent,
  AgentType
} from '../types';
import { AGENTS } from '../agents';

interface WorkspaceContextProps {
  currentTab: 'chat' | 'agents' | 'files' | 'memory' | 'productivity' | 'settings';
  setCurrentTab: (tab: 'chat' | 'agents' | 'files' | 'memory' | 'productivity' | 'settings') => void;
  chats: Chat[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  memories: Memory[];
  memoryEnabled: boolean;
  setMemoryEnabled: (enabled: boolean) => void;
  files: UploadedFile[];
  notes: Note[];
  todos: Todo[];
  reminders: Reminder[];
  calendarEvents: CalendarEvent[];
  settings: WorkspaceSettings;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isGenerating: boolean;
  setIsGenerating: (gen: boolean) => void;

  // Actions
  createNewChat: (agentId?: string) => string;
  deleteChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  pinChat: (id: string) => void;
  sendMessage: (content: string, includedFiles?: UploadedFile[], options?: { useSearch?: boolean; useReasoning?: boolean }) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
  stopGeneration: () => void;
  editPreviousMessage: (messageId: string, newContent: string) => Promise<void>;
  
  // Memory CRUD
  addMemory: (content: string, category?: Memory['category']) => void;
  deleteMemory: (id: string) => void;
  updateMemory: (id: string, content: string) => void;
  pinMemory: (id: string) => void;

  // File Actions
  uploadFile: (file: { name: string; type: string; size: number; base64: string }) => Promise<void>;
  deleteFile: (id: string) => void;

  // Productivity CRUD
  addNote: (title: string, content: string) => void;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  
  addTodo: (text: string, priority: Todo['priority'], dueDate?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;

  addReminder: (text: string, datetime: string) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  addCalendarEvent: (title: string, datetime: string, description?: string, location?: string) => void;
  deleteCalendarEvent: (id: string) => void;

  // Settings Actions
  updateSettings: (settings: Partial<WorkspaceSettings>) => void;

  // Utilities
  speakText: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<'chat' | 'agents' | 'files' | 'memory' | 'productivity' | 'settings'>('chat');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [memoryEnabled, setMemoryEnabled] = useState<boolean>(true);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [settings, setSettings] = useState<WorkspaceSettings>({
    theme: 'dark',
    model: 'deepseek-chat',
    memoryEnabled: true,
    voiceName: 'Zephyr',
    voiceSpeed: 1.0,
    apiKeys: {},
    notificationsEnabled: true
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Synchronize on load from Server-side Data Persistence with local storage as a fallback
  useEffect(() => {
    const abortController = new AbortController();
    const fetchWorkspaceData = async () => {
      try {
        const response = await fetch('/api/workspace/data', { signal: abortController.signal });
        if (response.ok) {
          const store = await response.json();
          if (store.chats) setChats(store.chats);
          if (store.memories) setMemories(store.memories);
          if (store.uploadedFiles) setFiles(store.uploadedFiles);
          if (store.notes) setNotes(store.notes);
          if (store.todos) setTodos(store.todos);
          if (store.reminders) setReminders(store.reminders);
          if (store.calendarEvents) setCalendarEvents(store.calendarEvents);
          if (store.settings) {
            setSettings(store.settings);
            setMemoryEnabled(store.settings.memoryEnabled ?? true);
          }
          
          if (store.chats && store.chats.length > 0) {
            // Find last active or just use the first one
            setActiveChatId(store.chats[0].id);
          }
        }
      } catch (err) {
        if (abortController.signal.aborted) return;
        console.warn('Backend offline or failed to fetch workspace data, loading from localstorage...');
        const local = localStorage.getItem('ai_agent_workspace');
        if (local) {
          try {
            const store = JSON.parse(local);
            if (store.chats) setChats(store.chats);
            if (store.memories) setMemories(store.memories);
            if (store.uploadedFiles) setFiles(store.uploadedFiles);
            if (store.notes) setNotes(store.notes);
            if (store.todos) setTodos(store.todos);
            if (store.reminders) setReminders(store.reminders);
            if (store.calendarEvents) setCalendarEvents(store.calendarEvents);
            if (store.settings) {
              setSettings(store.settings);
              setMemoryEnabled(store.settings.memoryEnabled ?? true);
            }
            if (store.chats && store.chats.length > 0) {
              setActiveChatId(store.chats[0].id);
            }
          } catch (_) {}
        }
      }
    };

    fetchWorkspaceData();
    return () => abortController.abort();
  }, []);

  // Save changes to local memory and try to sync to the Express server DB
  const saveState = async (updates: {
    chats?: Chat[];
    memories?: Memory[];
    files?: UploadedFile[];
    notes?: Note[];
    todos?: Todo[];
    reminders?: Reminder[];
    calendarEvents?: CalendarEvent[];
    settings?: WorkspaceSettings;
  }) => {
    const nextChats = updates.chats ?? chats;
    const nextMemories = updates.memories ?? memories;
    const nextFiles = updates.files ?? files;
    const nextNotes = updates.notes ?? notes;
    const nextTodos = updates.todos ?? todos;
    const nextReminders = updates.reminders ?? reminders;
    const nextEvents = updates.calendarEvents ?? calendarEvents;
    const nextSettings = updates.settings ?? settings;

    const payload = {
      chats: nextChats,
      memories: nextMemories,
      uploadedFiles: nextFiles,
      notes: nextNotes,
      todos: nextTodos,
      reminders: nextReminders,
      calendarEvents: nextEvents,
      settings: { ...nextSettings, memoryEnabled }
    };

    // Keep LocalStorage up to date
    localStorage.setItem('ai_agent_workspace', JSON.stringify(payload));

    // Try server sync
    try {
      await fetch('/api/workspace/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (_) {}
  };

  // Synchronize system settings theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // ----------------------------------------------------
  // CHAT ACTIONS
  // ----------------------------------------------------

  const createNewChat = (agentId?: string) => {
    const id = 'chat_' + Math.random().toString(36).substr(2, 9);
    const agent = agentId ? AGENTS.find(a => a.id === agentId) : null;
    const newChat: Chat = {
      id,
      title: agent ? `${agent.name} Workspace` : 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      isPinned: false,
      agentId: agentId || undefined,
      memoryEnabled: true
    };

    const nextChats = [newChat, ...chats];
    setChats(nextChats);
    setActiveChatId(id);
    setSelectedAgent(agent || null);
    setCurrentTab('chat');
    saveState({ chats: nextChats });
    return id;
  };

  const deleteChat = (id: string) => {
    const nextChats = chats.filter(c => c.id !== id);
    setChats(nextChats);
    if (activeChatId === id) {
      setActiveChatId(nextChats.length > 0 ? nextChats[0].id : null);
    }
    saveState({ chats: nextChats });
  };

  const renameChat = (id: string, title: string) => {
    const nextChats = chats.map(c => c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c);
    setChats(nextChats);
    saveState({ chats: nextChats });
  };

  const pinChat = (id: string) => {
    const nextChats = chats.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c);
    setChats(nextChats);
    saveState({ chats: nextChats });
  };

  // Automatically parse memory directives
  const handleMemoryParsing = (text: string) => {
    if (!memoryEnabled) return;

    // Directives: MEM_SAVE: [fact] or MEM_FORGET: [keywords]
    const saveRegex = /MEM_SAVE:\s*(.+)/gi;
    const forgetRegex = /MEM_FORGET:\s*(.+)/gi;

    let match;
    const detectedSaves: string[] = [];
    const detectedForgets: string[] = [];

    while ((match = saveRegex.exec(text)) !== null) {
      detectedSaves.push(match[1].trim());
    }

    while ((match = forgetRegex.exec(text)) !== null) {
      detectedForgets.push(match[1].trim());
    }

    if (detectedSaves.length > 0 || detectedForgets.length > 0) {
      let currentMemories = [...memories];

      detectedSaves.forEach(fact => {
        // Clean up markdown
        const cleaned = fact.replace(/[\*\`\_]/g, '');
        // Avoid duplicates
        if (!currentMemories.some(m => m.content.toLowerCase() === cleaned.toLowerCase())) {
          currentMemories.push({
            id: 'mem_' + Math.random().toString(36).substr(2, 9),
            content: cleaned,
            createdAt: new Date().toISOString(),
            isPinned: false,
            category: 'general'
          });
        }
      });

      detectedForgets.forEach(keywords => {
        const query = keywords.toLowerCase();
        currentMemories = currentMemories.filter(m => !m.content.toLowerCase().includes(query));
      });

      setMemories(currentMemories);
      saveState({ memories: currentMemories });
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const sendMessage = async (
    content: string,
    includedFiles: UploadedFile[] = [],
    options: { useSearch?: boolean; useReasoning?: boolean } = {}
  ) => {
    if (!content.trim() && includedFiles.length === 0) return;

    let chatId = activeChatId;
    if (!chatId) {
      chatId = createNewChat(selectedAgent?.id);
    }

    const currentChat = chats.find(c => c.id === chatId);
    if (!currentChat) return;

    // Add user message
    const userMsg: Message = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update title dynamically if it was the default template
    let updatedTitle = currentChat.title;
    if (currentChat.messages.length === 0 && currentChat.title === 'New Conversation') {
      updatedTitle = content.length > 28 ? content.substring(0, 25) + '...' : content;
    }

    const activeAgent = selectedAgent || (currentChat.agentId ? AGENTS.find(a => a.id === currentChat.agentId) : null);

    const assistantMsgId = 'msg_' + Math.random().toString(36).substr(2, 9);
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentId: activeAgent?.id,
      model: settings.model
    };

    const updatedMessages = [...currentChat.messages, userMsg, assistantMsg];
    const updatedChats = chats.map(c =>
      c.id === chatId
        ? {
            ...c,
            title: updatedTitle,
            messages: updatedMessages,
            updatedAt: new Date().toISOString()
          }
        : c
    );

    setChats(updatedChats);
    setIsGenerating(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: currentChat.messages, // Context history
          currentMessage: content,
          agentPrompt: activeAgent?.systemPrompt,
          memories: memoryEnabled ? memories : [],
          useSearch: options.useSearch,
          useReasoning: options.useReasoning,
          files: includedFiles
        })
      });

      if (!response.ok) {
        throw new Error(await response.text() || 'Failed to stream from Gemini API');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Readable stream not supported');

      let accumulatedText = '';
      let collectedSources: Message['sources'] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]') continue;
            
            try {
              const payload = JSON.parse(dataStr);
              if (payload.error) {
                accumulatedText = `Error: ${payload.error}`;
              } else {
                accumulatedText += payload.text || '';
                if (payload.sources && payload.sources.length > 0) {
                  collectedSources = payload.sources;
                }
              }

              // Update assistant message on the fly
              setChats(prevChats =>
                prevChats.map(c =>
                  c.id === chatId
                    ? {
                        ...c,
                        messages: c.messages.map(m =>
                          m.id === assistantMsgId
                            ? { ...m, content: accumulatedText, sources: collectedSources.length > 0 ? collectedSources : undefined }
                            : m
                        )
                      }
                    : c
                )
              );
            } catch (_) {}
          }
        }
      }

      setIsGenerating(false);
      handleMemoryParsing(accumulatedText);
      
      // Persist finished state
      const finalChats = updatedChats.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            title: updatedTitle,
            messages: c.messages.map(m =>
              m.id === assistantMsgId
                ? { ...m, content: accumulatedText, sources: collectedSources.length > 0 ? collectedSources : undefined }
                : m
            ),
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      });
      saveState({ chats: finalChats });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Generation aborted.');
      } else {
        console.error('Error generating content:', error);
        // Put error message on assistant node
        setChats(prevChats =>
          prevChats.map(c =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: `Error: ${error.message || 'Server did not respond'}. Please check your API configuration in settings.` }
                      : m
                  )
                }
              : c
          )
        );
      }
      setIsGenerating(false);
    }
  };

  const regenerateLastResponse = async () => {
    const currentChat = chats.find(c => c.id === activeChatId);
    if (!currentChat || currentChat.messages.length < 2) return;

    // Get last user message
    const history = [...currentChat.messages];
    let lastUserIndex = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const userMsg = history[lastUserIndex];
    
    // Trim everything after the last user index, then trigger sendMessage
    const trimmedMessages = history.slice(0, lastUserIndex);
    const updatedChat = {
      ...currentChat,
      messages: trimmedMessages
    };

    setChats(chats.map(c => c.id === activeChatId ? updatedChat : c));
    await sendMessage(userMsg.content, [], { useSearch: false, useReasoning: false });
  };

  const editPreviousMessage = async (messageId: string, newContent: string) => {
    const currentChat = chats.find(c => c.id === activeChatId);
    if (!currentChat) return;

    const msgIndex = currentChat.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    // Keep all history up to that message, overwrite that message's content, and clear anything after
    const trimmedMessages = currentChat.messages.slice(0, msgIndex);
    const updatedChat = {
      ...currentChat,
      messages: trimmedMessages
    };

    setChats(chats.map(c => c.id === activeChatId ? updatedChat : c));
    await sendMessage(newContent, [], { useSearch: false, useReasoning: false });
  };

  // ----------------------------------------------------
  // MEMORY CRUD
  // ----------------------------------------------------

  const addMemory = (content: string, category: Memory['category'] = 'general') => {
    const newMemory: Memory = {
      id: 'mem_' + Math.random().toString(36).substr(2, 9),
      content,
      createdAt: new Date().toISOString(),
      isPinned: false,
      category
    };
    const nextMems = [newMemory, ...memories];
    setMemories(nextMems);
    saveState({ memories: nextMems });
  };

  const deleteMemory = (id: string) => {
    const nextMems = memories.filter(m => m.id !== id);
    setMemories(nextMems);
    saveState({ memories: nextMems });
  };

  const updateMemory = (id: string, content: string) => {
    const nextMems = memories.map(m => m.id === id ? { ...m, content } : m);
    setMemories(nextMems);
    saveState({ memories: nextMems });
  };

  const pinMemory = (id: string) => {
    const nextMems = memories.map(m => m.id === id ? { ...m, isPinned: !m.isPinned } : m);
    setMemories(nextMems);
    saveState({ memories: nextMems });
  };

  // ----------------------------------------------------
  // FILES HANDLERS
  // ----------------------------------------------------

  const uploadFile = async (file: { name: string; type: string; size: number; base64: string }) => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    
    let fileType: UploadedFile['type'] = 'txt';
    if (isImage) fileType = 'image';
    else if (isPdf) fileType = 'pdf';
    else if (file.name.endsWith('.docx')) fileType = 'docx';

    // Simple text extraction simulation
    let extractedText = '';
    if (fileType === 'txt') {
      extractedText = atob(file.base64.split(',')[1] || file.base64);
    } else {
      extractedText = `Extracted Text Metadata from ${file.name}.\nSize: ${(file.size / 1024).toFixed(1)} KB.`;
    }

    const newFile: UploadedFile = {
      id: 'file_' + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: fileType,
      size: file.size,
      dataUrl: file.base64,
      uploadedAt: new Date().toISOString(),
      extractedText
    };

    const nextFiles = [newFile, ...files];
    setFiles(nextFiles);
    saveState({ files: nextFiles });
  };

  const deleteFile = (id: string) => {
    const nextFiles = files.filter(f => f.id !== id);
    setFiles(nextFiles);
    saveState({ files: nextFiles });
  };

  // ----------------------------------------------------
  // PRODUCTIVITY CRUD
  // ----------------------------------------------------

  const addNote = (title: string, content: string) => {
    const newNote: Note = {
      id: 'note_' + Math.random().toString(36).substr(2, 9),
      title: title || 'Untitled Note',
      content,
      updatedAt: new Date().toISOString()
    };
    const next = [newNote, ...notes];
    setNotes(next);
    saveState({ notes: next });
  };

  const updateNote = (id: string, title: string, content: string) => {
    const next = notes.map(n => n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n);
    setNotes(next);
    saveState({ notes: next });
  };

  const deleteNote = (id: string) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    saveState({ notes: next });
  };

  const addTodo = (text: string, priority: Todo['priority'] = 'medium', dueDate?: string) => {
    const newTodo: Todo = {
      id: 'todo_' + Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
      dueDate,
      priority
    };
    const next = [newTodo, ...todos];
    setTodos(next);
    saveState({ todos: next });
  };

  const toggleTodo = (id: string) => {
    const next = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTodos(next);
    saveState({ todos: next });
  };

  const deleteTodo = (id: string) => {
    const next = todos.filter(t => t.id !== id);
    setTodos(next);
    saveState({ todos: next });
  };

  const addReminder = (text: string, datetime: string) => {
    const newReminder: Reminder = {
      id: 'rem_' + Math.random().toString(36).substr(2, 9),
      text,
      datetime,
      completed: false
    };
    const next = [newReminder, ...reminders];
    setReminders(next);
    saveState({ reminders: next });
  };

  const toggleReminder = (id: string) => {
    const next = reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r);
    setReminders(next);
    saveState({ reminders: next });
  };

  const deleteReminder = (id: string) => {
    const next = reminders.filter(r => r.id !== id);
    setReminders(next);
    saveState({ reminders: next });
  };

  const addCalendarEvent = (title: string, datetime: string, description?: string, location?: string) => {
    const newEvent: CalendarEvent = {
      id: 'evt_' + Math.random().toString(36).substr(2, 9),
      title,
      datetime,
      description,
      location
    };
    const next = [newEvent, ...calendarEvents];
    setCalendarEvents(next);
    saveState({ calendarEvents: next });
  };

  const deleteCalendarEvent = (id: string) => {
    const next = calendarEvents.filter(e => e.id !== id);
    setCalendarEvents(next);
    saveState({ calendarEvents: next });
  };

  // ----------------------------------------------------
  // SETTINGS HANDLERS
  // ----------------------------------------------------

  const updateSettings = (updates: Partial<WorkspaceSettings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    if (updates.memoryEnabled !== undefined) {
      setMemoryEnabled(updates.memoryEnabled);
    }
    saveState({ settings: next });
  };

  // ----------------------------------------------------
  // VOICE PLAYBACK (TEXT TO SPEECH)
  // ----------------------------------------------------

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  const speakText = async (text: string) => {
    stopSpeaking();
    setIsSpeaking(true);

    try {
      // Clean up markdown tags for cleaner recitation
      const cleanedText = text
        .replace(/[\#\*\`\_]/g, '')
        .replace(/\[.+\]\(.+\)/g, '') // remove links
        .substring(0, 500); // Limit length of speech for responsive performance

      const response = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanedText,
          voiceName: settings.voiceName
        })
      });

      if (!response.ok) throw new Error();
      const resData = await response.json();

      if (resData.audio) {
        // Play back Gemini TTS PCM/wav
        const audioUrl = `data:audio/wav;base64,${resData.audio}`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.playbackRate = settings.voiceSpeed;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => speakLocalFallback(cleanedText);
        await audio.play();
      } else {
        speakLocalFallback(cleanedText);
      }
    } catch (_) {
      speakLocalFallback(text);
    }
  };

  const speakLocalFallback = (cleanedText: string) => {
    if (!synthRef.current) {
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(cleanedText.substring(0, 250));
    utterance.rate = settings.voiceSpeed;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const contextValue = useMemo(() => ({
    currentTab,
    setCurrentTab,
    chats,
    activeChatId,
    setActiveChatId,
    selectedAgent,
    setSelectedAgent,
    memories,
    memoryEnabled,
    setMemoryEnabled,
    files,
    notes,
    todos,
    reminders,
    calendarEvents,
    settings,
    sidebarCollapsed,
    setSidebarCollapsed,
    isGenerating,
    setIsGenerating,
    createNewChat,
    deleteChat,
    renameChat,
    pinChat,
    sendMessage,
    regenerateLastResponse,
    stopGeneration,
    editPreviousMessage,
    addMemory,
    deleteMemory,
    updateMemory,
    pinMemory,
    uploadFile,
    deleteFile,
    addNote,
    updateNote,
    deleteNote,
    addTodo,
    toggleTodo,
    deleteTodo,
    addReminder,
    toggleReminder,
    deleteReminder,
    addCalendarEvent,
    deleteCalendarEvent,
    updateSettings,
    speakText,
    stopSpeaking,
    isSpeaking
  }), [
    currentTab,
    chats,
    activeChatId,
    selectedAgent,
    memories,
    memoryEnabled,
    files,
    notes,
    todos,
    reminders,
    calendarEvents,
    settings,
    sidebarCollapsed,
    isGenerating,
    isSpeaking,
    createNewChat,
    deleteChat,
    renameChat,
    pinChat,
    sendMessage,
    regenerateLastResponse,
    stopGeneration,
    editPreviousMessage,
    addMemory,
    deleteMemory,
    updateMemory,
    pinMemory,
    uploadFile,
    deleteFile,
    addNote,
    updateNote,
    deleteNote,
    addTodo,
    toggleTodo,
    deleteTodo,
    addReminder,
    toggleReminder,
    deleteReminder,
    addCalendarEvent,
    deleteCalendarEvent,
    updateSettings,
    speakText,
    stopSpeaking
  ]);

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
