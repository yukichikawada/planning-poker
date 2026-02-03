'use client';

import { useState, FormEvent } from 'react';
import type { PlayerType } from '@/lib/types';

interface NameDialogProps {
  onSubmit: (name: string, playerType: PlayerType) => void;
}

const PLAYER_TYPE_OPTIONS: { value: PlayerType; label: string; color: string }[] = [
  { value: 'android', label: 'Android', color: 'text-green-600' },
  { value: 'ios', label: 'iOS', color: 'text-blue-600' },
  { value: 'qa', label: 'QA', color: 'text-orange-600' },
];

export function NameDialog({ onSubmit }: NameDialogProps) {
  const [name, setName] = useState('');
  const [playerType, setPlayerType] = useState<PlayerType>('android');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      onSubmit(trimmedName, playerType);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Room</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
            autoFocus
            maxLength={30}
          />

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Player Type</p>
            <div className="flex gap-4">
              {PLAYER_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border-2 transition-colors ${
                    playerType === option.value
                      ? 'border-gray-400 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="playerType"
                    value={option.value}
                    checked={playerType === option.value}
                    onChange={() => setPlayerType(option.value)}
                    className="sr-only"
                  />
                  <span className={`font-medium ${option.color}`}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}
