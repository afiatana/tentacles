export interface SystemMetric {
    timestamp: number;
    correlationId: string;
    agentId: string;
    model: string;
    costMetrics: {
        promptTokens: number;
        completionTokens: number;
        costEstimateUsd: number;
    };
    latencyMs: number;
    reliabilityMetrics: {
        success: boolean;
        retryCount: number;
        handoffVariance: number; // Delta from baseline execution time
    };
    qualityMetrics: {
        faithfulnessScore: number; // 0.0 - 1.0 contextual adherence
        hallucinationFlag: boolean;
        safetyAbuseFlag: boolean;
    };
}

export class EvaluationLogger {
    private logs: SystemMetric[] = [];
    
    // Constant approximation vectors for models (March 2026 pricing base)
    private readonly RATES = {
        'gpt-4o-mini': { p: 0.00015 / 1000, c: 0.0006 / 1000 },
        'claude-3-5-sonnet': { p: 0.003 / 1000, c: 0.015 / 1000 },
        'default': { p: 0.001 / 1000, c: 0.002 / 1000 }
    };

    /**
     * Records a transactional execution slice and calculates dimensional metrics
     */
    public logExecution(
        correlationId: string, 
        agentId: string, 
        model: string, 
        promptTokens: number, 
        completionTokens: number, 
        latencyMs: number,
        success: boolean,
        isHallucination: boolean = false
    ): SystemMetric {
        
        const rate = this.RATES[model as keyof typeof this.RATES] || this.RATES['default'];
        const costEstimateUsd = (promptTokens * rate.p) + (completionTokens * rate.c);

        const metric: SystemMetric = {
            timestamp: Date.now(),
            correlationId,
            agentId,
            model,
            costMetrics: {
                promptTokens,
                completionTokens,
                costEstimateUsd: parseFloat(costEstimateUsd.toFixed(6))
            },
            latencyMs,
            reliabilityMetrics: {
                success,
                retryCount: success ? 0 : 1, // Simplified metric
                handoffVariance: (Math.random() * 0.5) - 0.25 // Simulated variance delta for POC
            },
            qualityMetrics: {
                // Synthetic mock score based on hallucination
                faithfulnessScore: isHallucination ? 0.35 : (0.85 + Math.random() * 0.14),
                hallucinationFlag: isHallucination,
                safetyAbuseFlag: false
            }
        };

        this.logs.push(metric);
        console.log(`[EvaluationMetric] Captured Event -> ID: ${correlationId} | Agent: ${agentId} | Cost: $${costEstimateUsd.toFixed(5)}`);
        return metric;
    }

    /**
     * Returns an aggregated snapshot of system health
     */
    public getAggregatedSnapshot() {
        if (this.logs.length === 0) return null;

        let totalCost = 0;
        let totalTokens = 0;
        let totalLatency = 0;
        let successCount = 0;
        let avgFaithfulness = 0;
        let hallucinationCount = 0;

        this.logs.forEach(log => {
             totalCost += log.costMetrics.costEstimateUsd;
             totalTokens += (log.costMetrics.promptTokens + log.costMetrics.completionTokens);
             totalLatency += log.latencyMs;
             if (log.reliabilityMetrics.success) successCount++;
             avgFaithfulness += log.qualityMetrics.faithfulnessScore;
             if (log.qualityMetrics.hallucinationFlag) hallucinationCount++;
        });

        const totalRuns = this.logs.length;
        
        return {
            totalRuns,
            totalSystemCostUsd: parseFloat(totalCost.toFixed(5)),
            totalTokensConsumed: totalTokens,
            averageLatencyMs: Math.round(totalLatency / totalRuns),
            successRate: parseFloat(((successCount / totalRuns) * 100).toFixed(1)),
            averageFaithfulnessScore: parseFloat(((avgFaithfulness / totalRuns) * 100).toFixed(1)),
            totalHallucinations: hallucinationCount,
            recentMetrics: this.logs.slice(-5) // Last 5 raw transactions for timeline graph
        };
    }
}
