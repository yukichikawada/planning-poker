'use client';

import type { User, PointValue } from '@/lib/types';

interface ParticipantCardProps {
  user: User;
  vote: PointValue | null;
  hasVoted: boolean;
  isRevealed: boolean;
  isCurrentUser: boolean;
}

export function ParticipantCard({ user, vote, hasVoted, isRevealed, isCurrentUser }: ParticipantCardProps) {
  return (
    <div className={`flex flex-col items-center ${isCurrentUser ? 'order-first' : ''}`}>
      <div
        className={`
          w-16 h-24 sm:w-20 sm:h-28 rounded-xl flex items-center justify-center
          text-2xl sm:text-3xl font-bold transition-all duration-500
          ${isRevealed && vote !== null
            ? 'bg-white border-2 border-blue-500 text-blue-600'
            : hasVoted
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 border-2 border-dashed border-gray-400 text-gray-400'
          }
        `}
      >
        {isRevealed ? (vote ?? '-') : hasVoted ? '✓' : '?'}
      </div>
      <div className="mt-2 text-center">
        <p className={`text-sm font-medium truncate max-w-20 ${isCurrentUser ? 'text-blue-600' : 'text-gray-700'}`}>
          {user.name}
          {isCurrentUser && ' (you)'}
        </p>
        {user.isHost && (
          <span className="text-xs text-amber-600 font-medium">Host</span>
        )}
      </div>
    </div>
  );
}
