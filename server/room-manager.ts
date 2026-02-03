import { WebSocket } from 'ws';
import type { Room, User, AllPointValues, ServerMessage, ClientMessage, PlayerType } from '../lib/types';

interface Connection {
  roomId: string;
  userId: string;
}

export class RoomManager {
  private rooms = new Map<string, Room>();
  private connections = new Map<WebSocket, Connection>();

  createRoom(roomId: string): Room {
    const room: Room = {
      id: roomId,
      users: [],
      votes: {},
      isRevealed: false,
      hostId: '',
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId: string, ws: WebSocket, userId: string, name: string, playerType: PlayerType): void {
    // Prevent duplicate joins from the same connection
    if (this.connections.has(ws)) {
      return;
    }

    let room = this.rooms.get(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }

    // Check if user is already in the room (reconnection)
    const existingUser = room.users.find((u) => u.id === userId);
    if (existingUser) {
      // Remove old connection mapping for this user (but don't close the WebSocket - let it close naturally)
      this.connections.forEach((conn, oldWs) => {
        if (conn.roomId === roomId && conn.userId === userId) {
          this.connections.delete(oldWs);
        }
      });
      // Update connection mapping
      this.connections.set(ws, { roomId, userId });
      // Update name and playerType if changed
      existingUser.name = name;
      existingUser.playerType = playerType;
      // Send current room state
      this.send(ws, {
        type: 'room-state',
        room: this.getSanitizedRoom(room),
        userId,
      });
      return;
    }

    const isHost = room.users.length === 0;
    const user: User = { id: userId, name, isHost, playerType };

    if (isHost) {
      room.hostId = userId;
    }

    room.users.push(user);
    room.votes[userId] = null;
    this.connections.set(ws, { roomId, userId });

    // Send room state to joining user
    this.send(ws, {
      type: 'room-state',
      room: this.getSanitizedRoom(room),
      userId,
    });

    // Broadcast user joined to others
    this.broadcastToRoom(roomId, { type: 'user-joined', user }, ws);
  }

  handleVote(ws: WebSocket, value: AllPointValues | null): void {
    const conn = this.connections.get(ws);
    if (!conn) return;

    const room = this.rooms.get(conn.roomId);
    if (!room || room.isRevealed) return;

    room.votes[conn.userId] = value;

    this.broadcastToRoom(conn.roomId, {
      type: 'vote-cast',
      userId: conn.userId,
      hasVoted: value !== null,
    });
  }

  handleReveal(ws: WebSocket): void {
    const conn = this.connections.get(ws);
    if (!conn) return;

    const room = this.rooms.get(conn.roomId);
    if (!room) return;

    room.isRevealed = true;
    this.broadcastToRoom(conn.roomId, {
      type: 'revealed',
      votes: room.votes,
    });
  }

  handleReset(ws: WebSocket): void {
    const conn = this.connections.get(ws);
    if (!conn) return;

    const room = this.rooms.get(conn.roomId);
    if (!room) return;

    // Only host can reset
    if (room.hostId !== conn.userId) {
      this.send(ws, { type: 'error', message: 'Only the host can reset' });
      return;
    }

    room.isRevealed = false;
    for (const userId of Object.keys(room.votes)) {
      room.votes[userId] = null;
    }

    this.broadcastToRoom(conn.roomId, { type: 'reset' });
  }

  handleDisconnect(ws: WebSocket): void {
    const conn = this.connections.get(ws);
    if (!conn) return;

    // Remove this connection from the map first
    this.connections.delete(ws);

    // Check if user has another active connection (reconnection scenario)
    let hasOtherConnection = false;
    this.connections.forEach((otherConn) => {
      if (otherConn.roomId === conn.roomId && otherConn.userId === conn.userId) {
        hasOtherConnection = true;
      }
    });

    if (hasOtherConnection) {
      return;
    }

    const room = this.rooms.get(conn.roomId);
    if (room) {
      room.users = room.users.filter((u) => u.id !== conn.userId);
      delete room.votes[conn.userId];

      if (room.users.length === 0) {
        this.rooms.delete(conn.roomId);
      } else {
        // Reassign host if needed
        if (room.hostId === conn.userId) {
          room.hostId = room.users[0].id;
          room.users[0].isHost = true;
        }
        this.broadcastToRoom(conn.roomId, { type: 'user-left', userId: conn.userId });
      }
    }
  }

  handleMessage(ws: WebSocket, message: ClientMessage): void {
    switch (message.type) {
      case 'vote':
        this.handleVote(ws, message.value);
        break;
      case 'reveal':
        this.handleReveal(ws);
        break;
      case 'reset':
        this.handleReset(ws);
        break;
    }
  }

  private getSanitizedRoom(room: Room): Room {
    if (room.isRevealed) {
      return room;
    }
    // Hide vote values, only show who has voted
    const sanitizedVotes: Record<string, AllPointValues | null> = {};
    for (const [userId, vote] of Object.entries(room.votes)) {
      sanitizedVotes[userId] = vote !== null ? (0 as AllPointValues) : null;
    }
    return { ...room, votes: sanitizedVotes };
  }

  private send(ws: WebSocket, message: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcastToRoom(roomId: string, message: ServerMessage, exclude?: WebSocket): void {
    this.connections.forEach((conn, ws) => {
      if (conn.roomId === roomId && ws !== exclude) {
        this.send(ws, message);
      }
    });
  }
}
