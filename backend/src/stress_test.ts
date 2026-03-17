import { MemoryManager } from './memory_manager';
import * as fs from 'fs';
import * as path from 'path';

async function dummyAgent(agentId: string, iterations: number) {
    for (let i = 1; i <= iterations; i++) {
        const payload = `Execution output log ${i}`;
        // Add random slight delay to simulate processing drift/API latency
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        await MemoryManager.writeMemory(agentId, payload);
    }
}

async function runStressTest() {
    console.log('=====================================================');
    console.log('   TENTACLES CONCURRENT MEMORY STRESS TEST');
    console.log('=====================================================\n');

    const AGEN_COUNT = 10;
    const ITERATIONS_PER_AGENT = 20;
    const TOTAL_WRITES = AGEN_COUNT * ITERATIONS_PER_AGENT;

    console.log(`[+] Initializing Memory Sandbox and isomorphic-git...`);
    await MemoryManager.init();

    console.log(`[+] Firing up ${AGEN_COUNT} dummy agents...`);
    console.log(`[+] Each agent will attempt to write ${ITERATIONS_PER_AGENT} times concurrently.`);
    console.log(`[+] Total Expected Entries: ${TOTAL_WRITES}\n`);
    
    const promises: Promise<void>[] = [];
    const startTime = Date.now();

    for (let i = 1; i <= AGEN_COUNT; i++) {
        promises.push(dummyAgent(`Agent_${i}`, ITERATIONS_PER_AGENT));
    }

    // Wait for all agents to finish their operations
    await Promise.all(promises);
    
    const duration = Date.now() - startTime;
    console.log(`\n[+] Stress test completed in ${(duration / 1000).toFixed(2)} seconds.`);

    // Verification
    const stateFile = path.resolve(__dirname, '../../MEMORY.md/state.md');
    const content = fs.readFileSync(stateFile, 'utf8');
    
    // Count exactly lines matching `<Agent_.*>:`
    const lines = content.split('\n');
    let validatedWrites = 0;
    
    for (const line of lines) {
        if (line.match(/\[.*\] <Agent_\d+>:/)) {
            validatedWrites++;
        }
    }
    
    console.log('\n=====================================================');
    console.log('   RESULTS');
    console.log('=====================================================');
    console.log(`Expected Writes  : ${TOTAL_WRITES}`);
    console.log(`Validated Writes : ${validatedWrites}`);
    
    if (validatedWrites === TOTAL_WRITES) {
        console.log('\n✅ TEST PASSED: 100% Data integrity verified. Zero race conditions detected.');
    } else {
        console.log(`\n❌ TEST FAILED: Data collision or overwrite occurred. Missed ${TOTAL_WRITES - validatedWrites} writes.`);
    }

    console.log('\nSample from memory state file:');
    console.log(content.split('\n').slice(-5).join('\n'));
}

runStressTest().catch(console.error);
