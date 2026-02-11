'use client';

interface RoomControlsProps {
  isRevealed: boolean;
  onReveal: () => void;
  onReset: () => void;
}

export function RoomControls({ isRevealed, onReveal, onReset }: RoomControlsProps) {
  return (
    <div className="flex justify-center gap-4">
      {!isRevealed ? (
        <button
          onClick={onReveal}
          className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          Reveal Votes
        </button>
      ) : (
        <button
          onClick={onReset}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          New Round
        </button>
      )}
    </div>
  );
}
