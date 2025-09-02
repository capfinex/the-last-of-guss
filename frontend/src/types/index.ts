export type UserRole = 'SURVIVOR' | 'ADMIN' | 'NIKITA';
export type RoundStatus = 'COOLDOWN' | 'ACTIVE' | 'FINISHED';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface Round {
  id: string;
  startTime: string;
  endTime: string;
  status: RoundStatus;
  totalScore: number;
  winnerId?: string;
  winnerName?: string;
  winnerScore?: number;
  myScore?: number;
  myTaps?: number;
}

export interface TapResponse {
  myScore: number;
  myTaps: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}