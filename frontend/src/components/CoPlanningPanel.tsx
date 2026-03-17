"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PauseCircle, PlayCircle, Terminal, CheckSquare, Save } from 'lucide-react';

interface CoPlanningProps {
  initialTaskPlan: string;
  isPaused: boolean;
  onPauseToggle: (pause: boolean) => void;
  onUpdatePlan: (newPlan: string) => void;
  onManualStepOverride: () => void;
}

export default function CoPlanningPanel({ initialTaskPlan, isPaused, onPauseToggle, onUpdatePlan, onManualStepOverride }: CoPlanningProps) {
  const [taskText, setTaskText] = useState(initialTaskPlan);

  useEffect(() => {
    if (!isPaused) setTaskText(initialTaskPlan);
  }, [initialTaskPlan, isPaused]);

  return (
    <div className="glass-card p-4 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-teal-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Co-Planning</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => onPauseToggle(!isPaused)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            isPaused
              ? 'bg-amber-950/40 border-amber-700/50 text-amber-400 hover:bg-amber-950/60'
              : 'bg-teal-950/40 border-teal-700/40 text-teal-400 hover:bg-teal-950/60'
          }`}
        >
          {isPaused ? <PlayCircle size={13}/> : <PauseCircle size={13}/>}
          {isPaused ? 'Resume' : 'Pause'}
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <textarea
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          disabled={!isPaused}
          className={`flex-1 text-[11px] font-mono leading-relaxed p-3 rounded-xl border outline-none resize-none transition-all ${
            isPaused
              ? 'bg-slate-950/80 border-teal-700/40 text-slate-300 focus:border-teal-500/60'
              : 'bg-slate-950/40 border-white/5 text-slate-500 cursor-not-allowed'
          }`}
          placeholder="Waiting for task plan from Orchestrator..."
        />

        <div className="flex items-center justify-between text-[10px] bg-slate-950/60 rounded-xl px-3 py-2 border border-white/5">
          <span className={`flex items-center gap-1.5 ${isPaused ? 'text-amber-500' : 'text-teal-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-500 animate-pulse' : 'bg-teal-500'}`} />
            {isPaused ? 'Editing (Paused)' : 'Live Read-Only'}
          </span>

          <div className="flex gap-1.5">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => onUpdatePlan(taskText)}
              disabled={!isPaused || taskText === initialTaskPlan}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-40 border border-white/5 transition-all"
            >
              <Save size={10}/> Save
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={onManualStepOverride}
              disabled={!isPaused}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-950/50 text-teal-400 border border-teal-800/50 hover:bg-teal-950/80 disabled:opacity-40 transition-all"
            >
              <CheckSquare size={10}/> Override
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
