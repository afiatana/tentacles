"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, FileText, Image, Video } from 'lucide-react';

interface MultimodalInputProps {
  onSendIntent: (text: string, fileCount: number) => void;
}

interface AttachedFile {
  name: string;
  type: 'doc' | 'image' | 'video' | 'other';
  size: string;
}

function getFileCategory(file: File): AttachedFile['type'] {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.includes('pdf') || file.type.includes('text') || file.name.endsWith('.md')) return 'doc';
  return 'other';
}

export default function MultimodalInput({ onSendIntent }: MultimodalInputProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    const parsed = dropped.map(f => ({
      name: f.name,
      type: getFileCategory(f),
      size: `${(f.size / 1024).toFixed(1)} KB`,
    }));
    setFiles(prev => [...prev, ...parsed].slice(0, 5));
  };

  const handleSend = () => {
    if (!text.trim() && files.length === 0) return;
    onSendIntent(text, files.length);
    setText('');
    setFiles([]);
  };

  const FileIcon = ({ type }: { type: AttachedFile['type'] }) => {
    if (type === 'image') return <Image size={12} className="text-indigo-400" />;
    if (type === 'video') return <Video size={12} className="text-teal-400" />;
    return <FileText size={12} className="text-slate-400" />;
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className="relative"
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-3xl border-2 border-dashed border-indigo-500/60 bg-indigo-950/40 backdrop-blur-md z-10 flex items-center justify-center"
          >
            <div className="text-center">
              <Paperclip size={24} className="text-indigo-400 mx-auto mb-2" />
              <span className="text-sm text-indigo-300 font-semibold">Drop files to attach</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attached files chips */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="flex flex-wrap gap-2 mb-2 px-2"
          >
            {files.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-slate-300"
              >
                <FileIcon type={f.type} />
                <span className="truncate max-w-[120px]">{f.name}</span>
                <span className="text-slate-600">{f.size}</span>
                <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                  className="text-slate-500 hover:text-red-400 transition-colors ml-0.5">
                  <X size={10} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Prompt Bar */}
      <div className="prompt-bar flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => inputRef.current?.click()}
          className="shrink-0 text-slate-500 hover:text-indigo-400 transition-colors"
          title="Attach files"
        >
          <Paperclip size={18} />
        </button>
        <input ref={inputRef} type="file" multiple className="hidden"
          onChange={(e) => {
            if (!e.target.files) return;
            const parsed = Array.from(e.target.files).map(f => ({
              name: f.name, type: getFileCategory(f),
              size: `${(f.size / 1024).toFixed(1)} KB`,
            }));
            setFiles(prev => [...prev, ...parsed].slice(0, 5));
          }}
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          rows={1}
          placeholder="Route a multimodal intent to the Head Orchestrator... (Shift+Enter newline)"
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none resize-none leading-relaxed"
          style={{ maxHeight: '120px', minHeight: '24px' }}
        />

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleSend}
          disabled={!text.trim() && files.length === 0}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-all shadow-glow-indigo disabled:shadow-none"
        >
          <Send size={15} />
        </motion.button>
      </div>

      <p className="text-center text-[10px] text-slate-700 mt-1.5 font-mono">
        LMA Multimodal Router · Drag-and-drop supported · Routed via WebSocket
      </p>
    </div>
  );
}
