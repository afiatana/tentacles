"use client";

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Activity, Skull, Wifi, WifiOff, Zap, TerminalSquare, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, MessageSquare, DollarSign, Scale } from 'lucide-react';
import MultimodalInput from '../components/MultimodalInput';
import DebatePanel, { DebateState } from '../components/DebatePanel';
import CoPlanningPanel from '../components/CoPlanningPanel';
import { SystemMetricsState } from '../components/MetricsPanel';
import ChatPanel, { ChatMessage } from '../components/ChatPanel';

interface AgentState {
  id: string;
  status: 'Idle' | 'Active' | 'Processing' | 'Terminated';
  log: string;
}

const springIn: Variants = {
  hidden:  { opacity: 0, y: 18, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 240, damping: 22, delay: i * 0.06 }
  }),
};

let msgCounter = 0;

export default function Dashboard() {
  const [socket, setSocket]           = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [agents, setAgents]           = useState<AgentState[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping]         = useState(false);
  const [memoryLogs, setMemoryLogs]     = useState<string[]>(['[System] Booting Tentacles Orchestrator...']);
  const [debateState, setDebateState]   = useState<DebateState | null>(null);
  const [taskPlan, setTaskPlan]         = useState<string>('');
  const [isPaused, setIsPaused]         = useState<boolean>(false);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetricsState | null>(null);

  // Mobile panel visibility state
  const [leftOpen,  setLeftOpen]  = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = io();
    setSocket(s);

    s.on('connect',    () => setIsConnected(true));
    s.on('disconnect', () => setIsConnected(false));

    s.on('agent_state_update', (agentList: AgentState[]) => {
      setAgents(agentList);
      // Push agent processing events as chat messages (system role for non-intrusive display)
      agentList.forEach(agent => {
        if (agent.status === 'Processing') {
          setMemoryLogs(prev => [...prev.slice(-200), `[${new Date().toISOString()}] <${agent.id}> updated state to: Processing`]);
        }
      });
    });

    s.on('memory_log_append', (logEntry: string) => {
      setMemoryLogs(prev => [...prev.slice(-200), logEntry]);
    });

    s.on('debate_state_update', (debate: DebateState | null) => {
      setDebateState(debate);
      if (debate) {
        setChatMessages(prev => [...prev, {
          id: `sys-${++msgCounter}`,
          role: 'system',
          content: `[Debate] ${debate.agentA.id} vs ${debate.agentB.id} — "${debate.topic}"`,
          timestamp: Date.now(),
        }]);
      }
    });

    s.on('task_plan_update', (payload: { plan: string; isPaused: boolean }) => {
      setTaskPlan(payload.plan);
      setIsPaused(payload.isPaused);
    });

    s.on('evaluation_metrics_update', (metrics: SystemMetricsState | null) => {
      setSystemMetrics(metrics);
    });

    // Real agent reply from backend — stop typing indicator
    s.on('chat_response', (payload: { agentId: string; content: string; timestamp: number }) => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, {
        id: `agent-${++msgCounter}`,
        role: 'agent',
        agentId: payload.agentId,
        content: payload.content,
        timestamp: payload.timestamp,
      }]);
    });

    return () => { s.disconnect(); };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [memoryLogs]);

  const handleSendIntent = (text: string, fileCount: number) => {
    if (!text.trim() && fileCount === 0) return;

    // Add user bubble
    const userMsg: ChatMessage = {
      id: `user-${++msgCounter}`,
      role: 'user',
      content: fileCount > 0 ? `${text} [+${fileCount} file${fileCount > 1 ? 's' : ''}]` : text,
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsTyping(true);  // Show typing indicator until chat_response arrives

    // Emit to WebSocket — backend will respond with chat_response event
    socket?.emit('multimodal_intent_route', { text, files: fileCount });
  };

  const handleKillSwitch = (agentId: string) => {
    if (confirm(`⚠️ Emergency Kill Switch: Terminate ${agentId}?`)) {
      socket?.emit('kill_agent', { agentId });
      setChatMessages(prev => [...prev, {
        id: `sys-${++msgCounter}`, role: 'system',
        content: `🚨 Kill Switch activated — ${agentId} terminated.`,
        timestamp: Date.now(),
      }]);
    }
  };

  const handlePauseToggle    = (pause: boolean)   => socket?.emit('co_plan_workflow_pause', pause);
  const handleUpdatePlan     = (newPlan: string)   => socket?.emit('co_plan_update', newPlan);
  const handleManualOverride = ()                  => socket?.emit('co_plan_manual_override');

  const glowForStatus  = (s: string) => s === 'Active' || s === 'Processing' ? 'glow-teal' : s === 'Terminated' ? 'glow-red' : '';
  const badgeForStatus = (s: string) => s === 'Active' || s === 'Processing' ? 'badge-active' : s === 'Terminated' ? 'badge-danger' : 'badge-idle';

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-void">

        {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center gap-2 px-4 md:px-6 py-2.5 border-b border-white/5 bg-glass backdrop-blur-xl z-40">
        {/* Mobile: left panel toggle */}
        <button onClick={() => { setLeftOpen(o => !o); setRightOpen(false); }}
          className="lg:hidden text-slate-500 hover:text-indigo-400 transition-colors shrink-0">
          {leftOpen ? <PanelLeftClose size={20}/> : <PanelLeftOpen size={20}/>}
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-indigo-300 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
              Tentacles LMA
            </h1>
            <p className="text-[9px] text-slate-600 font-mono">v2.6.0</p>
          </div>
        </div>

        {/* ── Compact Inline Metrics (Fix 1) ───────────────────────────── */}
        {systemMetrics && (
          <div className="hidden md:flex items-center gap-1 flex-1 mx-3 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-card text-[10px] font-mono divide-x divide-white/10 overflow-hidden">
              <span className="flex items-center gap-1 pr-2 text-slate-400">
                <DollarSign size={10} className="text-slate-500"/>
                <span className="text-slate-300 font-semibold">${systemMetrics.totalSystemCostUsd.toFixed(4)}</span>
              </span>
              <span className="flex items-center gap-1 px-2 text-slate-400">
                <span className={systemMetrics.averageLatencyMs < 2000 ? 'text-teal-400 font-semibold' : 'text-amber-400 font-semibold'}>{systemMetrics.averageLatencyMs}ms</span>
              </span>
              <span className="flex items-center gap-1 px-2 text-slate-400">
                <Scale size={10} className="text-slate-500"/>
                <span className={systemMetrics.successRate >= 90 ? 'text-teal-400 font-semibold' : 'text-amber-400 font-semibold'}>{systemMetrics.successRate.toFixed(0)}%</span>
              </span>
              <span className="flex items-center gap-1 pl-2 text-slate-400">
                Faithfulness:
                <span className={systemMetrics.averageFaithfulnessScore >= 90 ? 'text-teal-400 font-semibold' : 'text-amber-400 font-semibold'}>{systemMetrics.averageFaithfulnessScore.toFixed(1)}%</span>
              </span>
            </div>
          </div>
        )}

        <div className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold glass-card shrink-0 ${
          isConnected ? 'text-teal-400 border-teal-900/50' : 'text-red-400 border-red-900/50'
        }`}>
          {isConnected ? <><span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping-slow"/><Wifi size={11}/><span className="hidden sm:inline"> LIVE</span></> : <><WifiOff size={11}/> OFFLINE</>}
        </div>

        {/* Mobile: right panel toggle */}
        <button onClick={() => { setRightOpen(o => !o); setLeftOpen(false); }}
          className="lg:hidden text-slate-500 hover:text-teal-400 transition-colors shrink-0">
          {rightOpen ? <PanelRightClose size={20}/> : <PanelRightOpen size={20}/>}
        </button>
      </header>

      {/* Metrics strip removed — now in header */}

      {/* ── Main 3-Column Layout ─────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── LEFT COLUMN: Agent Arms + Debate ─────────────────────── */}
        {/* Desktop: always visible. Mobile: slide-in drawer */}
        <AnimatePresence>
          {(leftOpen || true) && (
            <motion.aside
              key="left-panel"
              initial={false}
              animate={{ x: 0, opacity: 1 }}
              className={`
                ${leftOpen ? 'flex' : 'hidden lg:flex'}
                flex-col gap-3 border-r border-white/5 overflow-hidden
                w-[280px] xl:w-[300px] shrink-0 p-3
                lg:relative absolute inset-y-0 left-0 z-30 bg-void/95 backdrop-blur-xl lg:backdrop-blur-none lg:bg-transparent
              `}
            >
              {/* Active Arms card */}
              <div className="glass-card p-3 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Activity size={13} className="text-indigo-400" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Active Arms</span>
                </div>
                <AnimatePresence>
                  {agents.map(agent => (
                    <motion.div key={agent.id} layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`glass-card-raised p-2.5 flex flex-col gap-1.5 transition-all duration-500 ${glowForStatus(agent.status)}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-200 truncate">{agent.id}</span>
                        <span className={`badge ${badgeForStatus(agent.status)}`}>{agent.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono line-clamp-2 leading-relaxed">{agent.log}</p>
                      {agent.id !== 'Head' && agent.status !== 'Terminated' && (
                        <button onClick={() => handleKillSwitch(agent.id)}
                          className="w-full flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-semibold text-red-400 border border-red-900/40 hover:bg-red-900/20 transition-all">
                          <Skull size={10}/> Terminate
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Debate Panel — height capped (Fix 2) */}
              <div className="max-h-[25vh] overflow-y-auto">
                <DebatePanel debate={debateState} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── CENTER COLUMN: Chat Conversation ─────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden min-h-0">
          {/* Chat header */}
          <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-white/[0.015]">
            <MessageSquare size={14} className="text-indigo-400"/>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Agent Conversation</span>
            <span className="ml-auto text-[10px] text-slate-600 font-mono">{chatMessages.filter(m => m.role !== 'system').length} messages</span>
          </div>

          {/* Chat area + Prompt Bar — prompt is absolute-pinned to bottom (Fix 4) */}
          <div className="flex-1 min-h-0 relative overflow-hidden">
            {/* Scrollable message area with bottom padding to clear the absolute prompt bar */}
            <div className="absolute inset-0 overflow-y-auto pb-[88px]">
              <ChatPanel messages={chatMessages.filter(m => m.role !== 'system')} isTyping={isTyping} />
            </div>

            {/* Floating Prompt Bar — always anchored at the bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6 pb-4 pt-3 bg-gradient-to-t from-void via-void/95 to-transparent">
              <MultimodalInput onSendIntent={handleSendIntent} />
            </div>
          </div>
        </main>

        {/* ── RIGHT COLUMN: Co-Planning + Memory Stream ─────────────── */}
        <AnimatePresence>
          {(rightOpen || true) && (
            <motion.aside
              key="right-panel"
              initial={false}
              animate={{ x: 0, opacity: 1 }}
              className={`
                ${rightOpen ? 'flex' : 'hidden lg:flex'}
                flex-col gap-3 border-l border-white/5 overflow-hidden
                w-[280px] xl:w-[320px] shrink-0 p-3
                lg:relative absolute inset-y-0 right-0 z-30 bg-void/95 backdrop-blur-xl lg:backdrop-blur-none lg:bg-transparent
              `}
            >
              {/* Co-Planning Panel — height capped (Fix 3) */}
              <div className="shrink-0 max-h-[30vh] overflow-y-auto">
                <CoPlanningPanel
                  initialTaskPlan={taskPlan}
                  isPaused={isPaused}
                  onPauseToggle={handlePauseToggle}
                  onUpdatePlan={handleUpdatePlan}
                  onManualStepOverride={handleManualOverride}
                />
              </div>

              {/* Memory Stream — flex-1 min-h-0 fills remaining space in right col, slice(-7) (Fixes 4+5) */}
              <div className="flex-1 min-h-0 glass-card flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-white/[0.015] shrink-0">
                  <TerminalSquare size={12} className="text-slate-500"/>
                  <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">Memory.md · Stream</span>
                  <span className="ml-auto text-[9px] text-slate-700 font-mono">{memoryLogs.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] leading-relaxed space-y-0.5">
                  <AnimatePresence initial={false}>
                    {memoryLogs.slice(-7).map((log, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`${
                          log.includes('[CRITICAL')  ? 'text-red-400' :
                          log.includes('[DEBATE')    ? 'text-amber-400' :
                          log.includes('[CONSENSUS') ? 'text-teal-400' :
                          log.includes('[A2A]')      ? 'text-indigo-400' :
                          'text-slate-500'
                        }`}
                      >{log}</motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={logEndRef} /></div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile backdrop overlay */}
        {(leftOpen || rightOpen) && (
          <div className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => { setLeftOpen(false); setRightOpen(false); }} />
        )}
      </div>
    </div>
  );
}
