import { useSuspenseQuery } from "@tanstack/react-query";
import { LogOut, User as UserIcon } from "lucide-react";
import { Suspense } from "react";
import { useLogout, userQueryOptions } from "../hooks/useVoting";
import { Button } from "./ui/button";
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
  const logoutMutation = useLogout();

  if (!userQuery.data) {
    return (
      <div className="flex justify-center">
        <UserForm />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // The mutation will clear the cache and update the UI
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const votesCount = userQuery.data.votes?.length || 0;

  return (
    <Card className="overflow-hidden shadow-none ring-1 ring-gray-200/60">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center ring-1 ring-indigo-200">
            <UserIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-base">
              Velkommen, {userQuery.data.name}
            </CardTitle>
            <CardDescription className="mt-0.5">
              Klar til at stemme på sommerhuse
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Du har stemt på {votesCount} sommerhus
            {votesCount !== 1 ? "e" : ""}
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {logoutMutation.isPending ? "Logger ud..." : "Log ud"}
          </Button>
        </div>
      </CardContent>
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
