export const POINT_VALUES = [0.5, 1, 2, 3, 5, 8, 16] as const;
export const QA_POINT_VALUES = [0.125, 0.25, 0.5, 1, 2] as const;

export type PointValue = (typeof POINT_VALUES)[number];
export type QAPointValue = (typeof QA_POINT_VALUES)[number];
export type AllPointValues = PointValue | QAPointValue;

export type PlayerType = 'android' | 'ios' | 'qa';

export interface User {
  id: string;
  name: string;
  isHost: boolean;
  playerType: PlayerType;
}

export interface Room {
  id: string;
  users: User[];
  votes: Record<string, AllPointValues | null>;
  isRevealed: boolean;
  hostId: string;
}

export type ClientMessage =
  | { type: 'join'; name: string; userId: string; playerType: PlayerType }
  | { type: 'vote'; value: AllPointValues | null }
  | { type: 'reveal' }
  | { type: 'reset' };

export type ServerMessage =
  | { type: 'room-state'; room: Room; userId: string }
  | { type: 'user-joined'; user: User }
  | { type: 'user-left'; userId: string }
  | { type: 'vote-cast'; userId: string; hasVoted: boolean }
  | { type: 'revealed'; votes: Record<string, AllPointValues | null> }
  | { type: 'reset' }
  | { type: 'error'; message: string };
