'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { POINT_VALUES, QA_POINT_VALUES, type AllPointValues, type User } from '@/lib/types';

interface VoteChartProps {
  votes: Record<string, AllPointValues | null>;
  users: User[];
}

export function VoteChart({ votes, users }: VoteChartProps) {
  const userMap = new Map(users.map(u => [u.id, u]));

  // Track votes by player type
  const androidVotes: number[] = [];
  const iosVotes: number[] = [];
  const qaVotes: number[] = [];

  // Calculate stats for all votes (for chart), broken down by player type
  const voteCountsByType: Record<number, { android: number; ios: number; qa: number }> = {};
  let totalVotes = 0;

  for (const [userId, vote] of Object.entries(votes)) {
    if (vote !== null) {
      if (!voteCountsByType[vote]) {
        voteCountsByType[vote] = { android: 0, ios: 0, qa: 0 };
      }

      const user = userMap.get(userId);
      const playerType = user?.playerType || 'ios';
      voteCountsByType[vote][playerType]++;
      totalVotes++;

      if (playerType === 'android') {
        androidVotes.push(vote);
      } else if (playerType === 'ios') {
        iosVotes.push(vote);
      } else {
        qaVotes.push(vote);
      }
    }
  }

  // Helper function to calculate median
  const calcMedian = (values: number[]): string => {
    if (values.length === 0) return '-';
    const sorted = [...values].sort((a, b) => a - b);
    const len = sorted.length;
    if (len % 2 === 0) {
      return ((sorted[len / 2 - 1] + sorted[len / 2]) / 2).toString();
    }
    return sorted[Math.floor(len / 2)].toString();
  };

  const medianAndroid = calcMedian(androidVotes);
  const medianIos = calcMedian(iosVotes);
  const medianQa = calcMedian(qaVotes);
  const medianDev = calcMedian([...androidVotes, ...iosVotes]);

  // Combine all possible point values for chart
  const allPointValues = Array.from(new Set([...POINT_VALUES, ...QA_POINT_VALUES])).sort((a, b) => a - b);

  const data = allPointValues.map((value) => ({
    name: value.toString(),
    android: voteCountsByType[value]?.android || 0,
    ios: voteCountsByType[value]?.ios || 0,
    qa: voteCountsByType[value]?.qa || 0,
  }));

  const maxVotes = Math.max(...data.map((d) => d.android + d.ios + d.qa), 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Vote Distribution</h2>

      <div className="flex flex-wrap gap-6 mb-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">{medianAndroid}</p>
          <p className="text-sm text-gray-500">Median (Android)</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">{medianIos}</p>
          <p className="text-sm text-gray-500">Median (iOS)</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-orange-500">{medianQa}</p>
          <p className="text-sm text-gray-500">Median (QA)</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-700">{medianDev}</p>
          <p className="text-sm text-gray-500">Median (Dev)</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-400">{totalVotes}</p>
          <p className="text-sm text-gray-500">Total Votes</p>
        </div>
      </div>

      <div className="flex gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-gray-600">Android</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span className="text-gray-600">iOS</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span className="text-gray-600">QA</span>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} domain={[0, maxVotes]} />
            <Tooltip
              formatter={(value, name) => {
                const label = name === 'android' ? 'Android' : name === 'ios' ? 'iOS' : 'QA';
                return [`${value}`, label];
              }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="android" stackId="votes" fill="#22c55e" radius={[0, 0, 0, 0]} />
            <Bar dataKey="ios" stackId="votes" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="qa" stackId="votes" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
