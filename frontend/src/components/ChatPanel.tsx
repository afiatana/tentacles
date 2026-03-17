"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Loader, Cpu } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  agentId?: string;
  content: string;
  timestamp: number;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export default function ChatPanel({ messages, isTyping = false }: ChatPanelProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-600 py-16">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-teal-600/20 border border-white/5 flex items-center justify-center">
          <Cpu size={26} className="text-indigo-400 opacity-60" />
        </div>
        <p className="text-sm font-semibold text-slate-500">Tentacles Orchestrator</p>
        <p className="text-xs text-slate-700 text-center max-w-[260px] leading-relaxed">
          Route a multimodal intent below to engage the agent network. Responses will stream here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <AnimatePresence initial={false}>
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';

          if (isSystem) {
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <span className="text-[10px] text-slate-600 bg-slate-900/60 border border-white/5 rounded-full px-3 py-1 font-mono">
                  {msg.content}
                </span>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 24 }}
              className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                isUser
                  ? 'bg-indigo-600/30 border border-indigo-500/40'
                  : 'bg-teal-900/40 border border-teal-700/40'
              }`}>
                {isUser
                  ? <User size={13} className="text-indigo-300" />
                  : <Bot size={13} className="text-teal-300" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                {!isUser && msg.agentId && (
                  <span className="text-[9px] text-teal-600 font-mono uppercase tracking-wider pl-1">{msg.agentId}</span>
                )}
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600/25 border border-indigo-500/30 text-indigo-100 rounded-br-sm'
                    : 'bg-slate-800/60 border border-white/5 text-slate-200 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[9px] text-slate-700 font-mono px-1">
                  {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Typing indicator — only shown while waiting for backend chat_response */}
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="flex items-end gap-2.5"
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-teal-900/40 border border-teal-700/40 shrink-0">
            <Loader size={13} className="text-teal-300 animate-spin" />
          </div>
          <div className="bg-slate-800/60 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-2.5">
            <div className="flex gap-1 items-center h-4">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
