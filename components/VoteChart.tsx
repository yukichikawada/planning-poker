'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { POINT_VALUES, type PointValue } from '@/lib/types';

interface VoteChartProps {
  votes: Record<string, PointValue | null>;
}

export function VoteChart({ votes }: VoteChartProps) {
  const voteCounts: Record<number, number> = {};
  let totalVotes = 0;
  let sum = 0;
  const voteValues: number[] = [];

  for (const vote of Object.values(votes)) {
    if (vote !== null) {
      voteCounts[vote] = (voteCounts[vote] || 0) + 1;
      totalVotes++;
      sum += vote;
      voteValues.push(vote);
    }
  }

  const average = totalVotes > 0 ? (sum / totalVotes).toFixed(1) : '-';
  const sortedVotes = voteValues.sort((a, b) => a - b);
  const median = totalVotes > 0
    ? totalVotes % 2 === 0
      ? ((sortedVotes[totalVotes / 2 - 1] + sortedVotes[totalVotes / 2]) / 2).toFixed(1)
      : sortedVotes[Math.floor(totalVotes / 2)].toString()
    : '-';

  const data = POINT_VALUES.map((value) => ({
    name: value.toString(),
    votes: voteCounts[value] || 0,
  }));

  const maxVotes = Math.max(...data.map((d) => d.votes), 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Vote Distribution</h2>

      <div className="flex gap-6 mb-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">{average}</p>
          <p className="text-sm text-gray-500">Average</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">{median}</p>
          <p className="text-sm text-gray-500">Median</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-600">{totalVotes}</p>
          <p className="text-sm text-gray-500">Votes</p>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} domain={[0, maxVotes]} />
            <Tooltip
              formatter={(value) => [`${value} vote${value !== 1 ? 's' : ''}`, 'Count']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.votes > 0 ? '#3b82f6' : '#e5e7eb'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
