import * as fs from 'fs';
import * as path from 'path';
import * as git from 'isomorphic-git';
import * as lockfile from 'proper-lockfile';

const MEMORY_DIR = path.resolve(__dirname, '../../MEMORY.md');
const STATE_FILE_PATH = path.join(MEMORY_DIR, 'state.md');

export class MemoryManager {
    static async init() {
        if (!fs.existsSync(MEMORY_DIR)) {
            fs.mkdirSync(MEMORY_DIR, { recursive: true });
        }
        
        if (!fs.existsSync(STATE_FILE_PATH)) {
            fs.writeFileSync(STATE_FILE_PATH, '# Central Memory State\n\n', 'utf8');
        }
        
        await git.init({ fs, dir: MEMORY_DIR });
        
        const status = await git.status({ fs, dir: MEMORY_DIR, filepath: 'state.md' });
        if (status === '*added' || status === '*unmodified' || status === '*modified' || status === 'added') {
             await git.add({ fs, dir: MEMORY_DIR, filepath: 'state.md' });
             await git.commit({
                 fs,
                 dir: MEMORY_DIR,
                 author: { name: 'Orchestrator', email: 'orchestrator@tentacles.local' },
                 message: 'Initial state'
             });
        }
    }

    static async writeMemory(agentId: string, data: string): Promise<boolean> {
        let release: (() => Promise<void>) | null = null;
        try {
            // Acquire atomic lock on the state file.
            // Using a high number of retries to accommodate many concurrent agents
            release = await lockfile.lock(STATE_FILE_PATH, {
                retries: {
                    retries: 100,
                    factor: 1.2,
                    minTimeout: 50,
                    maxTimeout: 1000,
                }
            });

            // Read existing memory
            const currentMem = fs.readFileSync(STATE_FILE_PATH, 'utf8');
            const timestamp = new Date().toISOString();
            const newEntry = `\n[${timestamp}] <${agentId}>: ${data}`;
            
            // Append and save
            fs.writeFileSync(STATE_FILE_PATH, currentMem + newEntry, 'utf8');

            // Commit changes using isomorphic-git atomically during the lock
            await git.add({ fs, dir: MEMORY_DIR, filepath: 'state.md' });
            await git.commit({
                 fs,
                 dir: MEMORY_DIR,
                 author: { name: agentId, email: `${agentId.toLowerCase()}@tentacles.local` },
                 message: `Update from ${agentId}`
             });

            return true;
        } catch (error) {
            console.error(`[${agentId}] Memory write failed:`, error);
            throw error;
        } finally {
            if (release) {
                await release();
            }
        }
    }
}
