import type { ClientMessage, ServerMessage, PointValue } from './types';
import { WS_URL } from './constants';

type MessageHandler = (message: ServerMessage) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private messageHandler: MessageHandler | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private roomId: string;
  private userName: string | null = null;
  private pendingMessages: ClientMessage[] = [];
  private isConnected = false;

  constructor(roomId: string) {
    this.roomId = roomId;
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

      // If we have a username, send join
      if (this.userName) {
        this.send({ type: 'join', name: this.userName });
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
    this.userName = name;
    if (this.isConnected) {
      this.send({ type: 'join', name });
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
