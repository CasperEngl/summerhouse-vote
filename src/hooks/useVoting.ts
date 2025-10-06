import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { resultsApi, summerHousesApi, userApi, votesApi } from "../api";
import type { CreateUserRequest, UserWithVotes } from "../types";

// Query keys
export const queryKeys = {
  user: ["user"] as const,
  summerHouses: ["summerHouses"] as const,
  results: ["results"] as const,
};

// User hooks
export const useUser = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.user,
    queryFn: async (): Promise<UserWithVotes | null> => {
      const response = await userApi.get();
      return response.user;
    },
    retry: false, // Don't retry on 401 (no session)
    staleTime: 0, // Always check for user session
  });
};

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

// Summer houses hooks
export const useSummerHouses = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.summerHouses,
    queryFn: async () => {
      const response = await summerHousesApi.getAll();
      return response.summerHouses;
    },
  });
};

// Voting hooks
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

// Results hooks
export const useResults = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.results,
    queryFn: async () => {
      const response = await resultsApi.get();
      return response.results;
    },
  });
};
