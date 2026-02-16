
import { SignalingMessage, SignalingMessageType } from '../types';

/**
 * For this demo, we use BroadcastChannel to simulate a signaling server
 * This allows two tabs in the same browser to communicate as P2P peers.
 */
export class SignalingService {
  private channel: BroadcastChannel;
  private onMessageCallback: (msg: SignalingMessage) => void;
  public readonly myId: string;

  constructor(roomName: string, onMessage: (msg: SignalingMessage) => void) {
    this.myId = Math.random().toString(36).substring(2, 9);
    this.channel = new BroadcastChannel(`nexus_room_${roomName}`);
    this.onMessageCallback = onMessage;

    this.channel.onmessage = (event) => {
      const msg = event.data as SignalingMessage;
      // Don't process our own messages
      if (msg.senderId !== this.myId) {
        this.onMessageCallback(msg);
      }
    };
  }

  send(type: SignalingMessageType, payload?: any) {
    const msg: SignalingMessage = {
      type,
      senderId: this.myId,
      payload
    };
    this.channel.postMessage(msg);
  }

  close() {
    this.send(SignalingMessageType.LEAVE);
    this.channel.close();
  }
}
