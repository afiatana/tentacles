"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ActivitySquare, DollarSign, Zap, Scale, TrendingUp } from 'lucide-react';

export interface SystemMetricsState {
  totalRuns: number;
  totalSystemCostUsd: number;
  averageLatencyMs: number;
  successRate: number;
  averageFaithfulnessScore: number;
}

interface MetricsPanelProps { metrics: SystemMetricsState | null; }

function MetricTile({ icon, label, value, color, sub }: {
  icon: React.ReactNode; label: string; value: string; color: string; sub?: string;
}) {
  return (
    <div className="glass-card-raised px-4 py-3 flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">{label}</p>
        <p className="text-base font-bold text-slate-100 leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-slate-600">{sub}</p>}
      </div>
    </div>
  );
}

export default function MetricsPanel({ metrics }: MetricsPanelProps) {
  if (!metrics) {
    return (
      <div className="glass-card px-4 py-3 flex items-center gap-2 text-slate-600 text-xs">
        <ActivitySquare size={14} />
        <span className="font-mono uppercase tracking-widest text-[10px]">Awaiting evaluation telemetry...</span>
      </div>
    );
  }

  const faithColor = metrics.averageFaithfulnessScore >= 90 ? 'text-teal-400' : metrics.averageFaithfulnessScore > 75 ? 'text-amber-400' : 'text-red-400';
  const latencyColor = metrics.averageLatencyMs < 2000 ? 'text-teal-400' : metrics.averageLatencyMs < 5000 ? 'text-amber-400' : 'text-red-400';
  const successColor = metrics.successRate >= 95 ? 'text-teal-400' : 'text-amber-400';

  return (
    <motion.div layout className="glass-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/[0.015]">
        <TrendingUp size={13} className="text-indigo-400" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">System Evaluation Metrics</span>
        <span className="ml-auto font-mono text-[10px] text-slate-600">{metrics.totalRuns} TX</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3">
        <MetricTile
          icon={<DollarSign size={15} className="text-slate-300" />}
          label="TCO Burn"
          value={`$${metrics.totalSystemCostUsd.toFixed(4)}`}
          color="bg-slate-800"
          sub="Aggregate API cost"
        />
        <MetricTile
          icon={<Zap size={15} className={latencyColor} />}
          label="Avg Latency"
          value={`${metrics.averageLatencyMs}ms`}
          color="bg-slate-800"
          sub="End-to-end execution"
        />
        <MetricTile
          icon={<Scale size={15} className={successColor} />}
          label="Reliability"
          value={`${metrics.successRate.toFixed(1)}%`}
          color="bg-slate-800"
          sub="Handoff success rate"
        />
        <MetricTile
          icon={<ActivitySquare size={15} className={faithColor} />}
          label="Faithfulness"
          value={`${metrics.averageFaithfulnessScore.toFixed(1)}%`}
          color="bg-slate-800"
          sub="Context adherence"
        />
      </div>

      {/* Health bar */}
      <div className="h-0.5 w-full bg-slate-900 relative">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-teal-500"
          animate={{ width: `${metrics.averageFaithfulnessScore}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>
    </motion.div>
  );
}
