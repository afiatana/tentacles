const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

// Mock Evaluation Logger instance to feed the UI
class MockEvaluationLogger {
  constructor() {
     this.logs = [];
  }
  generateTick(agentId, modelName) {
     const isSuccess = Math.random() > 0.05; // 95% pass rate
     const isHallucination = Math.random() > 0.95; // 5% hallucination rate
     
     const metric = {
        timestamp: Date.now(),
        agentId: agentId,
        model: modelName,
        costEstimateUsd: ((Math.random() * 800) * 0.00015 / 1000) + ((Math.random() * 200) * 0.0006 / 1000),
        latencyMs: 800 + Math.floor(Math.random() * 1200),
        success: isSuccess,
        faithfulnessScore: isHallucination ? 0.4 : 0.85 + (Math.random() * 0.15)
     };
     
     this.logs.push(metric);
     if (this.logs.length > 50) this.logs.shift(); // Keep last 50
     
     return this.aggregate();
  }
  aggregate() {
     if (this.logs.length === 0) return null;
     
     let totalCost = 0, totalLatency = 0, successCount = 0, avgFaith = 0;
     this.logs.forEach(l => {
         totalCost += l.costEstimateUsd;
         totalLatency += l.latencyMs;
         if (l.success) successCount++;
         avgFaith += l.faithfulnessScore;
     });
     
     return {
         totalRuns: this.logs.length,
         totalSystemCostUsd: totalCost,
         averageLatencyMs: Math.round(totalLatency / this.logs.length),
         successRate: (successCount / this.logs.length) * 100,
         averageFaithfulnessScore: (avgFaith / this.logs.length) * 100
     };
  }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Initialize Next.js engine
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io Server bound to the Next.js HTTP Server
  const io = new Server(server);

  // Simulation State
  let heartbeatIndex = 0;
  let activeAgents = [
    { id: 'Head', status: 'Idle', log: 'Orchestrator ready.' },
    { id: 'Frontend_Arm', status: 'Idle', log: 'Awaiting task routing.' },
    { id: 'Python_Arm', status: 'Idle', log: 'Awaiting data processing task.' }
  ];
  let isWorkflowPaused = false;
  let globalTaskPlan = "# Current Strategy\\nWaiting for intent payload to generate strategy...";
  let currentDebate = null; // null or DebateState object
  
  const evalLogger = new MockEvaluationLogger();
  let systemHealthMetrics = evalLogger.aggregate();

  io.on('connection', (socket) => {
    console.log('[WebSocket] Client connected:', socket.id);
    
    // Send initial config to the client
    socket.emit('agent_state_update', activeAgents);
    socket.emit('task_plan_update', { plan: globalTaskPlan, isPaused: isWorkflowPaused });
    socket.emit('debate_state_update', currentDebate);
    socket.emit('evaluation_metrics_update', systemHealthMetrics);

    // Mocking orchestrated broadcast
    const simulationInterval = setInterval(() => {
      if (isWorkflowPaused) return; // Freeze simulation if Co-planning is paused
      
      heartbeatIndex++;
      heartbeatIndex++;
      
      // Randomly update an agent's state
      const targetAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
      if (targetAgent.id !== 'Head' && targetAgent.status !== 'Terminated') {
         targetAgent.status = 'Processing';
         targetAgent.log = `Executing sub-task slice #${heartbeatIndex}...`;
         
         // Trigger a system metric logging event
         systemHealthMetrics = evalLogger.generateTick(targetAgent.id, 'gpt-4o-mini');
         io.emit('evaluation_metrics_update', systemHealthMetrics);
         
      } else if (targetAgent.id === 'Head') {
         targetAgent.log = `Heartbeat [${heartbeatIndex}] received. Vectorizing memory intents.`;
         systemHealthMetrics = evalLogger.generateTick(targetAgent.id, 'claude-3-5-sonnet');
         io.emit('evaluation_metrics_update', systemHealthMetrics);
      }

      socket.emit('agent_state_update', activeAgents);
      socket.emit('memory_log_append', `[${new Date().toISOString()}] <${targetAgent.id}> updated state to: ${targetAgent.status}`);
      
      // Randomly trigger a Debate Simulation
      if (heartbeatIndex % 8 === 0 && !currentDebate) {
          currentDebate = {
             topic: "Memory Manager File Lock Implementation",
             agentA: { id: "Frontend_Arm (Critic)", argument: "File locks are too slow for Next.js API Routes. We should use Redis for distributed locks instead." },
             agentB: { id: "Python_Arm (Worker)", argument: "Redis adds infrastructure weight. The proper-lockfile package on existing FS is sufficient and deterministic." },
             consensus: null,
             status: 'Debating'
          };
          socket.emit('debate_state_update', currentDebate);
          socket.emit('memory_log_append', `[DEBATE INITIATED] Critic Arms reviewing ${targetAgent.id} proposal...`);
      } else if (heartbeatIndex % 11 === 0 && currentDebate?.status === 'Debating') {
          currentDebate.status = 'Resolved';
          currentDebate.consensus = "Agreed to use 'proper-lockfile' with Node.js to avoid extra dependencies, but add a 5-second timeout fail-safe.";
          socket.emit('debate_state_update', currentDebate);
          socket.emit('memory_log_append', `[CONSENSUS REACHED] Orchestrator merging debate resolution into memory.`);
          
          // Clear debate after seconds
          setTimeout(() => {
             currentDebate = null;
             io.emit('debate_state_update', currentDebate);
          }, 6000);
      }
      
    }, 2500); // 2.5 seconds heartbeat simulation

    // Receive Payload from Frontend's Multimodal Router Input
    socket.on('multimodal_intent_route', (payload) => {
        console.log(`[WebSocket] Received LMA Intent from User:`, payload.text);

        // Log to Memory stream only (not chat)
        socket.emit('memory_log_append', `[Router] Intent received. Vectorizing: "${payload.text.substring(0, 40)}..."`);

        // Update task plan
        globalTaskPlan = `# Dynamic Plan Generated\\n1. Parse intent: "${payload.text.substring(0, 30)}..."\\n2. Route to specialist arm.\\n3. Await resolution.`;
        io.emit('task_plan_update', { plan: globalTaskPlan, isPaused: isWorkflowPaused });

        // Activate arms
        activeAgents.forEach(a => {
            if (a.id !== 'Head') {
                a.status = 'Active';
                a.log = `Processing: "${payload.text.substring(0, 20)}..."`;
            } else {
                a.log = `Routing intent via MoMA Semantic Router...`;
            }
        });
        socket.emit('agent_state_update', activeAgents);

        // Simulate LLM processing delay, then emit final response to chat
        const RESPONSES = [
            `Saya adalah Kepala Gurita (Head Orchestrator) dari sistem Tentacles — sebuah kerangka agen AI multi-lengan. Tugas saya adalah memahami niat Anda, memecahnya menjadi sub-tugas, dan mendelegasikannya ke lengan spesialis (Frontend, Python, Critic) yang paling relevan. Apa yang ingin Anda kerjakan?`,
            `Intent Anda telah dianalisis oleh MoMA Semantic Router. Berdasarkan vektor semantik, saya meneruskan tugas ini ke lengan yang paling optimal. Saat ini semua lengan beroperasi pada kapasitas penuh. Adakah detail tambahan yang ingin Anda tambahkan?`,
            `Permintaan Anda berhasil diterima dan diproses. Saya telah memperbarui rencana tugas (task_plan.md) sesuai konteks terbaru. Lengan Python sedang menganalisis struktur data, sementara lengan Frontend menyiapkan komponen UI terkait. Apakah Anda ingin menjeda alur kerja (Co-Planning) untuk meninjau sebelum dilanjutkan?`,
            `Saya mendeteksi pola kompleks dalam permintaan ini. Sedang mendistribusikan ke dua lengan secara paralel: Lengan Kritikus akan mengevaluasi pendekatan, sementara Lengan Worker akan mengeksekusi. Estimasi resolusi: 3 siklus heartbeat. Metrics sedang dipantau.`,
            `Konteks Anda telah disimpan ke MEMORY.md dan diteruskan kepada seluruh lengan aktif melalui protokol A2A. Context Engine tidak mendeteksi adanya injeksi berbahaya pada payload ini — input aman dan diizinkan untuk diproses.`,
        ];

        const reply = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
        const latency = 1200 + Math.floor(Math.random() * 1000);

        setTimeout(() => {
            socket.emit('chat_response', {
                agentId: 'Head Orchestrator',
                content: reply,
                timestamp: Date.now(),
            });
            socket.emit('memory_log_append', `[A2A] Head → Client: Final response dispatched. Latency: ${latency}ms`);

            // Reset arm statuses
            activeAgents.forEach(a => {
                if (a.status === 'Active') {
                    a.status = 'Idle';
                    a.log = `Task resolved. Standing by.`;
                }
            });
            socket.emit('agent_state_update', activeAgents);
        }, latency);
    });

    // Receive Kill Switch Command
    socket.on('emergency_kill_switch', (targetId) => {
       console.log(`[CRITICAL] Kill Switch engaged for: ${targetId}`);
       const target = activeAgents.find(a => a.id === targetId);
       if (target) {
           target.status = 'Terminated';
           target.log = 'Process killed by Human-in-the-Loop.';
           socket.emit('memory_log_append', `[CRITICAL ALERT] ${targetId} execution forcefully halted by Orchestrator.`);
           socket.emit('agent_state_update', activeAgents);
       }
    });

    // Handle Co-Planning and Overrides
    socket.on('co_plan_workflow_pause', (pauseState) => {
        isWorkflowPaused = pauseState;
        console.log(`[CoPlanning] Workflow paused state changed to: ${isWorkflowPaused}`);
        io.emit('task_plan_update', { plan: globalTaskPlan, isPaused: isWorkflowPaused });
        io.emit('memory_log_append', isWorkflowPaused ? `[USER OVERRIDE] Orchestrator PAUSED by Human-in-the-Loop.` : `[USER OVERRIDE] Orchestrator RESUMED by Human-in-the-Loop.`);
    });

    socket.on('co_plan_update', (newPlan) => {
        globalTaskPlan = newPlan;
        console.log(`[CoPlanning] Human updated the task plan.`);
        io.emit('task_plan_update', { plan: globalTaskPlan, isPaused: isWorkflowPaused });
        io.emit('memory_log_append', `[MEMORY SYNC] Context Engine ingested manual plan modifications.`);
    });

    socket.on('co_plan_manual_override', () => {
         console.log(`[CoTasking] Human explicitly stepping execution.`);
         io.emit('memory_log_append', `[CO-TASKING] Manual step execution triggered by User... advancing state.`);
         
         // Trigger 1 heartbeat step
         const targetAgent = activeAgents[1];
         targetAgent.status = 'Processing';
         targetAgent.log = `Executing Manual Step Override...`;
         io.emit('agent_state_update', activeAgents);
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Client disconnected:', socket.id);
      clearInterval(simulationInterval);
    });
  });

  server.listen(port, () => {
    console.log(`\n> Tentacles LMA Dashboard Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket Observability Stream initialized on standard HTTP Port.`);
  });
}).catch(console.error);
