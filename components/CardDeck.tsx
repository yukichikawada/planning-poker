'use client';

import { POINT_VALUES, QA_POINT_VALUES, type AllPointValues, type PlayerType } from '@/lib/types';
import { PokerCard } from './PokerCard';

interface CardDeckProps {
  selectedValue: AllPointValues | null;
  onSelect: (value: AllPointValues | null) => void;
  disabled: boolean;
  playerType: PlayerType;
}

export function CardDeck({ selectedValue, onSelect, disabled, playerType }: CardDeckProps) {
  const pointValues = playerType === 'qa' ? QA_POINT_VALUES : POINT_VALUES;

  const handleCardClick = (value: AllPointValues) => {
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
        {pointValues.map((value) => (
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
