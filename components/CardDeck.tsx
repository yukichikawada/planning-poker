'use client';

import { POINT_VALUES, type PointValue } from '@/lib/types';
import { PokerCard } from './PokerCard';

interface CardDeckProps {
  selectedValue: PointValue | null;
  onSelect: (value: PointValue | null) => void;
  disabled: boolean;
}

export function CardDeck({ selectedValue, onSelect, disabled }: CardDeckProps) {
  const handleCardClick = (value: PointValue) => {
    if (selectedValue === value) {
      onSelect(null);
    } else {
      onSelect(value);
    }
  };

  return (
    <div className="bg-gray-100 rounded-xl p-4 sm:p-6">
      <p className="text-center text-gray-600 mb-4 font-medium">
        {disabled ? 'Voting closed' : 'Select your estimate'}
      </p>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {POINT_VALUES.map((value) => (
          <PokerCard
            key={value}
            value={value}
            selected={selectedValue === value}
            disabled={disabled}
            onClick={() => handleCardClick(value)}
          />
        ))}
      </div>
    </div>
  );
}
