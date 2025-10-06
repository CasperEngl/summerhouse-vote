import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { resultsApi, summerHousesApi, userApi, votesApi } from "../api";
import type { SummerHouse } from "../database";
import type {
  CreateUserRequest,
  SummerHouseWithVoteCount,
  UserWithVotes,
} from "../types";

// Query keys
export const queryKeys = {
  user: ["user"] as const,
  summerHouses: ["summerHouses"] as const,
  results: ["results"] as const,
};

// Query options
export const userQueryOptions = queryOptions({
  queryKey: queryKeys.user,
  queryFn: async (): Promise<UserWithVotes | null> => {
    const response = await userApi.get();
    return response.user;
  },
  retry: false, // Don't retry on 401 (no session)
  staleTime: 0, // Always check for user session
});

export const summerHousesQueryOptions = queryOptions({
  queryKey: queryKeys.summerHouses,
  queryFn: async (): Promise<SummerHouse[]> => {
    const response = await summerHousesApi.getAll();
    return response.summerHouses;
  },
});

export const resultsQueryOptions = queryOptions({
  queryKey: queryKeys.results,
  queryFn: async (): Promise<SummerHouseWithVoteCount[]> => {
    const response = await resultsApi.get();
    return response.results;
  },
});

// Mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const response = await userApi.create(data);
      return response.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.user, user);
    },
  });
};

export const useVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (summerHouseId: number) => {
      const response = await votesApi.create({ summerHouseId });
      return response;
    },
    onSuccess: (response) => {
      // Update user data
      queryClient.setQueryData(queryKeys.user, response.user);
      // Invalidate results to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.results });
    },
  });
};

export const useUnvote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (summerHouseId: number) => {
      const response = await votesApi.delete({ summerHouseId });
      return response;
    },
    onSuccess: (response) => {
      // Update user data
      queryClient.setQueryData(queryKeys.user, response.user);
      // Invalidate results to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.results });
    },
  });
};
