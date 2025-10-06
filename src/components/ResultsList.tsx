import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { resultsQueryOptions } from "../hooks/queries";

function ResultsListContent() {
  const resultsQuery = useSuspenseQuery(resultsQueryOptions);

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">
        Afstemningsresultater
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resultsQuery.data?.map((result, index) => (
          <Card key={result.id} className="relative">
            <div className="relative">
              <img
                src={result.imageUrl}
                alt={result.name}
                className="w-full h-32 object-cover rounded-t-lg"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400&h=300&fit=crop";
                }}
              />
              <Badge className="absolute top-2 left-2 bg-yellow-500 text-black font-bold">
                #{index + 1}
              </Badge>
              <Badge className="absolute top-2 right-2">
                {result.voteCount} stemme
                {result.voteCount !== 1 ? "r" : ""}
              </Badge>
            </div>
            <CardContent className="pt-4">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                {result.name}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ResultsList() {
  return (
    <Suspense
      fallback={
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-6 animate-pulse"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <ResultsListContent />
    </Suspense>
  );
}
