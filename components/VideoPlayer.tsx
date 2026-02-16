
import React, { useEffect, useRef } from 'react';
import { VideoFilter } from '../types';

interface VideoPlayerProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  name: string;
  muted?: boolean;
  filter?: VideoFilter;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, isLocal, name, muted, filter = 'none' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl transition-all duration-300 hover:scale-[1.01] flex items-center justify-center aspect-video">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted || isLocal}
          style={{ filter: isLocal ? filter : 'none' }}
          className={`w-full h-full object-cover rounded-xl transition-all duration-500 ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-sm font-medium">Waiting for video...</span>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-xs font-semibold border border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          {name} {isLocal && '(You)'}
        </div>
        <div className="flex gap-2">
            {!stream?.getVideoTracks()[0]?.enabled && (
               <div className="p-1.5 rounded-full bg-red-500/80 backdrop-blur-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
               </div>
            )}
             {!stream?.getAudioTracks()[0]?.enabled && (
               <div className="p-1.5 rounded-full bg-red-500/80 backdrop-blur-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
               </div>
            )}
        </div>
      </div>
    </div>
  );
};
