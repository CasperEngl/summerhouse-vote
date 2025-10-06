import { AlertCircle, Trophy, Vote } from "lucide-react";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ResultsList } from "./components/ResultsList";
import { SummerHousesList } from "./components/SummerHousesList";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { UserSection } from "./components/UserSection";
import "./index.css";

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Fejl
          </CardTitle>
          <CardDescription>{error.message || "Noget gik galt"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={resetErrorBoundary} className="w-full">
            Prøv igen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function App() {
  const [showResults, setShowResults] = useState(false);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🏠 Sommerhus Afstemning
            </h1>
            <p className="text-gray-600">
              Stem på dine favorit sommerhuse i Danmark
            </p>
          </header>

          <div className="space-y-8">
            {/* User Section */}
            <UserSection />

            {/* Navigation */}
            <div className="flex justify-center gap-4">
              <Button
                variant={!showResults ? "default" : "outline"}
                onClick={() => setShowResults(false)}
              >
                <Vote className="w-4 h-4 mr-2" />
                Stem
              </Button>
              <Button
                variant={showResults ? "default" : "outline"}
                onClick={() => setShowResults(true)}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Resultater
              </Button>
            </div>

            {/* Content */}
            {showResults ? <ResultsList /> : <SummerHousesList />}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
