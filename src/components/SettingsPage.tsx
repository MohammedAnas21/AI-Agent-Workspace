import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  Sun,
  Moon,
  Brain,
  Volume2,
  Keyboard,
  Download,
  ShieldCheck,
  Sliders,
  CheckCircle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, chats } = useWorkspace();

  const handleExportChats = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chats, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ai_workspace_export_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Failed to export chats:', e);
    }
  };

  const models = [
    { value: 'deepseek-chat', label: 'Deepseek Chat V3 (Recommended // Fast & Capable)' },
    { value: 'deepseek-reasoner', label: 'Deepseek Reasoner R1 (Advanced Reasoning // Deep Think)' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Low Latency // Google)' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Advanced Reasoning // Google)' },
  ];

  const voices = [
    { value: 'Zephyr', label: 'Zephyr (Warm Male)' },
    { value: 'Kore', label: 'Kore (Empathetic Female)' },
    { value: 'Puck', label: 'Puck (Cheerful Male)' },
    { value: 'Charon', label: 'Charon (Deep Male)' },
    { value: 'Fenrir', label: 'Fenrir (Crisp Male)' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#EDEDED] px-6 py-8 md:px-12 md:py-12 scrollbar-none">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="mb-8 mt-6 md:mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-neutral-200 text-neutral-850 border border-neutral-300">
              Settings Panel
            </span>
          </div>
          <h2 className="text-3xl font-semibold text-black tracking-tight font-sans">System Configuration</h2>
          <p className="text-xs text-neutral-500 mt-2 font-sans leading-relaxed">
            Tailor your workspace theme, cognitive memory configurations, advanced neural model choices, and custom voice responses.
          </p>
        </div>

        {/* 1. Theme and Model (Card style) */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6 shadow-2xs">
          <h3 className="text-sm font-semibold text-neutral-850 flex items-center gap-2.5 font-sans">
            <Sliders className="w-4 h-4 text-black" />
            Workspace & Core Engine
          </h3>

          {/* Theme Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1.5 font-semibold">Appearance Mode</label>
              <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl border border-neutral-250">
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    settings.theme === 'light' ? 'bg-white text-black shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Light Mode
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    settings.theme === 'dark' ? 'bg-white text-black shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Dark Mode
                </button>
              </div>
            </div>

            {/* Model Selector */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1.5 font-semibold">Neural Model Target</label>
              <select
                value={settings.model}
                onChange={e => updateSettings({ model: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-250 rounded-xl px-3 py-2.5 text-xs text-black focus:outline-none focus:border-black font-sans cursor-pointer font-medium"
              >
                {models.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Cognitive Memory Settings */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6 shadow-2xs">
          <h3 className="text-sm font-semibold text-neutral-850 flex items-center gap-2.5 font-sans">
            <Brain className="w-4 h-4 text-black" />
            Cognitive User Memory
          </h3>
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-250 font-sans">
            <div>
              <p className="text-xs font-semibold text-neutral-850">Enable Long-Term User Fact Memory</p>
              <p className="text-[10px] text-neutral-450 max-w-sm mt-0.5 leading-normal">
                Automatically saves personal details, preferences, and workspace workflows during chat sessions.
              </p>
            </div>
            <button
              onClick={() => updateSettings({ memoryEnabled: !settings.memoryEnabled })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                settings.memoryEnabled
                  ? 'bg-neutral-900 border-neutral-900 text-white'
                  : 'bg-white border-neutral-300 text-neutral-600 hover:text-black'
              }`}
            >
              {settings.memoryEnabled ? 'Memory Active' : 'Memory Paused'}
            </button>
          </div>
        </div>

        {/* 3. Text to Speech (TTS) Playback Speed */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6 shadow-2xs">
          <h3 className="text-sm font-semibold text-neutral-850 flex items-center gap-2.5 font-sans">
            <Volume2 className="w-4 h-4 text-black" />
            TTS Audio & Speech Voice
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1.5 font-semibold">Voice Speaker Persona</label>
              <select
                value={settings.voiceName}
                onChange={e => updateSettings({ voiceName: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-250 rounded-xl px-3 py-2.5 text-xs text-black focus:outline-none focus:border-black font-sans cursor-pointer font-medium"
              >
                {voices.map(v => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">Speech Playback Speed</label>
                <span className="text-[10px] font-mono text-black font-bold">{settings.voiceSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.voiceSpeed}
                onChange={e => updateSettings({ voiceSpeed: parseFloat(e.target.value) })}
                className="w-full accent-black bg-neutral-200 rounded-lg cursor-pointer h-1.5"
              />
              <div className="flex justify-between text-[9px] text-neutral-400 font-mono mt-1 font-semibold">
                <span>0.5x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Credentials Security (Read-Only Status) */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-2xs">
          <h3 className="text-sm font-semibold text-neutral-850 flex items-center gap-2.5 font-sans">
            <ShieldCheck className="w-4 h-4 text-black" />
            Security & API Credentials
          </h3>
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-250 flex items-center justify-between font-sans">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-850">Gemini API Connection Status</p>
                <p className="text-[10px] text-neutral-400 mt-0.5 leading-normal">
                  Secure server-side API Key is injected dynamically via Google AI Studio context.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 text-[9px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full uppercase font-bold">
              Connected
            </span>
          </div>
        </div>

        {/* 5. Keyboard Shortcuts and Export */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-semibold text-neutral-850 flex items-center gap-2.5">
              <Keyboard className="w-4 h-4 text-black" />
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2 text-[11px] font-mono text-neutral-500 font-semibold">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span>Send Message</span>
                <span className="text-neutral-800">Enter</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span>Insert New Line</span>
                <span className="text-neutral-800">Shift + Enter</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span>Start Dictation</span>
                <span className="text-neutral-800">ALT + V</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Stop TTS Recitation</span>
                <span className="text-neutral-800">Escape</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-between shadow-2xs">
            <div>
              <h3 className="text-sm font-semibold text-neutral-850 flex items-center gap-2.5 mb-2">
                <Download className="w-4 h-4 text-black" />
                Data Portability
              </h3>
              <p className="text-xs text-neutral-450 leading-relaxed font-sans">
                Export all your chat logs, conversation sessions, notes, and preferences into a single, clean JSON structure for offline storage.
              </p>
            </div>
            <button
              onClick={handleExportChats}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 bg-black hover:bg-neutral-850 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <Download className="w-4 h-4" />
              Export Workspace State
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
