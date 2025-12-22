
export enum TeachingCategory {
  PU0 = 'PU0',
  PU1 = 'PU1'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  JUDGE = 'JUDGE'
}

export interface Judge {
  id: string;
  username: string;
  password?: string;
  name: string;
  createdAt: string;
}

export interface AuthSession {
  user: {
    username: string;
    name: string;
    role: UserRole;
  } | null;
}

export interface ScoreItem {
  id: string;
  category: string;
  point: string;
  maxScore: number;
  actualScore: number;
}

export interface Candidate {
  id: string;
  name: string;
  enName: string;
  group: string;
  groupIndex: string;
  organization: string;
  category: TeachingCategory;
  selectedStages: string[];
  scores: Record<string, number>;
  feedback: string;
  totalScore: number;
  lastUpdated: string;
  judgeUsername?: string; 
}

export interface SyncConfig {
  enabled: boolean;
  token: string | null;
  lastSynced: string | null;
}

export interface AppState {
  candidates: Candidate[];
  activeCandidateId: string | null;
}
