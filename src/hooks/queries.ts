import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { resultsApi, summerHousesApi, userApi, votesApi } from "../api";
import type {
  CheckUserRequestSchema,
  CreateUserRequestSchema,
  LoginRequestSchema,
} from "../schemas";

// Query keys
export const queryKeys = {
  user: ["user"] as const,
  summerHouses: ["summerHouses"] as const,
  results: ["results"] as const,
};

// Query options
export const userQueryOptions = queryOptions({
  queryKey: queryKeys.user,
  queryFn: async () => {
    const response = await userApi.get();
    return response.user;
  },
  retry: false, // Don't retry on 401 (no session)
  staleTime: 0, // Always check for user session
});

export const summerHousesQueryOptions = queryOptions({
  queryKey: queryKeys.summerHouses,
  queryFn: async () => {
    const response = await summerHousesApi.getAll();
    return response.summerHouses;
  },
});

export const resultsQueryOptions = queryOptions({
  queryKey: queryKeys.results,
  queryFn: async () => {
    const response = await resultsApi.get();
    return response.results;
  },
});

// Mutations
export const useCheckUser = () => {
  return useMutation({
    mutationFn: async (data: typeof CheckUserRequestSchema.Type) => {
      const response = await userApi.check(data);
      return response.exists;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: typeof CreateUserRequestSchema.Type) => {
      const response = await userApi.create(data);
      return response.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.user, user);
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: typeof LoginRequestSchema.Type) => {
      const response = await userApi.login(data);
      return response.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.user, user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await userApi.logout();
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData(queryKeys.user, null);
      // Optionally clear other cached data
      queryClient.clear();
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
