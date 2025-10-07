import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { summerHousesQueryOptions, useUnvote, useVote } from "../hooks/queries";
import { SummerHouseCard } from "./SummerHouseCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

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
              <Card key={i} className="w-full max-w-md animate-pulse">
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg" />
                  <div className="absolute top-2 right-2 h-6 w-6 bg-gray-300 rounded-full" />
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <div className="h-3 w-3 bg-gray-200 rounded-full" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <div className="h-9 bg-gray-200 rounded-md flex-1" />
                    <div className="h-9 w-9 bg-gray-200 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      }
    >
      <SummerHousesListContent />
    </Suspense>
  );
}
