import { UserRole, RoundStatus } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateRoundRequest {
  // Round will be created with current time + cooldown as startTime
}

export interface TapRequest {
  roundId: string;
}

export interface RoundResponse {
  id: string;
  startTime: Date;
  endTime: Date;
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

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}