
import React, { useState, useRef } from 'react';
import { ChatMessage, SharedFile } from '../types';

interface SidebarLeftProps {
  roomName: string;
  secretCode: string;
  localId: string;
  remoteId: string | null;
  isConnected: boolean;
  chatMessages: ChatMessage[];
  files: SharedFile[];
  onSendMessage: (text: string) => void;
  onFileUpload: (file: File) => void;
  onOpenInfo: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  roomName,
  secretCode,
  localId,
  remoteId,
  isConnected,
  chatMessages,
  files,
  onSendMessage,
  onFileUpload,
  onOpenInfo
}) => {
  const [chatInput, setChatInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  const downloadFile = (file: SharedFile) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    link.click();
  };

  return (
    <div className="w-80 flex flex-col bg-slate-900/80 backdrop-blur-xl border-r border-white/10 h-full overflow-hidden">
      {/* 1. Room Info */}
      <section className="p-4 border-b border-white/5 bg-slate-800/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">📡 Session Info</h3>
          <button 
            onClick={onOpenInfo}
            className="text-[10px] text-indigo-400 hover:underline font-bold"
          >
            Partager ↗️
          </button>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase">Room ID</span>
              <span className="text-[10px] text-white font-mono">{roomName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase">Secret</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest">{secretCode}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium truncate w-32">Vous ({localId})</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Host</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-white/5">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-blue-500' : 'bg-slate-600'}`} />
              <span className="text-xs font-medium truncate w-32">
                {remoteId ? `Participant (${remoteId})` : 'En attente...'}
              </span>
            </div>
            <span className={`text-[10px] font-bold ${isConnected ? 'text-blue-400' : 'text-slate-500'}`}>
              {isConnected ? 'Connecté' : 'Hors-ligne'}
            </span>
          </div>
        </div>
      </section>

      {/* 2. P2P Chat */}
      <section className="flex-1 flex flex-col overflow-hidden min-h-0 border-b border-white/5">
        <h3 className="p-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">💬 Chat Direct</h3>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {chatMessages.length === 0 && (
            <div className="text-center py-4 text-slate-600 italic text-xs">Pas de messages</div>
          )}
          {chatMessages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === localId ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs ${
                msg.sender === localId ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 border border-white/5'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-slate-950/20">
          <div className="relative">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (onSendMessage(chatInput), setChatInput(''))}
              placeholder="Message..." 
              className="w-full bg-slate-800 border border-white/5 rounded-lg py-2 pl-3 pr-10 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            <button onClick={() => {onSendMessage(chatInput); setChatInput('');}} className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400">
              🚀
            </button>
          </div>
        </div>
      </section>

      {/* 3. File Hub */}
      <section className="h-1/3 flex flex-col overflow-hidden min-h-0 bg-slate-950/10">
        <div className="p-4 pb-2 flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">📂 Partage Fichiers</h3>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] bg-indigo-500 hover:bg-indigo-400 text-white px-2 py-1 rounded transition-colors"
          >
            📤
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800 border border-white/5 group">
              <div className="text-xl">📄</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate text-slate-200">{file.name}</p>
                <p className="text-[10px] text-slate-500">{formatSize(file.size)}</p>
              </div>
              <button 
                onClick={() => downloadFile(file)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-indigo-500/20 text-indigo-400 transition-all"
              >
                📥
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
