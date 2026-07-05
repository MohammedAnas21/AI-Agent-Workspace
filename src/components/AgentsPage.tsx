import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AGENTS } from '../agents';
import * as Icons from 'lucide-react';

export const AgentsPage: React.FC = () => {
  const { createNewChat } = useWorkspace();

  const getIcon = (iconName: string, color: string) => {
    const LucideIcon = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[iconName] || Icons.HelpCircle;
    return <LucideIcon className="w-5 h-5 text-black" />;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#EDEDED] px-6 py-8 md:px-12 md:py-12 scrollbar-none">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-10 mt-6 md:mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-neutral-200 text-neutral-850 border border-neutral-300">
              Agent Registry
            </span>
          </div>
          <h2 className="text-3xl font-semibold text-black tracking-tight font-sans">Specialized AI Agents</h2>
          <p className="text-xs text-neutral-500 mt-2 max-w-xl font-sans leading-relaxed">
            Choose from specialized agents optimized for specific professional fields, workflows, coding, and analyses.
          </p>
        </div>

        {/* Grid of Agent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENTS.map(agent => {
            return (
              <div
                key={agent.id}
                className="group relative flex flex-col justify-between bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-300 shadow-xs hover:shadow-md"
              >
                {/* Visual Accent Hover Bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-transparent via-neutral-200 to-transparent group-hover:via-black transition-all duration-500" />

                {/* Top Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center border border-neutral-200">
                      {getIcon(agent.icon, agent.color)}
                    </div>
                    {/* Status Indicator */}
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200">
                      <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">{agent.status}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-black transition-colors font-sans">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed min-h-[44px] font-sans">
                    {agent.description}
                  </p>
                </div>

                {/* Bottom Section: Launch Button */}
                <div className="mt-5 pt-4 border-t border-neutral-150 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-400 capitalize">
                    {agent.type.replace('_', ' ')} Agent
                  </span>
                  <button
                    onClick={() => createNewChat(agent.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-black text-neutral-800 hover:text-white hover:scale-[1.02] text-[11px] font-medium transition-all duration-250 cursor-pointer border border-neutral-200"
                  >
                    Launch Workspace
                    <Icons.ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
