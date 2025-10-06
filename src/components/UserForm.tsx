import { useForm } from "react-hook-form";
import { useCreateUser } from "../hooks/useVoting";
import type { UserFormProps, CreateUserRequest } from "../types";
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
  const createUserMutation = useCreateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserRequest>({
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (data: CreateUserRequest) => {
    try {
      await createUserMutation.mutateAsync({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
      });
      // The mutation will handle the success via the onSuccess callback
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  const loading = externalLoading || createUserMutation.isPending || isSubmitting;
  const error = createUserMutation.error?.message;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Velkommen til Sommerhus Afstemning</CardTitle>
        <CardDescription>
          Indtast dit navn og email for at begynde at stemme på dine favorit sommerhuse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Dit navn</Label>
            <Input
              id="name"
              type="text"
              placeholder="Indtast dit navn"
              disabled={loading}
              {...register("name", {
                required: "Navn er påkrævet",
                minLength: {
                  value: 2,
                  message: "Navn skal være mindst 2 tegn langt",
                },
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Din email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Indtast din email"
              disabled={loading}
              {...register("email", {
                required: "Email er påkrævet",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Indtast venligst en gyldig email adresse",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
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
