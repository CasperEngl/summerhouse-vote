import type { User, SummerHouse } from "./database";

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Extended types for API responses
export interface SummerHouseWithVoteCount extends SummerHouse {
  voteCount: number;
}

export interface UserWithVotes extends User {
  votes: number[]; // Array of summer house IDs that the user has voted for
}

// API Request/Response Types
export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface CreateUserResponse {
  user: UserWithVotes;
}

export interface GetUserResponse {
  user: UserWithVotes | null;
}

export interface GetSummerHousesResponse {
  summerHouses: SummerHouse[];
}

export interface VoteRequest {
  summerHouseId: number;
}

export interface VoteResponse {
  vote: {
    id: number;
    userId: number;
    summerHouseId: number;
    createdAt: Date;
  };
  user: UserWithVotes;
}

export interface DeleteVoteRequest {
  summerHouseId: number;
}

export interface DeleteVoteResponse {
  success: boolean;
  user: UserWithVotes;
}

export interface GetResultsResponse {
  results: SummerHouseWithVoteCount[];
}

// Frontend State Types
export interface AppState {
  user: UserWithVotes | null;
  summerHouses: SummerHouse[];
  results: SummerHouseWithVoteCount[];
  isLoading: boolean;
  error: string | null;
}

// Component Props Types
export interface UserFormProps {
  onUserCreated?: (user: UserWithVotes) => void;
  isLoading?: boolean;
}

export interface SummerHouseCardProps {
  summerHouse: SummerHouse;
  user: UserWithVotes | null;
  onVote: (summerHouseId: number) => Promise<void>;
  onUnvote: (summerHouseId: number) => Promise<void>;
}

export interface ResultsViewProps {
  results: SummerHouseWithVoteCount[];
}
