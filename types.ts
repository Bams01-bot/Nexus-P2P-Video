
export enum SignalingMessageType {
  JOIN = 'JOIN',
  OFFER = 'OFFER',
  ANSWER = 'ANSWER',
  ICE_CANDIDATE = 'ICE_CANDIDATE',
  LEAVE = 'LEAVE',
  MUTE_ALL_REQUEST = 'MUTE_ALL_REQUEST',
  P2P_CHAT = 'P2P_CHAT',
  FILE_SHARE = 'FILE_SHARE'
}

export interface SignalingMessage {
  type: SignalingMessageType;
  senderId: string;
  payload?: any;
}

export interface PeerState {
  id: string;
  stream: MediaStream | null;
  isLocal: boolean;
  name: string;
  isConnected: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
}

export interface SharedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // Base64
  sender: string;
  timestamp: number;
}

export type VideoFilter = 'none' | 'grayscale(100%)' | 'sepia(100%)' | 'invert(100%)' | 'hue-rotate(90deg) blur(2px)';
