import { useState } from "react";
import { useCreateUser } from "../hooks/useVoting";
import type { UserFormProps } from "../types";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function UserForm({
  onUserCreated,
  isLoading: externalLoading,
}: UserFormProps) {
  const [name, setName] = useState("");
  const createUserMutation = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      await createUserMutation.mutateAsync({ name: name.trim() });
      // The mutation will handle the success via the onSuccess callback
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  const loading = externalLoading || createUserMutation.isPending;
  const error = createUserMutation.error?.message;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Velkommen til Sommerhus Afstemning</CardTitle>
        <CardDescription>
          Indtast dit navn for at begynde at stemme på dine favorit sommerhuse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Dit navn</Label>
            <Input
              id="name"
              type="text"
              placeholder="Indtast dit navn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Opretter konto..." : "Start afstemning"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
