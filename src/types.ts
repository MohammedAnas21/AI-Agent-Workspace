export type AgentType =
  | 'research'
  | 'coding'
  | 'writing'
  | 'marketing'
  | 'youtube'
  | 'automation'
  | 'customer_support'
  | 'data_analysis'
  | 'file_analysis';

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  systemPrompt: string;
  status: 'online' | 'busy' | 'offline';
  type: AgentType;
  color: string; // Tailwind color class e.g., 'blue-500'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  agentId?: string; // If this message was processed by a specific agent
  sources?: GroundingSource[];
  isReasoning?: boolean;
  reasoningText?: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  isPinned: boolean;
  agentId?: string; // Optional active agent for the whole chat
  memoryEnabled: boolean;
}

export interface Memory {
  id: string;
  content: string;
  createdAt: string;
  isPinned: boolean;
  category: 'preference' | 'goal' | 'project' | 'tool' | 'workflow' | 'general';
}

export interface UploadedFile {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'image';
  size: number;
  dataUrl: string; // base64 string
  uploadedAt: string;
  extractedText?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Reminder {
  id: string;
  text: string;
  datetime: string;
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  datetime: string;
  description?: string;
  location?: string;
}

export interface WorkspaceSettings {
  theme: 'dark' | 'light';
  model: string;
  memoryEnabled: boolean;
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  voiceSpeed: number;
  apiKeys: {
    gemini?: string;
    customSearch?: string;
  };
  notificationsEnabled: boolean;
}
