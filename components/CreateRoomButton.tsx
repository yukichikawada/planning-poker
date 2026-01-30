'use client';

import { useRouter } from 'next/navigation';
import { customAlphabet } from 'nanoid';

const generateRoomId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export function CreateRoomButton() {
  const router = useRouter();

  const handleCreate = () => {
    const roomId = generateRoomId();
    router.push(`/room/${roomId}`);
  };

  return (
    <button
      onClick={handleCreate}
      className="w-full px-6 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-md"
    >
      Start New Game
    </button>
  );
}
