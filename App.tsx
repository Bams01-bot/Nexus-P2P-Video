
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SignalingService } from './services/signaling';
import { VideoPlayer } from './components/VideoPlayer';
import { ControlBar } from './components/ControlBar';
import { AssistantPanel } from './components/AssistantPanel';
import { SidebarLeft } from './components/SidebarLeft';
import { MeetingInfoModal } from './components/MeetingInfoModal';
import { SignalingMessageType, ChatMessage, SharedFile, VideoFilter } from './types';
import { getGeminiAssistantResponse } from './services/geminiService';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const App: React.FC = () => {
  // UI State
  const [showAiAssistant, setShowAiAssistant] = useState(true);
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [activeFilter, setActiveFilter] = useState<VideoFilter>('none');
  
  // Meeting Identifiers
  const [roomName, setRoomName] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [joinId, setJoinId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  
  // Media State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Data State
  const [p2pChatMessages, setP2pChatMessages] = useState<ChatMessage[]>([]);
  const [aiChatMessages, setAiChatMessages] = useState<ChatMessage[]>([]);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Refs
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const signaling = useRef<SignalingService | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Initialize Media
  const initMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      cameraStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error("Media Error:", err);
      alert("Accès refusé aux périphériques média.");
      return null;
    }
  }, []);

  const createPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pc.onicecandidate = (e) => e.candidate && signaling.current?.send(SignalingMessageType.ICE_CANDIDATE, e.candidate.toJSON());
    pc.ontrack = (e) => e.streams?.[0] && setRemoteStream(e.streams[0]);
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    peerConnection.current = pc;
    return pc;
  }, []);

  const handleSignalingMessage = async (msg: any, stream: MediaStream) => {
    const pc = peerConnection.current || createPeerConnection(stream);
    setRemotePeerId(msg.senderId);

    switch (msg.type) {
      case SignalingMessageType.OFFER:
        // Validation du code secret lors de l'offre
        if (msg.payload.secretCode !== secretCode && secretCode !== "") {
            console.warn("Tentative de connexion avec un code secret invalide.");
            return;
        }
        setInCall(true);
        setIsInitiator(false);
        await pc.setRemoteDescription(new RTCSessionDescription(msg.payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        signaling.current?.send(SignalingMessageType.ANSWER, { type: answer.type, sdp: answer.sdp });
        break;
      case SignalingMessageType.ANSWER:
        await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
        break;
      case SignalingMessageType.ICE_CANDIDATE:
        msg.payload && await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
        break;
      case SignalingMessageType.P2P_CHAT:
        setP2pChatMessages(prev => [...prev, msg.payload]);
        break;
      case SignalingMessageType.FILE_SHARE:
        setSharedFiles(prev => [...prev, msg.payload]);
        break;
      case SignalingMessageType.MUTE_ALL_REQUEST:
        localStream?.getAudioTracks().forEach(t => t.enabled = false);
        setIsAudioEnabled(false);
        break;
      case SignalingMessageType.LEAVE:
        setRemoteStream(null);
        setRemotePeerId(null);
        break;
    }
  };

  const startCall = async () => {
    const stream = await initMedia();
    if (!stream) return;

    // Génération IDs
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newSecretCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    setRoomName(newRoomId);
    setSecretCode(newSecretCode);
    setInCall(true);
    setIsInitiator(true);
    
    const pc = createPeerConnection(stream);
    signaling.current = new SignalingService(newRoomId, msg => handleSignalingMessage(msg, stream));
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    // On envoie le secretCode dans le payload de l'offre pour que le recepteur puisse valider
    signaling.current.send(SignalingMessageType.OFFER, { 
      secretCode: newSecretCode, 
      sdp: { type: offer.type, sdp: offer.sdp } 
    });
  };

  const joinCall = async () => {
    if (!joinId || !joinCode) {
        alert("Veuillez saisir l'ID et le Code Secret.");
        return;
    }
    const stream = await initMedia();
    if (!stream) return;

    setRoomName(joinId.toUpperCase());
    setSecretCode(joinCode);
    setInCall(true);
    setIsInitiator(false);

    createPeerConnection(stream);
    signaling.current = new SignalingService(joinId.toUpperCase(), msg => handleSignalingMessage(msg, stream));
    // Le joiner attend l'OFFER de l'initiateur
  };

  const sendP2pMessage = (text: string) => {
    if (!text.trim()) return;
    const msg: ChatMessage = { id: Date.now().toString(), sender: signaling.current?.myId || 'Me', text, timestamp: Date.now() };
    setP2pChatMessages(prev => [...prev, msg]);
    signaling.current?.send(SignalingMessageType.P2P_CHAT, msg);
  };

  const sendAiMessage = async (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'You', text, timestamp: Date.now() };
    setAiChatMessages(prev => [...prev, userMsg]);
    setIsAiProcessing(true);
    const aiText = await getGeminiAssistantResponse(text, aiChatMessages.slice(-3).map(m => m.text).join('\n'));
    setIsAiProcessing(false);
    setAiChatMessages(prev => [...prev, { id: (Date.now()+1).toString(), sender: 'Nexus AI', text: aiText, timestamp: Date.now(), isAi: true }]);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const payload: SharedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        data: e.target?.result as string,
        sender: signaling.current?.myId || 'Me',
        timestamp: Date.now()
      };
      setSharedFiles(prev => [...prev, payload]);
      signaling.current?.send(SignalingMessageType.FILE_SHARE, payload);
    };
    reader.readAsDataURL(file);
  };

  const hangUp = () => {
    localStream?.getTracks().forEach(t => t.stop());
    peerConnection.current?.close();
    signaling.current?.close();
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden text-slate-100 selection:bg-indigo-500/30">
      {/* Modal Infos */}
      <MeetingInfoModal 
        isOpen={showMeetingInfo}
        onClose={() => setShowMeetingInfo(false)}
        meetingId={roomName}
        secretCode={secretCode}
        shareUrl={window.location.href}
      />

      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <span className="text-xl">🛰️</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight">NEXUS <span className="font-light opacity-50">PRO</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
          {inCall && (
            <>
              <button 
                onClick={() => setShowMeetingInfo(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-medium"
              >
                👤 Participants & Infos
              </button>
              <div className="w-[1px] h-6 bg-white/10 mx-1" />
            </>
          )}
          <button 
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${showAiAssistant ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/5'}`}
          >
            {showAiAssistant ? '✨ IA Active' : '✨ Assistant IA'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        {inCall && (
          <SidebarLeft 
            roomName={roomName}
            secretCode={secretCode}
            localId={signaling.current?.myId || 'Moi'}
            remoteId={remotePeerId}
            isConnected={!!remoteStream}
            chatMessages={p2pChatMessages}
            files={sharedFiles}
            onSendMessage={sendP2pMessage}
            onFileUpload={handleFileUpload}
            onOpenInfo={() => setShowMeetingInfo(true)}
          />
        )}

        {/* Video Area */}
        <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-6">
          {!inCall ? (
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center animate-in fade-in duration-700">
              <div className="space-y-6">
                <h2 className="text-5xl font-extrabold text-white leading-tight">Visioconférence <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">P2P Sécurisée.</span></h2>
                <p className="text-slate-400 text-lg leading-relaxed">Rejoignez des sessions privées sans serveur central, avec assistant IA intégré et partage de fichiers chiffré.</p>
                
                <div className="flex items-center gap-4 text-slate-500 text-sm">
                   <span className="flex items-center gap-1">🛡️ E2EE</span>
                   <span className="flex items-center gap-1">🚀 Ultra-low latency</span>
                   <span className="flex items-center gap-1">✨ Gemini AI</span>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
                <button 
                  onClick={startCall}
                  className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  ➕ Créer une réunion
                </button>

                <div className="relative">
                   <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                   <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">Ou rejoindre via ID</span></div>
                </div>

                <div className="space-y-3">
                   <input 
                    type="text" 
                    placeholder="ID de réunion (ex: AB1234)" 
                    value={joinId}
                    onChange={e => setJoinId(e.target.value)}
                    className="w-full bg-slate-800 border border-white/5 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono"
                   />
                   <input 
                    type="password" 
                    placeholder="Code Secret" 
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value)}
                    className="w-full bg-slate-800 border border-white/5 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                   />
                   <button 
                    onClick={joinCall}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold border border-white/5 transition-all"
                   >
                    Rejoindre la réunion
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`grid w-full h-full gap-6 ${remoteStream ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <VideoPlayer 
                stream={localStream} 
                isLocal 
                name="Vous" 
                filter={activeFilter}
              />
              {remoteStream && <VideoPlayer stream={remoteStream} name="Collaborateur" />}
            </div>
          )}

          {inCall && (
            <ControlBar 
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              isScreenSharing={isScreenSharing}
              isRecording={isRecording}
              isInitiator={isInitiator}
              currentFilter={activeFilter}
              onToggleAudio={() => {
                if (localStream) {
                  const track = localStream.getAudioTracks()[0];
                  track.enabled = !track.enabled;
                  setIsAudioEnabled(track.enabled);
                }
              }}
              onToggleVideo={() => {
                if (localStream) {
                  const track = localStream.getVideoTracks()[0];
                  track.enabled = !track.enabled;
                  setIsVideoEnabled(track.enabled);
                }
              }}
              onToggleScreenShare={async () => {
                if (!isScreenSharing) {
                  const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
                  const track = screen.getVideoTracks()[0];
                  peerConnection.current?.getSenders().find(s => s.track?.kind === 'video')?.replaceTrack(track);
                  setLocalStream(screen);
                  setIsScreenSharing(true);
                  track.onended = () => {
                    peerConnection.current?.getSenders().find(s => s.track?.kind === 'video')?.replaceTrack(cameraStreamRef.current!.getVideoTracks()[0]);
                    setLocalStream(cameraStreamRef.current);
                    setIsScreenSharing(false);
                  };
                }
              }}
              onToggleRecording={() => setIsRecording(!isRecording)}
              onApplyFilter={setActiveFilter}
              onMuteAll={() => signaling.current?.send(SignalingMessageType.MUTE_ALL_REQUEST)}
              onHangUp={hangUp}
            />
          )}
        </div>

        {/* Right Assistant Panel */}
        <div className={`transition-all duration-500 ease-in-out ${showAiAssistant ? 'w-[384px]' : 'w-0'}`}>
          <AssistantPanel 
            messages={aiChatMessages} 
            onSendMessage={sendAiMessage}
            isProcessing={isAiProcessing}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
