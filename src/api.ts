import { Schema } from "effect";
import {
  CheckUserRequestSchema,
  CheckUserResponseSchema,
  CreateUserRequestSchema,
  CreateUserResponseSchema,
  DeleteVoteRequestSchema,
  DeleteVoteResponseSchema,
  GetResultsResponseSchema,
  GetSummerHousesResponseSchema,
  GetUserResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  VoteRequestSchema,
  VoteResponseSchema,
} from "./schemas";

// API utility functions
const API_BASE = "/api";

async function apiRequest<A, I>(
  endpoint: string,
  responseSchema: Schema.Schema<A, I, never>,
  options: RequestInit = {},
): Promise<A> {
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

  const jsonData = await response.json();

  return Schema.decodeUnknownSync(responseSchema)(jsonData);
}

// User API
export const userApi = {
  check: (data: typeof CheckUserRequestSchema.Type) =>
    apiRequest("/users/check", CheckUserResponseSchema, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  create: (data: typeof CreateUserRequestSchema.Type) =>
    apiRequest("/users", CreateUserResponseSchema, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: typeof LoginRequestSchema.Type) =>
    apiRequest("/users/login", LoginResponseSchema, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  get: async () => {
    try {
      return await apiRequest("/users", GetUserResponseSchema);
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

  logout: () =>
    apiRequest("/users", Schema.Struct({ success: Schema.Boolean }), {
      method: "DELETE",
    }),
};

// Summer Houses API
export const summerHousesApi = {
  getAll: () => apiRequest("/summer-houses", GetSummerHousesResponseSchema),
};

// Votes API
export const votesApi = {
  create: (data: typeof VoteRequestSchema.Type) =>
    apiRequest("/votes", VoteResponseSchema, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (data: typeof DeleteVoteRequestSchema.Type) =>
    apiRequest("/votes", DeleteVoteResponseSchema, {
      method: "DELETE",
      body: JSON.stringify(data),
    }),
};

// Results API
export const resultsApi = {
  get: () => apiRequest("/results", GetResultsResponseSchema),
};
