import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  summerHousesQueryOptions,
  useUnvote,
  useVote,
} from "../hooks/useVoting";
import { SummerHouseCard } from "./SummerHouseCard";

function SummerHousesListContent() {
  const summerHousesQuery = useSuspenseQuery(summerHousesQueryOptions);
  const voteMutation = useVote();
  const unvoteMutation = useUnvote();

  const handleVote = async (summerHouseId: number) => {
    await voteMutation.mutateAsync(summerHouseId);
  };

  const handleUnvote = async (summerHouseId: number) => {
    await unvoteMutation.mutateAsync(summerHouseId);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">
        Vælg dine favoritter
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {summerHousesQuery.data?.map((summerHouse) => (
          <SummerHouseCard
            key={summerHouse.id}
            summerHouse={summerHouse}
            onVote={handleVote}
            onUnvote={handleUnvote}
          />
        ))}
      </div>
    </div>
  );
}

export function SummerHousesList() {
  return (
    <Suspense
      fallback={
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-6 animate-pulse"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <SummerHousesListContent />
    </Suspense>
  );
}
