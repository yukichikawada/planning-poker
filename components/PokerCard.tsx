'use client';

import type { AllPointValues } from '@/lib/types';

interface PokerCardProps {
  value: AllPointValues;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function PokerCard({ value, selected, disabled, onClick }: PokerCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-16 h-12 sm:w-20 sm:h-14 rounded-lg font-bold text-lg sm:text-xl
        border-2 transition-all duration-200
        ${selected
          ? 'bg-blue-600 text-white border-blue-700 scale-110 shadow-lg'
          : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {value}
    </button>
  );
}
