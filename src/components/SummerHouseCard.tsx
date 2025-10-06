import { ExternalLink, Heart, MapPin } from "lucide-react";
import { useState } from "react";
import type { SummerHouse } from "../database";
import { useUser } from "../hooks/useVoting";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function SummerHouseCard({
  summerHouse,
  onVote,
  onUnvote,
}: {
  summerHouse: SummerHouse;
  onVote: (summerHouseId: number) => Promise<void>;
  onUnvote: (summerHouseId: number) => Promise<void>;
}) {
  const user = useUser();
  const [isVoting, setIsVoting] = useState(false);
  const hasVoted = user?.data?.votes.includes(summerHouse.id) ?? false;

  const handleVoteToggle = async () => {
    if (!user) return;

    setIsVoting(true);
    try {
      if (hasVoted) {
        await onUnvote(summerHouse.id);
      } else {
        await onVote(summerHouse.id);
      }
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <div className="relative">
        <a
          href={summerHouse.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Se på bookingside"
          className="block"
        >
          <img
            src={summerHouse.imageUrl}
            alt={summerHouse.name}
            className="w-full h-48 object-cover rounded-t-lg hover:opacity-90 transition-opacity"
          />
        </a>
        {hasVoted && (
          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-2">
            <Heart className="w-3 h-3 fill-current" />
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight">
          {summerHouse.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Danmark
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            onClick={handleVoteToggle}
            disabled={!user || isVoting}
            variant={hasVoted ? "secondary" : "default"}
            className="flex-1"
          >
            <Heart
              className={`w-4 h-4 mr-2 ${hasVoted ? "fill-current" : ""}`}
            />
            {isVoting ? "..." : hasVoted ? "Fjern stemme" : "Stem"}
          </Button>

          <Button variant="outline" size="icon" asChild>
            <a
              href={summerHouse.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Se på bookingside"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>

        {!user && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Log ind for at stemme
          </p>
        )}
      </CardContent>
    </Card>
  );
}
