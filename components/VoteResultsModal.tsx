'use client';

import { VoteChart } from './VoteChart';
import type { AllPointValues, User } from '@/lib/types';

interface VoteResultsModalProps {
  votes: Record<string, AllPointValues | null>;
  users: User[];
  onNewRound: () => void;
}

export function VoteResultsModal({ votes, users, onNewRound }: VoteResultsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <VoteChart votes={votes} users={users} />

          <div className="mt-6 flex justify-center">
            <button
              onClick={onNewRound}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              New Round
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
