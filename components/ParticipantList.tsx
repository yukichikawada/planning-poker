'use client';

import type { Room, PlayerType } from '@/lib/types';
import { ParticipantCard } from './ParticipantCard';

interface ParticipantListProps {
  room: Room;
  currentUserId: string;
  votedUsers: Set<string>;
}

const PLAYER_TYPE_LABELS: Record<PlayerType, string> = {
  android: 'Android',
  ios: 'iOS',
  qa: 'QA',
};

const PLAYER_TYPE_ORDER: PlayerType[] = ['android', 'ios', 'qa'];

export function ParticipantList({ room, currentUserId, votedUsers }: ParticipantListProps) {
  const usersByType = PLAYER_TYPE_ORDER.map((type) => ({
    type,
    label: PLAYER_TYPE_LABELS[type],
    users: room.users.filter((user) => user.playerType === type),
  })).filter((group) => group.users.length > 0);

  return (
    <div className="space-y-4">
      {usersByType.map((group) => (
        <div key={group.type} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {group.label} ({group.users.length})
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {group.users.map((user) => (
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
      ))}
    </div>
  );
}
