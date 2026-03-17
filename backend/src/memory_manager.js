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
exports.MemoryManager = void 0;
var fs = require("fs");
var path = require("path");
var git = require("isomorphic-git");
var lockfile = require("proper-lockfile");
var MEMORY_DIR = path.resolve(__dirname, '../../MEMORY.md');
var STATE_FILE_PATH = path.join(MEMORY_DIR, 'state.md');
var MemoryManager = /** @class */ (function () {
    function MemoryManager() {
    }
    MemoryManager.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!fs.existsSync(MEMORY_DIR)) {
                            fs.mkdirSync(MEMORY_DIR, { recursive: true });
                        }
                        if (!fs.existsSync(STATE_FILE_PATH)) {
                            fs.writeFileSync(STATE_FILE_PATH, '# Central Memory State\n\n', 'utf8');
                        }
                        return [4 /*yield*/, git.init({ fs: fs, dir: MEMORY_DIR })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, git.status({ fs: fs, dir: MEMORY_DIR, filepath: 'state.md' })];
                    case 2:
                        status = _a.sent();
                        if (!(status === '*added' || status === '*unmodified' || status === '*modified' || status === 'added')) return [3 /*break*/, 5];
                        return [4 /*yield*/, git.add({ fs: fs, dir: MEMORY_DIR, filepath: 'state.md' })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, git.commit({
                                fs: fs,
                                dir: MEMORY_DIR,
                                author: { name: 'Orchestrator', email: 'orchestrator@tentacles.local' },
                                message: 'Initial state'
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    MemoryManager.writeMemory = function (agentId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var release, currentMem, timestamp, newEntry, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        release = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 9]);
                        return [4 /*yield*/, lockfile.lock(STATE_FILE_PATH, {
                                retries: {
                                    retries: 100,
                                    factor: 1.2,
                                    minTimeout: 50,
                                    maxTimeout: 1000,
                                }
                            })];
                    case 2:
                        // Acquire atomic lock on the state file.
                        // Using a high number of retries to accommodate many concurrent agents
                        release = _a.sent();
                        currentMem = fs.readFileSync(STATE_FILE_PATH, 'utf8');
                        timestamp = new Date().toISOString();
                        newEntry = "\n[".concat(timestamp, "] <").concat(agentId, ">: ").concat(data);
                        // Append and save
                        fs.writeFileSync(STATE_FILE_PATH, currentMem + newEntry, 'utf8');
                        // Commit changes using isomorphic-git atomically during the lock
                        return [4 /*yield*/, git.add({ fs: fs, dir: MEMORY_DIR, filepath: 'state.md' })];
                    case 3:
                        // Commit changes using isomorphic-git atomically during the lock
                        _a.sent();
                        return [4 /*yield*/, git.commit({
                                fs: fs,
                                dir: MEMORY_DIR,
                                author: { name: agentId, email: "".concat(agentId.toLowerCase(), "@tentacles.local") },
                                message: "Update from ".concat(agentId)
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 5:
                        error_1 = _a.sent();
                        console.error("[".concat(agentId, "] Memory write failed:"), error_1);
                        throw error_1;
                    case 6:
                        if (!release) return [3 /*break*/, 8];
                        return [4 /*yield*/, release()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return MemoryManager;
}());
exports.MemoryManager = MemoryManager;
