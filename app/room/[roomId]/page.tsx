'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { WebSocketClient } from '@/lib/websocket-client';
import type { Room, AllPointValues, ServerMessage, PlayerType } from '@/lib/types';
import { NameDialog } from '@/components/NameDialog';
import { CardDeck } from '@/components/CardDeck';
import { ParticipantList } from '@/components/ParticipantList';
import { VoteChart } from '@/components/VoteChart';
import { RoomControls } from '@/components/RoomControls';

const STORAGE_KEY = 'planning-poker-name';
const PLAYER_TYPE_KEY = 'planning-poker-player-type';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [client, setClient] = useState<WebSocketClient | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedVote, setSelectedVote] = useState<AllPointValues | null>(null);
  const [votedUsers, setVotedUsers] = useState<Set<string>>(new Set());
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case 'room-state':
        setRoom(message.room);
        setUserId(message.userId);
        setIsConnecting(false);
        const initialVoted = new Set<string>();
        for (const [uid, vote] of Object.entries(message.room.votes)) {
          if (vote !== null) {
            initialVoted.add(uid);
          }
        }
        setVotedUsers(initialVoted);
        break;

      case 'user-joined':
        setRoom((prev) => prev ? {
          ...prev,
          users: [...prev.users, message.user],
          votes: { ...prev.votes, [message.user.id]: null },
        } : null);
        break;

      case 'user-left':
        setRoom((prev) => {
          if (!prev) return null;
          const newUsers = prev.users.filter((u) => u.id !== message.userId);
          const newVotes = { ...prev.votes };
          delete newVotes[message.userId];
          const newHostId = newUsers.find((u) => u.isHost)?.id || newUsers[0]?.id || prev.hostId;
          return {
            ...prev,
            users: newUsers.map((u) => ({ ...u, isHost: u.id === newHostId })),
            votes: newVotes,
            hostId: newHostId,
          };
        });
        setVotedUsers((prev) => {
          const next = new Set(prev);
          next.delete(message.userId);
          return next;
        });
        break;

      case 'vote-cast':
        setVotedUsers((prev) => {
          const next = new Set(prev);
          if (message.hasVoted) {
            next.add(message.userId);
          } else {
            next.delete(message.userId);
          }
          return next;
        });
        break;

      case 'revealed':
        setRoom((prev) => prev ? { ...prev, isRevealed: true, votes: message.votes } : null);
        break;

      case 'reset':
        setRoom((prev) => prev ? { ...prev, isRevealed: false, votes: Object.fromEntries(prev.users.map((u) => [u.id, null])) } : null);
        setSelectedVote(null);
        setVotedUsers(new Set());
        break;

      case 'error':
        console.error('Server error:', message.message);
        break;
    }
  }, []);

  useEffect(() => {
    const savedName = localStorage.getItem(STORAGE_KEY);
    const savedPlayerType = (localStorage.getItem(PLAYER_TYPE_KEY) as PlayerType) || 'android';
    const wsClient = new WebSocketClient(roomId);
    setClient(wsClient);

    wsClient.connect(handleMessage);

    if (savedName) {
      wsClient.join(savedName, savedPlayerType);
    } else {
      setShowNameDialog(true);
      setIsConnecting(false);
    }

    return () => {
      wsClient.disconnect();
    };
  }, [roomId, handleMessage]);

  const handleNameSubmit = (name: string, playerType: PlayerType) => {
    localStorage.setItem(STORAGE_KEY, name);
    localStorage.setItem(PLAYER_TYPE_KEY, playerType);
    setShowNameDialog(false);
    setIsConnecting(true);
    client?.join(name, playerType);
  };

  const handleVoteSelect = (value: AllPointValues | null) => {
    setSelectedVote(value);
    client?.vote(value);
  };

  const handleReveal = () => {
    client?.reveal();
  };

  const handleReset = () => {
    client?.reset();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showNameDialog) {
    return <NameDialog onSubmit={handleNameSubmit} />;
  }

  if (isConnecting || !room) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Connecting to room...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Planning Poker</h1>
            <p className="text-gray-500">
              Room: <span className="font-mono font-semibold">{roomId}</span>
            </p>
          </div>
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              copied
                ? 'bg-green-600 text-white border border-green-600'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </header>

        <CardDeck
          selectedValue={selectedVote}
          onSelect={handleVoteSelect}
          disabled={room.isRevealed}
          playerType={room.users.find(u => u.id === userId)?.playerType || 'android'}
        />

        <ParticipantList room={room} currentUserId={userId!} votedUsers={votedUsers} />

        {room.isRevealed && <VoteChart votes={room.votes} users={room.users} />}

        <RoomControls
          isRevealed={room.isRevealed}
          onReveal={handleReveal}
          onReset={handleReset}
        />
      </div>
    </main>
  );
}
