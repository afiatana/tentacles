"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, GitMerge, AlertCircle, Swords } from 'lucide-react';

export interface DebateState {
  topic: string;
  agentA: { id: string; argument: string };
  agentB: { id: string; argument: string };
  consensus: string | null;
  status: 'Debating' | 'Resolved';
}

interface DebatePanelProps { debate: DebateState | null; }

export default function DebatePanel({ debate }: DebatePanelProps) {
  if (!debate) {
    return (
      <div className="glass-card p-5 h-full flex flex-col items-center justify-center text-slate-600 min-h-[200px]">
        <MessageSquare size={28} className="mb-2 opacity-30" />
        <span className="text-xs font-semibold uppercase tracking-widest">No Active Debate</span>
        <span className="text-[11px] mt-1 text-slate-700">Agents are in agreement</span>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card p-4 h-full flex flex-col min-h-[200px] relative overflow-hidden ${
        debate.status === 'Debating' ? 'glow-amber' : 'glow-teal'
      }`}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${
        debate.status === 'Debating'
          ? 'bg-gradient-to-r from-red-500 via-amber-500 to-blue-500'
          : 'bg-gradient-to-r from-teal-500 to-indigo-500'
      }`} />

      <div className="flex items-center gap-2 mb-3 mt-1">
        <Swords size={14} className={debate.status === 'Debating' ? 'text-amber-400' : 'text-teal-400'} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Agent Debate</p>
          <p className="text-xs text-slate-300 truncate font-medium">{debate.topic}</p>
        </div>
        <span className={`badge ${debate.status === 'Debating' ? 'badge-warn' : 'badge-active'}`}>
          {debate.status}
        </span>
      </div>

      <div className="flex gap-2 flex-1">
        {/* Agent A */}
        <div className="flex-1 bg-red-950/20 border border-red-900/30 rounded-xl p-2.5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-0.5 h-full bg-red-500/50" />
          <strong className="text-[10px] text-red-400 font-mono uppercase pl-1 block mb-1">{debate.agentA.id}</strong>
          <p className="text-[11px] text-slate-400 pl-1 leading-relaxed">{debate.agentA.argument}</p>
        </div>

        <div className="flex items-center">
          <AlertCircle size={14} className="text-slate-600" />
        </div>

        {/* Agent B */}
        <div className="flex-1 bg-blue-950/20 border border-blue-900/30 rounded-xl p-2.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-0.5 h-full bg-blue-500/50" />
          <strong className="text-[10px] text-blue-400 font-mono uppercase block mb-1 text-right">{debate.agentB.id}</strong>
          <p className="text-[11px] text-slate-400 leading-relaxed">{debate.agentB.argument}</p>
        </div>
      </div>

      {/* Consensus */}
      {debate.consensus && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-teal-950/30 border border-teal-900/40 rounded-xl p-3"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <GitMerge size={13} className="text-teal-400" />
            <span className="text-[10px] text-teal-400 uppercase tracking-wider font-semibold font-mono">Consensus</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{debate.consensus}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
