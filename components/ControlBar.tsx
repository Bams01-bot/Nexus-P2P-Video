
import React, { useState } from 'react';
import { VideoFilter } from '../types';

interface ControlBarProps {
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onHangUp: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onApplyFilter: (filter: VideoFilter) => void;
  onMuteAll: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  isInitiator: boolean;
  currentFilter: VideoFilter;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  onToggleAudio,
  onToggleVideo,
  onHangUp,
  onToggleScreenShare,
  onToggleRecording,
  onApplyFilter,
  onMuteAll,
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isRecording,
  isInitiator,
  currentFilter
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const filters: { label: string; value: VideoFilter }[] = [
    { label: 'None', value: 'none' },
    { label: 'Grayscale', value: 'grayscale(100%)' },
    { label: 'Sepia', value: 'sepia(100%)' },
    { label: 'Invert', value: 'invert(100%)' },
    { label: 'Vibrant', value: 'hue-rotate(90deg) blur(2px)' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 shadow-2xl z-50">
      <button
        onClick={onToggleAudio}
        title="Toggle Microphone"
        className={`p-3.5 rounded-xl transition-all duration-300 ${isAudioEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
      >
        {isAudioEnabled ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
        )}
      </button>

      <button
        onClick={onToggleVideo}
        title="Toggle Camera"
        className={`p-3.5 rounded-xl transition-all duration-300 ${isVideoEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
      >
        {isVideoEnabled ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
        )}
      </button>

      <button
        onClick={onToggleScreenShare}
        title="Share Screen"
        className={`p-3.5 rounded-xl transition-all duration-300 ${isScreenSharing ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </button>

      <div className="relative">
        <button
          onClick={() => setShowFilters(!showFilters)}
          title="Video Filters"
          className={`p-3.5 rounded-xl transition-all duration-300 ${currentFilter !== 'none' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.828 2.828a2 2 0 010 2.828l-8.486 8.486L11 7.343z" /></svg>
        </button>
        {showFilters && (
          <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 min-w-[120px]">
            {filters.map(f => (
              <button
                key={f.label}
                onClick={() => { onApplyFilter(f.value); setShowFilters(false); }}
                className={`px-3 py-2 text-xs rounded-lg text-left transition-colors ${currentFilter === f.value ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onToggleRecording}
        title={isRecording ? "Stop Recording" : "Start Recording"}
        className={`p-3.5 rounded-xl transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>
      </button>

      {isInitiator && (
        <button
          onClick={onMuteAll}
          title="Mute All Participants"
          className="p-3.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </button>
      )}

      <div className="w-[1px] h-8 bg-slate-700 mx-2" />

      <button
        onClick={onHangUp}
        title="Hang Up"
        className="p-3.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-900/20"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 13a11.64 11.64 0 016.33 3.16 11.64 11.64 0 006.34-3.16M13 13V9a1 1 0 00-1-1H8a1 1 0 00-1-1v4" /></svg>
      </button>
    </div>
  );
};
