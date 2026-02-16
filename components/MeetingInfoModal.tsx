
import React from 'react';

interface MeetingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  secretCode: string;
  shareUrl: string;
}

export const MeetingInfoModal: React.FC<MeetingInfoModalProps> = ({
  isOpen,
  onClose,
  meetingId,
  secretCode,
  shareUrl
}) => {
  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copié ! ✅`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900/90 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span>ℹ️</span> Infos de la réunion
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Section Lien */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lien d'invitation</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 truncate font-mono">
                {shareUrl}
              </div>
              <button 
                onClick={() => copyToClipboard(shareUrl, "Lien")}
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                📋
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Section ID */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID de réunion</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white font-mono text-center">
                  {meetingId}
                </div>
                <button 
                  onClick={() => copyToClipboard(meetingId, "ID")}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3 rounded-xl border border-white/5"
                >
                  📄
                </button>
              </div>
            </div>

            {/* Section Code Secret */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Code Secret</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-emerald-400 font-mono text-center font-bold">
                  {secretCode}
                </div>
                <button 
                  onClick={() => copyToClipboard(secretCode, "Code")}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3 rounded-xl border border-white/5"
                >
                  🔐
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
            <p className="text-xs text-indigo-300 leading-relaxed italic">
              💡 Partagez ces informations avec vos collaborateurs pour qu'ils puissent rejoindre la session manuellement.
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-white/5"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
