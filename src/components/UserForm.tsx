import { useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useCheckUser, useCreateUser, useLogin } from "../hooks/queries";
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

interface EmailStepProps {
  emailForm: UseFormReturn<{ email: string }>;
  onEmailSubmit: (data: { email: string }) => Promise<void>;
  emailLoading: boolean;
  emailError?: string;
}

function EmailStep({
  emailForm,
  onEmailSubmit,
  emailLoading,
  emailError,
}: EmailStepProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Velkommen til Sommerhus Afstemning</CardTitle>
        <CardDescription>Indtast din email for at begynde</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={emailForm.handleSubmit(onEmailSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Din email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Indtast din email"
              disabled={emailLoading}
              {...emailForm.register("email", {
                required: "Email er påkrævet",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Indtast venligst en gyldig email adresse",
                },
              })}
            />
            {emailForm.formState.errors.email && (
              <p className="text-sm text-red-600">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>

          {emailError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {emailError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={emailLoading}>
            {emailLoading ? "Tjekker email..." : "Fortsæt"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface NameStepProps {
  nameForm: UseFormReturn<{ name: string }>;
  onNameSubmit: (data: { name: string }) => Promise<void>;
  onBackToEmail: () => void;
  nameLoading: boolean;
  nameError?: string;
}

function NameStep({
  nameForm,
  onNameSubmit,
  onBackToEmail,
  nameLoading,
  nameError,
}: NameStepProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Opret konto</CardTitle>
        <CardDescription>
          Indtast dit navn for at oprette din konto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={nameForm.handleSubmit(onNameSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Dit navn</Label>
            <Input
              id="name"
              type="text"
              placeholder="Indtast dit navn"
              disabled={nameLoading}
              {...nameForm.register("name", {
                required: "Navn er påkrævet",
                minLength: {
                  value: 2,
                  message: "Navn skal være mindst 2 tegn langt",
                },
              })}
            />
            {nameForm.formState.errors.name && (
              <p className="text-sm text-red-600">
                {nameForm.formState.errors.name.message}
              </p>
            )}
          </div>

          {nameError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {nameError}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBackToEmail}
              disabled={nameLoading}
              className="flex-1"
            >
              Tilbage
            </Button>
            <Button type="submit" className="flex-1" disabled={nameLoading}>
              {nameLoading ? "Opretter konto..." : "Start afstemning"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type FormStep = "email" | "name";

export function UserForm() {
  const [step, setStep] = useState<FormStep>("email");
  const [email, setEmail] = useState("");

  const checkUserMutation = useCheckUser();
  const createUserMutation = useCreateUser();
  const loginMutation = useLogin();

  const emailForm = useForm<{ email: string }>({
    defaultValues: { email: "" },
  });

  const nameForm = useForm<{ name: string }>({
    defaultValues: { name: "" },
  });

  const onEmailSubmit = async (data: { email: string }) => {
    try {
      const userExists = await checkUserMutation.mutateAsync({
        email: data.email.trim().toLowerCase(),
      });

      if (userExists) {
        // User exists, log them in
        await loginMutation.mutateAsync({
          email: data.email.trim().toLowerCase(),
        });
        // The mutation will handle the success via the onSuccess callback
      } else {
        // User doesn't exist, move to name step
        setEmail(data.email.trim().toLowerCase());
        setStep("name");
      }
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  const onNameSubmit = async (data: { name: string }) => {
    try {
      await createUserMutation.mutateAsync({
        name: data.name.trim(),
        email: email,
      });
      // The mutation will handle the success via the onSuccess callback
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  const onBackToEmail = () => {
    setStep("email");
    setEmail("");
    emailForm.reset();
    nameForm.reset();
  };

  const emailLoading =
    checkUserMutation.isPending ||
    loginMutation.isPending ||
    emailForm.formState.isSubmitting;
  const nameLoading =
    createUserMutation.isPending || nameForm.formState.isSubmitting;

  const emailError =
    checkUserMutation.error?.message || loginMutation.error?.message;
  const nameError = createUserMutation.error?.message;

  if (step === "email") {
    return (
      <EmailStep
        emailForm={emailForm}
        onEmailSubmit={onEmailSubmit}
        emailLoading={emailLoading}
        emailError={emailError}
      />
    );
  }

  return (
    <NameStep
      nameForm={nameForm}
      onNameSubmit={onNameSubmit}
      onBackToEmail={onBackToEmail}
      nameLoading={nameLoading}
      nameError={nameError}
    />
  );
}
