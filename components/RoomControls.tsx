'use client';

interface RoomControlsProps {
  isHost: boolean;
  isRevealed: boolean;
  onReveal: () => void;
  onReset: () => void;
}

export function RoomControls({ isHost, isRevealed, onReveal, onReset }: RoomControlsProps) {
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
        isHost ? (
          <button
            onClick={onReset}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            New Round
          </button>
        ) : (
          <p className="text-center text-gray-500 italic">
            Waiting for host to start a new round...
          </p>
        )
      )}
    </div>
  );
}
