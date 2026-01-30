import type { ClientMessage, ServerMessage, PointValue } from './types';
import { WS_URL } from './constants';

type MessageHandler = (message: ServerMessage) => void;

const USER_ID_KEY = 'planning-poker-user-id';

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private messageHandler: MessageHandler | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private roomId: string;
  private userName: string | null = null;
  private userId: string;
  private pendingMessages: ClientMessage[] = [];
  private isConnected = false;
  private hasJoined = false;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.userId = getOrCreateUserId();
  }

  connect(onMessage: MessageHandler): void {
    this.messageHandler = onMessage;
    this.ws = new WebSocket(`${WS_URL}?roomId=${this.roomId}`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.isConnected = true;

      // Send any pending messages
      for (const msg of this.pendingMessages) {
        this.send(msg);
      }
      this.pendingMessages = [];

      // If we have a username and haven't joined yet, send join
      if (this.userName && !this.hasJoined) {
        this.hasJoined = true;
        this.send({ type: 'join', name: this.userName, userId: this.userId });
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        this.messageHandler?.(message);
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(onMessage), 1000 * this.reconnectAttempts);
      }
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }

  join(name: string): void {
    if (this.hasJoined) return;
    this.userName = name;
    if (this.isConnected) {
      this.hasJoined = true;
      this.send({ type: 'join', name, userId: this.userId });
    }
    // If not connected yet, onopen will send the join
  }

  vote(value: PointValue | null): void {
    this.send({ type: 'vote', value });
  }

  reveal(): void {
    this.send({ type: 'reveal' });
  }

  reset(): void {
    this.send({ type: 'reset' });
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.isConnected = false;
  }

  private send(message: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.pendingMessages.push(message);
    }
  }
}
