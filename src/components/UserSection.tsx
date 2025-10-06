import { useSuspenseQuery } from "@tanstack/react-query";
import { Vote } from "lucide-react";
import { Suspense } from "react";
import { userQueryOptions } from "../hooks/useVoting";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { UserForm } from "./UserForm";

function UserSectionContent() {
  const userQuery = useSuspenseQuery(userQueryOptions);

  if (!userQuery.data) {
    return (
      <div className="flex justify-center">
        <UserForm />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="w-5 h-5" />
          Velkommen, {userQuery.data.name}!
        </CardTitle>
        <CardDescription>
          Du har stemt på {userQuery.data.votes.length} sommerhus
          {userQuery.data.votes.length !== 1 ? "e" : ""}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function UserSection() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      }
    >
      <UserSectionContent />
    </Suspense>
  );
}
