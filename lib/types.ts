export const POINT_VALUES = [0.5, 1, 2, 3, 5, 8, 16] as const;
export type PointValue = (typeof POINT_VALUES)[number];

export interface User {
  id: string;
  name: string;
  isHost: boolean;
}

export interface Room {
  id: string;
  users: User[];
  votes: Record<string, PointValue | null>;
  isRevealed: boolean;
  hostId: string;
}

export type ClientMessage =
  | { type: 'join'; name: string; userId: string }
  | { type: 'vote'; value: PointValue | null }
  | { type: 'reveal' }
  | { type: 'reset' };

export type ServerMessage =
  | { type: 'room-state'; room: Room; userId: string }
  | { type: 'user-joined'; user: User }
  | { type: 'user-left'; userId: string }
  | { type: 'vote-cast'; userId: string; hasVoted: boolean }
  | { type: 'revealed'; votes: Record<string, PointValue | null> }
  | { type: 'reset' }
  | { type: 'error'; message: string };
