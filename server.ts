import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager } from './server/room-manager';
import type { ClientMessage } from './lib/types';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const roomManager = new RoomManager();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url || '', `http://localhost:${port}`);
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

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server running on ws://${hostname}:${port}/ws`);
  });
});
