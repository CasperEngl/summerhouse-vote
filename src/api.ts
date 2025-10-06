import type {
  CheckUserRequest,
  CheckUserResponse,
  CreateUserRequest,
  CreateUserResponse,
  LoginRequest,
  LoginResponse,
  GetUserResponse,
  GetSummerHousesResponse,
  VoteRequest,
  VoteResponse,
  DeleteVoteRequest,
  DeleteVoteResponse,
  GetResultsResponse,
} from "./types";

// API utility functions
const API_BASE = "/api";

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Include cookies for session management
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// User API
export const userApi = {
  check: (data: CheckUserRequest): Promise<CheckUserResponse> =>
    apiRequest("/users/check", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  create: (data: CreateUserRequest): Promise<CreateUserResponse> =>
    apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiRequest("/users/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  get: async (): Promise<GetUserResponse> => {
    try {
      return await apiRequest("/users");
    } catch (error) {
      // If we get a 401 (no session), return null user instead of throwing
      if (
        error instanceof Error &&
        error.message.includes("No session found")
      ) {
        return { user: null };
      }
      throw error;
    }
  },

  logout: (): Promise<{ success: boolean }> =>
    apiRequest("/users", {
      method: "DELETE",
    }),
};

// Summer Houses API
export const summerHousesApi = {
  getAll: (): Promise<GetSummerHousesResponse> => apiRequest("/summer-houses"),
};

// Votes API
export const votesApi = {
  create: (data: VoteRequest): Promise<VoteResponse> =>
    apiRequest("/votes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (data: DeleteVoteRequest): Promise<DeleteVoteResponse> =>
    apiRequest("/votes", {
      method: "DELETE",
      body: JSON.stringify(data),
    }),
};

// Results API
export const resultsApi = {
  get: (): Promise<GetResultsResponse> => apiRequest("/results"),
};
