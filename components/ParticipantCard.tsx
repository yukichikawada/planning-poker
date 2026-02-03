'use client';

import type { User, AllPointValues } from '@/lib/types';

interface ParticipantCardProps {
  user: User;
  vote: AllPointValues | null;
  hasVoted: boolean;
  isRevealed: boolean;
  isCurrentUser: boolean;
}

const PLAYER_TYPE_STYLES = {
  android: {
    border: 'border-green-500',
    text: 'text-green-600',
    bg: 'bg-green-600',
    label: 'Android',
  },
  ios: {
    border: 'border-blue-500',
    text: 'text-blue-600',
    bg: 'bg-blue-600',
    label: 'iOS',
  },
  qa: {
    border: 'border-orange-500',
    text: 'text-orange-600',
    bg: 'bg-orange-600',
    label: 'QA',
  },
};

export function ParticipantCard({ user, vote, hasVoted, isRevealed, isCurrentUser }: ParticipantCardProps) {
  const typeStyle = PLAYER_TYPE_STYLES[user.playerType];

  return (
    <div className={`flex flex-col items-center ${isCurrentUser ? 'order-first' : ''}`}>
      <div
        className={`
          w-16 h-24 sm:w-20 sm:h-28 rounded-xl flex items-center justify-center
          text-2xl sm:text-3xl font-bold transition-all duration-500
          ${isRevealed && vote !== null
            ? `bg-white border-2 ${typeStyle.border} ${typeStyle.text}`
            : hasVoted
              ? `${typeStyle.bg} text-white`
              : 'bg-gray-200 border-2 border-dashed border-gray-400 text-gray-400'
          }
        `}
      >
        {isRevealed ? (vote ?? '-') : hasVoted ? '✓' : '?'}
      </div>
      <div className="mt-2 text-center">
        <p className={`text-sm font-medium truncate max-w-20 ${isCurrentUser ? typeStyle.text : 'text-gray-700'}`}>
          {user.name}
          {isCurrentUser && ' (you)'}
        </p>
        <span className={`text-xs font-medium ${typeStyle.text}`}>{typeStyle.label}</span>
        {user.isHost && (
          <span className="text-xs text-amber-600 font-medium ml-1">· Host</span>
        )}
      </div>
    </div>
  );
}
