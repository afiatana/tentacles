"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var memory_manager_1 = require("./memory_manager");
var fs = require("fs");
var path = require("path");
function dummyAgent(agentId, iterations) {
    return __awaiter(this, void 0, void 0, function () {
        var i, payload;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 1;
                    _a.label = 1;
                case 1:
                    if (!(i <= iterations)) return [3 /*break*/, 5];
                    payload = "Execution output log ".concat(i);
                    // Add random slight delay to simulate processing drift/API latency
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, Math.random() * 100); })];
                case 2:
                    // Add random slight delay to simulate processing drift/API latency
                    _a.sent();
                    return [4 /*yield*/, memory_manager_1.MemoryManager.writeMemory(agentId, payload)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function runStressTest() {
    return __awaiter(this, void 0, void 0, function () {
        var AGEN_COUNT, ITERATIONS_PER_AGENT, TOTAL_WRITES, promises, startTime, i, duration, stateFile, content, lines, validatedWrites, _i, lines_1, line;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('=====================================================');
                    console.log('   TENTACLES CONCURRENT MEMORY STRESS TEST');
                    console.log('=====================================================\n');
                    AGEN_COUNT = 10;
                    ITERATIONS_PER_AGENT = 20;
                    TOTAL_WRITES = AGEN_COUNT * ITERATIONS_PER_AGENT;
                    console.log("[+] Initializing Memory Sandbox and isomorphic-git...");
                    return [4 /*yield*/, memory_manager_1.MemoryManager.init()];
                case 1:
                    _a.sent();
                    console.log("[+] Firing up ".concat(AGEN_COUNT, " dummy agents..."));
                    console.log("[+] Each agent will attempt to write ".concat(ITERATIONS_PER_AGENT, " times concurrently."));
                    console.log("[+] Total Expected Entries: ".concat(TOTAL_WRITES, "\n"));
                    promises = [];
                    startTime = Date.now();
                    for (i = 1; i <= AGEN_COUNT; i++) {
                        promises.push(dummyAgent("Agent_".concat(i), ITERATIONS_PER_AGENT));
                    }
                    // Wait for all agents to finish their operations
                    return [4 /*yield*/, Promise.all(promises)];
                case 2:
                    // Wait for all agents to finish their operations
                    _a.sent();
                    duration = Date.now() - startTime;
                    console.log("\n[+] Stress test completed in ".concat((duration / 1000).toFixed(2), " seconds."));
                    stateFile = path.resolve(__dirname, '../../MEMORY.md/state.md');
                    content = fs.readFileSync(stateFile, 'utf8');
                    lines = content.split('\n');
                    validatedWrites = 0;
                    for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        line = lines_1[_i];
                        if (line.match(/\[.*\] <Agent_\d+>:/)) {
                            validatedWrites++;
                        }
                    }
                    console.log('\n=====================================================');
                    console.log('   RESULTS');
                    console.log('=====================================================');
                    console.log("Expected Writes  : ".concat(TOTAL_WRITES));
                    console.log("Validated Writes : ".concat(validatedWrites));
                    if (validatedWrites === TOTAL_WRITES) {
                        console.log('\n✅ TEST PASSED: 100% Data integrity verified. Zero race conditions detected.');
                    }
                    else {
                        console.log("\n\u274C TEST FAILED: Data collision or overwrite occurred. Missed ".concat(TOTAL_WRITES - validatedWrites, " writes."));
                    }
                    console.log('\nSample from memory state file:');
                    console.log(content.split('\n').slice(-5).join('\n'));
                    return [2 /*return*/];
            }
        });
    });
}
runStressTest().catch(console.error);
