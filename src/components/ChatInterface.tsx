import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AGENTS } from '../agents';
import { motion, AnimatePresence } from 'motion/react';
import {
  Paperclip,
  Mic,
  Globe,
  Lightbulb,
  Sparkles,
  StopCircle,
  Copy,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  User,
  MoreHorizontal
} from 'lucide-react';
import { UploadedFile } from '../types';

const SPECIALIZED_AGENTS_ITEMS = [
  {
    id: null,
    emoji: '🧠',
    name: 'Neutral Assistant',
    description: 'General conversations and everyday tasks.',
    agent: null
  },
  {
    id: 'research',
    emoji: '🔍',
    name: 'Research Agent',
    description: 'Research topics and summarize information.',
    get agent() { return AGENTS.find(a => a.id === 'research') || null; }
  },
  {
    id: 'coding',
    emoji: '💻',
    name: 'Coding Agent',
    description: 'Write, debug, and explain code.',
    get agent() { return AGENTS.find(a => a.id === 'coding') || null; }
  },
  {
    id: 'writing',
    emoji: '✍️',
    name: 'Writing Agent',
    description: 'Create blogs, emails, reports, and documents.',
    get agent() { return AGENTS.find(a => a.id === 'writing') || null; }
  },
  {
    id: 'marketing',
    emoji: '📈',
    name: 'Marketing Agent',
    description: 'Generate marketing copy, SEO content, and campaigns.',
    get agent() { return AGENTS.find(a => a.id === 'marketing') || null; }
  },
  {
    id: 'youtube',
    emoji: '🎬',
    name: 'YouTube Agent',
    description: 'Create video ideas, scripts, titles, descriptions, and thumbnails.',
    get agent() { return AGENTS.find(a => a.id === 'youtube') || null; }
  },
  {
    id: 'automation',
    emoji: '⚙️',
    name: 'Automation Agent',
    description: 'Automate workflows and repetitive tasks.',
    get agent() { return AGENTS.find(a => a.id === 'automation') || null; }
  },
  {
    id: 'customer_support',
    emoji: '🎧',
    name: 'Customer Support Agent',
    description: 'Handle FAQs and customer conversations.',
    get agent() { return AGENTS.find(a => a.id === 'customer_support') || null; }
  },
  {
    id: 'data_analysis',
    emoji: '📊',
    name: 'Data Analysis Agent',
    description: 'Analyze CSV, Excel, and datasets.',
    get agent() { return AGENTS.find(a => a.id === 'data_analysis') || null; }
  },
  {
    id: 'file_analysis',
    emoji: '📄',
    name: 'File Intelligence Agent',
    description: 'Understand PDFs, documents, and images.',
    get agent() { return AGENTS.find(a => a.id === 'file_analysis') || null; }
  }
];

export const ChatInterface: React.FC = () => {
  const {
    chats,
    activeChatId,
    selectedAgent,
    setSelectedAgent,
    isGenerating,
    sendMessage,
    regenerateLastResponse,
    stopGeneration,
    editPreviousMessage,
    files,
    createNewChat,
    setCurrentTab,
    settings
  } = useWorkspace();

  const [input, setInput] = useState('');
  const [useSearch, setUseSearch] = useState(false);
  const [useReasoning, setUseReasoning] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);

  // Popover positioning and animation states
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; placement: 'up' | 'down' }>({ top: 0, left: 0, placement: 'down' });
  const [activeTriggerElement, setActiveTriggerElement] = useState<HTMLElement | null>(null);

  // Scroll States
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // File drag states
  const [isDraggingChat, setIsDraggingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const prevMessageCountRef = useRef(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePopoverPosition = () => {
    if (!agentDropdownOpen || !activeTriggerElement) return;
    const rect = activeTriggerElement.getBoundingClientRect();
    const popoverWidth = 310;
    const popoverHeight = popoverRef.current ? popoverRef.current.offsetHeight : 450;
    
    let top = rect.bottom + 8;
    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    let placement: 'up' | 'down' = 'down';

    if (top + popoverHeight > window.innerHeight - 16) {
      if (rect.top - popoverHeight - 8 > 16) {
        top = rect.top - popoverHeight - 8;
        placement = 'up';
      } else {
        top = Math.max(16, window.innerHeight - popoverHeight - 16);
      }
    }

    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }
    if (left < 16) {
      left = 16;
    }

    setMenuPosition({ top, left, placement });
  };

  const handleMoreMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTriggerElement(e.currentTarget);
    setAgentDropdownOpen(!agentDropdownOpen);
  };

  useEffect(() => {
    if (agentDropdownOpen) {
      updatePopoverPosition();
      window.addEventListener('resize', updatePopoverPosition);
      window.addEventListener('scroll', updatePopoverPosition, true);
      const timer = setTimeout(() => {
        updatePopoverPosition();
      }, 30);
      return () => {
        window.removeEventListener('resize', updatePopoverPosition);
        window.removeEventListener('scroll', updatePopoverPosition, true);
        clearTimeout(timer);
      };
    }
  }, [agentDropdownOpen, activeTriggerElement]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        activeTriggerElement &&
        !activeTriggerElement.contains(event.target as Node)
      ) {
        setAgentDropdownOpen(false);
      }
    };

    const handleKeyDownEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAgentDropdownOpen(false);
      }
    };

    if (agentDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDownEsc);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDownEsc);
    };
  }, [agentDropdownOpen, activeTriggerElement]);

  const activeChat = chats.find(c => c.id === activeChatId);

  // 1. Auto-focus textarea on chat change or creation
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setShouldAutoScroll(true);
    setShowScrollBottom(false);
    prevMessageCountRef.current = activeChat?.messages?.length || 0;
    
    // Smooth scroll down instantly
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 60);
  }, [activeChatId]);

  // 2. Track message arrivals & auto-scrolling
  useEffect(() => {
    const currentCount = activeChat?.messages?.length || 0;

    if (currentCount > prevMessageCountRef.current) {
      // New message added
      if (shouldAutoScroll) {
        scrollToBottom();
      } else {
        // User is currently scrolled up, notify them via button
        setShowScrollBottom(true);
      }
    } else {
      // While AI is streaming, scroll down if isAtBottom
      if (isGenerating && shouldAutoScroll) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [activeChat?.messages, isGenerating, shouldAutoScroll]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShouldAutoScroll(true);
    setShowScrollBottom(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Calculate distance from bottom
    const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    const isAtBottom = distanceFromBottom <= 25;

    setShouldAutoScroll(isAtBottom);

    if (isAtBottom) {
      setShowScrollBottom(false);
    }
  };

  // Voice Dictation (Speech to Text)
  useEffect(() => {
    const SpeechRecognitionAPI = (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SpeechRecognitionAPI) {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (e: SpeechRecognitionEvent) => {
        const resultText = e.results[0][0].transcript;
        setInput(prev => (prev + ' ' + resultText).trim());
        setIsRecording(false);
      };

      rec.onerror = () => {
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleToggleRecord = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    const promptToSend = input;
    const filesToSend = [...attachedFiles];
    
    setInput('');
    setAttachedFiles([]);
    
    await sendMessage(promptToSend, filesToSend, {
      useSearch,
      useReasoning
    });

    // Refocus the input area immediately
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const isModKey = e.ctrlKey || e.metaKey;
      if (isModKey) {
        // Ctrl/Cmd + Enter force sends multiline text
        e.preventDefault();
        handleSend();
      } else if (!e.shiftKey) {
        // Regular enter triggers send, shift+enter inserts new line
        e.preventDefault();
        handleSend();
      }
    }

    // Up Arrow on empty input -> Edit last user message
    if (e.key === 'ArrowUp' && input === '') {
      e.preventDefault();
      const userMessages = activeChat?.messages.filter(m => m.role === 'user') || [];
      if (userMessages.length > 0) {
        setInput(userMessages[userMessages.length - 1].content);
      }
    }
  };

  // Clipboard Paste (Pasted images/screenshots)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            const newFile: UploadedFile = {
              id: 'file_tmp_paste_' + Math.random().toString(36).substr(2, 9),
              name: file.name || `Pasted Image - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              type: 'image',
              size: file.size,
              dataUrl: base64,
              uploadedAt: new Date().toISOString(),
              extractedText: 'Pasted image clip.'
            };
            setAttachedFiles(prev => [...prev, newFile]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // File upload trigger
  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFromLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const rawFile = e.target.files[0];
      processDroppedFile(rawFile);
    }
  };

  const processDroppedFile = (rawFile: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const newFile: UploadedFile = {
        id: 'file_tmp_' + Math.random().toString(36).substr(2, 9),
        name: rawFile.name,
        type: rawFile.type.startsWith('image/') ? 'image' : rawFile.type === 'application/pdf' ? 'pdf' : 'txt',
        size: rawFile.size,
        dataUrl: base64,
        uploadedAt: new Date().toISOString(),
        extractedText: 'Temporary session file attachment context.'
      };
      setAttachedFiles(prev => [...prev, newFile]);
    };
    reader.readAsDataURL(rawFile);
  };

  // Drag and drop event handlers
  const handleChatDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingChat(true);
  };

  const handleChatDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingChat(false);
  };

  const handleChatDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingChat(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((f: File) => {
        processDroppedFile(f);
      });
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (msgId: string, currentText: string) => {
    setEditingMessageId(msgId);
    setEditingContent(currentText);
  };

  const handleSaveEdit = async (msgId: string) => {
    setEditingMessageId(null);
    await editPreviousMessage(msgId, editingContent);
  };

  const selectAgentFromDropdown = (agent: typeof AGENTS[0] | null) => {
    setSelectedAgent(agent);
    setAgentDropdownOpen(false);
    if (activeChat && !activeChat.agentId && agent) {
      createNewChat(agent.id);
    }
  };

  // ----------------------------------------------------
  // PRECISE CUSTOM MARKDOWN PARSER (Light Theme Friendly)
  // ----------------------------------------------------
  const renderMarkdown = (content: string, messageId: string) => {
    if (!content) return null;

    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : '';
        const code = match ? match[2] : part.slice(3, -3);
        const blockId = `${messageId}_code_${index}`;

        return (
          <div 
            key={index} 
            className="my-4 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-md select-text"
            onDoubleClick={(e) => {
              // Triple click (e.detail === 3) selects full code block
              if (e.detail === 3) {
                const selection = window.getSelection();
                const range = document.createRange();
                const element = document.getElementById(blockId);
                if (element && selection) {
                  range.selectNodeContents(element);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
            }}
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 text-[10px] font-mono text-neutral-400 uppercase">
              <span>{lang || 'code'}</span>
              <button
                onClick={() => handleCopyText(code, blockId)}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                aria-label="Copy code block"
              >
                {copiedId === blockId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre 
              className="p-4 text-xs font-mono text-neutral-200 overflow-x-auto bg-neutral-900 leading-relaxed"
              id={blockId}
            >
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const lineTokens = part.split('\n');
      return (
        <div key={index} className="space-y-1.5">
          {lineTokens.map((line, lineIdx) => {
            let processedLine = line;

            // Headers (Sleek light-theme headers)
            if (processedLine.startsWith('### ')) {
              return <h4 key={lineIdx} className="text-sm font-semibold text-neutral-900 pt-3 pb-0.5">{processedLine.slice(4)}</h4>;
            }
            if (processedLine.startsWith('## ')) {
              return <h3 key={lineIdx} className="text-base font-semibold text-neutral-900 pt-4 pb-1">{processedLine.slice(3)}</h3>;
            }
            if (processedLine.startsWith('# ')) {
              return <h2 key={lineIdx} className="text-lg font-bold text-neutral-900 pt-5 pb-1.5">{processedLine.slice(2)}</h2>;
            }

            // Bullet Lists
            if (processedLine.trim().startsWith('- ') || processedLine.trim().startsWith('* ')) {
              const content = processedLine.trim().slice(2);
              return (
                <ul key={lineIdx} className="list-disc list-inside pl-4 text-xs text-neutral-700 leading-relaxed">
                  <li>{parseInlineFormatting(content)}</li>
                </ul>
              );
            }

            // Numbered Lists
            const numMatch = processedLine.trim().match(/^(\d+)\.\s(.*)/);
            if (numMatch) {
              return (
                <ol key={lineIdx} className="list-decimal list-inside pl-4 text-xs text-neutral-700 leading-relaxed">
                  <li>{parseInlineFormatting(numMatch[2])}</li>
                </ol>
              );
            }

            // Blockquotes
            if (processedLine.trim().startsWith('>')) {
              return (
                <blockquote key={lineIdx} className="border-l-3 border-neutral-300 pl-4 py-1 italic text-xs text-neutral-500">
                  {parseInlineFormatting(processedLine.trim().slice(1))}
                </blockquote>
              );
            }

            return <p key={lineIdx} className="text-xs text-neutral-700 leading-relaxed">{parseInlineFormatting(processedLine)}</p>;
          })}
        </div>
      );
    });
  };

  // Inline styling parser
  const parseInlineFormatting = (text: string) => {
    if (text.includes('MEM_SAVE:') || text.includes('MEM_FORGET:')) {
      return null;
    }

    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        const codeParts = bPart.slice(2, -2).split(/(`.*?`)/g);
        return (
          <strong key={bIdx} className="font-semibold text-neutral-950">
            {codeParts.map((cPart, cIdx) => {
              if (cPart.startsWith('`') && cPart.endsWith('`')) {
                return (
                  <code key={cIdx} className="bg-neutral-200/60 text-neutral-800 text-[11px] font-mono px-1.5 py-0.5 rounded font-medium">
                    {cPart.slice(1, -1)}
                  </code>
                );
              }
              return cPart;
            })}
          </strong>
        );
      }

      const codeParts = bPart.split(/(`.*?`)/g);
      return codeParts.map((cPart, cIdx) => {
        if (cPart.startsWith('`') && cPart.endsWith('`')) {
          return (
            <code key={cIdx} className="bg-neutral-200/60 text-neutral-800 text-[11px] font-mono px-1.5 py-0.5 rounded font-medium">
              {cPart.slice(1, -1)}
            </code>
          );
        }
        return cPart;
      });
    });
  };

  // ----------------------------------------------------
  // REUSABLE HIGH-FIDELITY PROMPT BOX RENDERER
  // ----------------------------------------------------
  const renderPromptBox = (isCentered: boolean) => (
      <div className="relative">
        <div className="bg-white border border-neutral-300 rounded-[28px] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.03)] transition-all duration-300 focus-within:border-neutral-400 focus-within:shadow-[0_10px_36px_rgba(0,0,0,0.05)]">
          
          {/* Top text input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ask anything"
            className="w-full bg-transparent border-0 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none px-3 pt-1 pb-1 resize-none h-14 min-h-[44px] max-h-[160px] leading-relaxed"
            id="chat-text-input-box"
            aria-label="Chat input query box"
          />

          {/* Render Active Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 py-2 border-b border-neutral-100">
              {attachedFiles.map(file => (
                <div key={file.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[10px] font-sans text-neutral-600">
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <button onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))} className="text-neutral-400 hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom command control ribbon */}
          <div className="flex items-center justify-between pt-2.5 px-1 gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0" id="prompt-ribbon-actions-container">
              
              {/* Attachment trigger */}
              <button
                onClick={handleTriggerFileInput}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black transition-colors cursor-pointer shrink-0 border border-neutral-200 bg-[#FCFCFC]"
                title="Attach local file"
                aria-label="Attach file"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>

              {/* Deep Search toggle chip */}
              <button
                onClick={() => setUseSearch(!useSearch)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[11px] font-medium cursor-pointer shrink-0 ${
                  useSearch
                    ? 'bg-neutral-200 border-neutral-400 text-black font-semibold shadow-xs'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-black'
                }`}
                title="Deep Search web queries"
                aria-label="Toggle Deep Search"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Deep Search</span>
              </button>

              {/* Reasoning Toggle chip */}
              <button
                onClick={() => setUseReasoning(!useReasoning)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[11px] font-medium cursor-pointer shrink-0 ${
                  useReasoning
                    ? 'bg-neutral-200 border-neutral-400 text-black font-semibold shadow-xs'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-black'
                }`}
                title="Enable Reasoning Mode"
                aria-label="Toggle reasoning mode"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Reason</span>
              </button>

              {/* Mic / Voice Dictation trigger */}
              <button
                onClick={handleToggleRecord}
                className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors cursor-pointer shrink-0 border border-neutral-200 bg-[#FCFCFC] ${
                  isRecording ? 'text-red-500 border-red-300 bg-red-50/50 animate-pulse' : 'text-neutral-500 hover:text-black'
                }`}
                title={isRecording ? 'Stop Recording' : 'Voice Dictation'}
                aria-label="Voice dictation"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>

              {/* "..." More menu trigger */}
              <div className="relative shrink-0">
                <button
                  onClick={handleMoreMenuClick}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 hover:text-black hover:border-neutral-300 transition-all cursor-pointer ${
                    agentDropdownOpen ? 'bg-neutral-100 border-neutral-300 text-black' : ''
                  }`}
                  title="More features & specialized agents"
                  aria-label="More tools options dropdown"
                >
                  <span className="text-xs font-semibold leading-none pb-1">...</span>
                </button>
              </div>

            </div>

            {/* Streaming control / Send circular trigger */}
            <div className="flex items-center shrink-0">
              {isGenerating ? (
                <button
                  onClick={stopGeneration}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shrink-0 shadow-sm"
                  title="Stop Response Generation"
                  aria-label="Stop generation"
                >
                  <StopCircle className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim() && attachedFiles.length === 0}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm shrink-0"
                  title="Send message"
                  aria-label="Send message button"
                >
                  <ArrowUp className="w-4 h-4 font-bold" />
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    );

  return (
    <div 
      className="flex-1 flex flex-col bg-[#EDEDED] h-full overflow-hidden relative" 
      id="chat-interface-root"
      onDragOver={handleChatDragOver}
      onDragLeave={handleChatDragLeave}
      onDrop={handleChatDrop}
    >
      {/* 1. Drag Over Overlay */}
      {isDraggingChat && (
        <div className="absolute inset-4 bg-white/95 backdrop-blur-md border-2 border-dashed border-neutral-300 rounded-[28px] z-40 flex flex-col items-center justify-center gap-2 pointer-events-none transition-all shadow-lg">
          <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center shadow-md text-white">
            <Paperclip className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-neutral-800 font-sans">Drop files to attach context</p>
          <p className="text-[10px] text-neutral-450 font-mono">Compatible with PDFs, images, and text snippets</p>
        </div>
      )}

      {/* 2. Header Bar: Active Thread title bar */}
      {activeChat && activeChat.messages.length > 0 && (
        <div className="flex px-6 py-4 border-b border-neutral-200 bg-[#E5E5E5]/40 items-center justify-between shrink-0 z-10" id="chat-header-bar">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-200 flex items-center justify-center border border-neutral-300 text-xs">
              {selectedAgent ? (
                <Sparkles className="w-3.5 h-3.5 text-black" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
              )}
            </div>
            <div>
              <h2 className="text-xs font-semibold text-neutral-850 leading-none">
                {activeChat.title}
              </h2>
              <span className="text-[9px] font-mono text-neutral-500 mt-1 block">
                {selectedAgent ? `${selectedAgent.name} • Specialist Agent Active` : 'Workspace Assistant Active'}
              </span>
            </div>
          </div>

          <button
            onClick={() => createNewChat(selectedAgent?.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300/80 rounded-lg text-[10px] font-mono text-neutral-700 hover:text-black transition-colors cursor-pointer border border-neutral-300"
            aria-label="Reset workspace session"
          >
            Reset Session
          </button>
        </div>
      )}

      {/* 3. Central Scroll Container */}
      <div 
        className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 scrollbar-none relative" 
        id="chat-message-scroller"
        onScroll={handleScroll}
        ref={scrollerRef}
      >
        {!activeChat || activeChat.messages.length === 0 ? (
          /* HOME SCREEN (No active conversation - MATCHES REFERENCE IMAGE EXACTLY) */
          <div className="max-w-3xl mx-auto h-full flex flex-col justify-between pt-16 pb-6 select-none relative" id="home-screen-content">
            
            {/* Centered Area: Title + Large floating prompt box */}
            <div className="my-auto flex flex-col items-center w-full">
              {/* Centered Heading */}
              <h1 className="text-3xl md:text-[42px] font-semibold text-black mb-7 tracking-tight font-sans text-center">
                What can I help with?
              </h1>

              {/* Large Floating Rounded Prompt Box */}
              <div className="w-full max-w-2xl px-2">
                {renderPromptBox(true)}
              </div>
            </div>

            {/* Bottom Section: Premium limit banner and disclaimer matches reference perfectly */}
            <div className="flex flex-col items-center w-full gap-3 mt-12 mb-2">
              {/* Pro Limit pill banner */}
              <div className="px-5 py-3 rounded-2xl bg-[#E4E4E4] border border-[#DCDCDC] text-neutral-700 text-[11px] font-sans leading-relaxed text-center max-w-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                You've hit the Free plan limit for Crawl-4o. Subscribe to Pro plan to increase limits.
                <div className="text-neutral-500 text-[10px] mt-0.5">
                  Responses will use another model until your limit resets after 6:35 PM.
                </div>
              </div>

              {/* Tiny footer caption */}
              <p className="text-[10px] text-neutral-400 font-sans tracking-wide text-center">
                AI can make mistakes. Please double-check responses.
              </p>
            </div>

          </div>
        ) : (
          /* ACTIVE CHAT STREAMING SCREEN (Light minimalist theme) */
          <div className="max-w-2xl mx-auto space-y-6 pb-36 md:pb-28">
            {activeChat.messages.map(msg => {
              const isLastAssistantMessage = msg.role === 'assistant' && activeChat.messages[activeChat.messages.length - 1].id === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`group flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Meta Timestamp */}
                  <div className="flex items-center gap-2 mb-1.5 px-1.5 text-[9px] font-mono text-neutral-400">
                    {msg.role === 'user' ? (
                      <>
                        <span>{msg.timestamp}</span>
                        <User className="w-3 h-3 text-neutral-400" />
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-black" />
                        <span className="font-semibold text-neutral-600">
                          {msg.agentId ? `${AGENTS.find(a => a.id === msg.agentId)?.name}` : 'Assistant'}
                        </span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    onDoubleClick={() => {
                      // Double-click selects bubble text
                      const selection = window.getSelection();
                      const range = document.createRange();
                      const element = document.getElementById(`msg-body-${msg.id}`);
                      if (element && selection) {
                        range.selectNodeContents(element);
                        selection.removeAllRanges();
                        selection.addRange(range);
                      }
                    }}
                    className={`relative max-w-[85%] rounded-[20px] px-4.5 py-3 border text-xs shadow-xs leading-relaxed select-text ${
                      msg.role === 'user'
                        ? 'bg-[#E5E5E5] border-neutral-300 text-neutral-900'
                        : 'bg-white border-neutral-200 text-neutral-850'
                    }`}
                  >
                    {editingMessageId === msg.id ? (
                      <div className="space-y-2 w-full min-w-[280px]">
                        <textarea
                          value={editingContent}
                          onChange={e => setEditingContent(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black resize-none h-24"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            className="px-3 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-lg text-[10px] font-semibold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingMessageId(null)}
                            className="px-3 py-1.5 bg-neutral-200 text-neutral-700 hover:bg-neutral-300 rounded-lg text-[10px] font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div id={`msg-body-${msg.id}`}>
                        {/* 4. Typing Pulsing Dot loader displayed when prompt is triggered but tokens are not yet buffered */}
                        {msg.content === '' && isGenerating && isLastAssistantMessage ? (
                          <div className="flex items-center gap-1.5 py-1 px-0.5" id="typing-indicator">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                          </div>
                        ) : (
                          renderMarkdown(msg.content, msg.id)
                        )}
                      </div>
                    )}

                    {/* Actions under bubble for assistant messages */}
                    {msg.role === 'assistant' && !isGenerating && !editingMessageId && (
                      <div className="opacity-0 group-hover:opacity-100 absolute -bottom-8 left-1 flex items-center gap-1 transition-all duration-150 z-10">
                        <button
                          onClick={() => handleCopyText(msg.content, msg.id)}
                          className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                          title="Copy Response"
                          aria-label="Copy message"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleStartEdit(msg.id, msg.content)}
                          className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                          title="Edit Message"
                          aria-label="Edit message"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        {isLastAssistantMessage && (
                          <button
                            onClick={regenerateLastResponse}
                            className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-400 hover:text-black transition-colors cursor-pointer flex items-center gap-0.5"
                            title="Regenerate last response"
                            id="regenerate-last-response-btn"
                            aria-label="Regenerate response"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-neutral-400 hover:text-black" />
                            <span className="text-[9px] font-mono">Regen</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Actions under bubble for user messages */}
                    {msg.role === 'user' && !isGenerating && !editingMessageId && (
                      <div className="opacity-0 group-hover:opacity-100 absolute -bottom-8 right-1 flex items-center gap-1 transition-all duration-150 z-10">
                        <button
                          onClick={() => handleStartEdit(msg.id, msg.content)}
                          className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                          title="Edit message content"
                          aria-label="Edit message"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 5. FLOATING SCROLL TO BOTTOM TRIGGER BUTTON */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-full px-4 py-2 text-xs font-semibold shadow-md flex items-center gap-1.5 z-35 animate-bounce transition-all cursor-pointer"
          id="scroll-to-bottom-btn"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-3.5 h-3.5 text-black" />
          <span>New messages below</span>
        </button>
      )}

      {/* 6. Floating Bottom Prompt Box (only shown when Inside an active conversation) */}
      {activeChat && activeChat.messages.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#EDEDED] via-[#EDEDED]/90 to-transparent pt-10 shrink-0 z-20" id="floating-chat-input-container">
          <div className="max-w-2xl mx-auto">
            {renderPromptBox(false)}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadFromLocal}
        className="hidden"
        accept=".pdf,.txt,.docx,image/*"
        aria-hidden="true"
      />

      {/* 7. NEW SPECIALIZED AGENTS PREMIUM POPOVER */}
      <AnimatePresence>
        {agentDropdownOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: menuPosition.placement === 'up' ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: menuPosition.placement === 'up' ? 8 : -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              width: '310px',
              maxHeight: 'calc(100vh - 32px)',
            }}
            className="bg-white border border-neutral-200 rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 flex flex-col overflow-hidden select-none font-sans"
            id="specialized-agents-popover"
          >
            {/* Header */}
            <div className="px-5 pt-4 pb-3 border-b border-neutral-100 bg-[#FCFCFC] shrink-0">
              <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                🤖 Specialized Agents
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1 font-sans">
                Choose the best AI agent for your task.
              </p>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 max-h-[320px] scrollbar-none scroll-smooth">
              {SPECIALIZED_AGENTS_ITEMS.map((item) => {
                const isSelected = selectedAgent?.id === item.id || (!selectedAgent && item.id === null);

                return (
                  <button
                    key={item.id ?? 'neutral'}
                    onClick={() => selectAgentFromDropdown(item.agent)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-start gap-3 hover:bg-neutral-50/85 group ${
                      isSelected ? 'bg-neutral-100/70 border border-neutral-200/50' : 'border border-transparent'
                    }`}
                  >
                    {/* Icon/Emoji */}
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform duration-200">
                      {item.emoji}
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-semibold text-neutral-900 group-hover:text-black truncate">
                          {item.name}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-black shrink-0 font-bold" />
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug font-sans group-hover:text-neutral-600 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-neutral-100 bg-[#FCFCFC] p-2 shrink-0 space-y-0.5">
              <button
                onClick={() => {
                  setCurrentTab('agents');
                  setAgentDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-neutral-100 text-neutral-700 flex items-center gap-2.5 transition-colors cursor-pointer group"
              >
                <span className="text-neutral-400 group-hover:text-neutral-700 transition-colors">➕</span>
                <span className="font-medium">Create Custom Agent</span>
              </button>
              <button
                onClick={() => {
                  setCurrentTab('agents');
                  setAgentDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-neutral-100 text-neutral-700 flex items-center gap-2.5 transition-colors cursor-pointer group"
              >
                <span className="text-neutral-400 group-hover:text-neutral-700 transition-colors">⚙️</span>
                <span className="font-medium">Manage Agents</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

};
