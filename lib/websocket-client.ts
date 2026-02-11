import type { ClientMessage, ServerMessage, AllPointValues, PlayerType } from './types';

type MessageHandler = (message: ServerMessage) => void;

function getWsUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}

const USER_ID_KEY = 'planning-poker-user-id';
const PLAYER_TYPE_KEY = 'planning-poker-player-type';

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

function getStoredPlayerType(): PlayerType {
  if (typeof window === 'undefined') return 'android';
  return (localStorage.getItem(PLAYER_TYPE_KEY) as PlayerType) || 'android';
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private messageHandler: MessageHandler | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private roomId: string;
  private userName: string | null = null;
  private playerType: PlayerType = 'android';
  private userId: string;
  private pendingMessages: ClientMessage[] = [];
  private isConnected = false;
  private hasJoined = false;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.userId = getOrCreateUserId();
    this.playerType = getStoredPlayerType();
  }

  connect(onMessage: MessageHandler): void {
    this.messageHandler = onMessage;
    this.ws = new WebSocket(`${getWsUrl()}?roomId=${this.roomId}`);

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
        this.send({ type: 'join', name: this.userName, userId: this.userId, playerType: this.playerType });
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

  join(name: string, playerType: PlayerType): void {
    if (this.hasJoined) return;
    this.userName = name;
    this.playerType = playerType;
    localStorage.setItem(PLAYER_TYPE_KEY, playerType);
    if (this.isConnected) {
      this.hasJoined = true;
      this.send({ type: 'join', name, userId: this.userId, playerType });
    }
    // If not connected yet, onopen will send the join
  }

  vote(value: AllPointValues | null): void {
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
