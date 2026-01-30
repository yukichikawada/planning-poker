'use client';

import type { Room } from '@/lib/types';
import { ParticipantCard } from './ParticipantCard';

interface ParticipantListProps {
  room: Room;
  currentUserId: string;
  votedUsers: Set<string>;
}

export function ParticipantList({ room, currentUserId, votedUsers }: ParticipantListProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Participants ({room.users.length})
      </h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {room.users.map((user) => (
          <ParticipantCard
            key={user.id}
            user={user}
            vote={room.isRevealed ? room.votes[user.id] : null}
            hasVoted={votedUsers.has(user.id)}
            isRevealed={room.isRevealed}
            isCurrentUser={user.id === currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
