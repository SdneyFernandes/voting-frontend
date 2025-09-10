// /types/index.ts
export type Role = 'ADMIN' | 'USER';
export type VoteStatus = 'ACTIVE' | 'ENDED' | 'NOT_STARTED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  votedSessions: {
    id: number;
    votedOption: string;
  }[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  role: Role;
}

export interface AuthResponse {
  message: string;
}

export interface VoteSession {
  id: number;
  title: string;
  description: string;
  options: string[];
  creatorId: number;
  startAt: string;
  endAt: string;
  status: VoteStatus;
  participants?: number[];
}