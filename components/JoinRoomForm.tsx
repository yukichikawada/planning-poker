'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function JoinRoomForm() {
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (code) {
      router.push(`/room/${code}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        placeholder="Enter room code"
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg uppercase"
        maxLength={10}
      />
      <button
        type="submit"
        disabled={!roomCode.trim()}
        className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Join
      </button>
    </form>
  );
}
