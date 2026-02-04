import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager } from './room-manager';
import type { ClientMessage } from '../lib/types';

const PORT = parseInt(process.env.PORT || '3001', 10);
const roomManager = new RoomManager();

const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on('connection', (ws: WebSocket, req) => {
  const url = new URL(req.url || '', `http://localhost:${PORT}`);
  const roomId = url.searchParams.get('roomId');

  if (!roomId) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room ID required' }));
    ws.close();
    return;
  }

  let hasJoined = false;

  ws.on('message', (data) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      if (message.type === 'join' && !hasJoined) {
        roomManager.joinRoom(roomId, ws, message.userId, message.name, message.playerType);
        hasJoined = true;
      } else if (hasJoined) {
        roomManager.handleMessage(ws, message);
      }
    } catch (err) {
      console.error('Failed to parse message:', err);
    }
  });

  ws.on('close', () => {
    roomManager.handleDisconnect(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});
