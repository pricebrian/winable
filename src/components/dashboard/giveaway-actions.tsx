"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { endGiveaway, drawWinners, clearWinners } from "@/lib/actions/giveaway";
import { Loader2, StopCircle, Trophy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface GiveawayActionsProps {
  giveawayId: string;
  status: string;
  isPastEnd: boolean;
  winnerCount: number;
  hasWinners: boolean;
}

export function GiveawayActions({
  giveawayId,
  status,
  isPastEnd,
  winnerCount,
  hasWinners,
}: GiveawayActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showRedraw, setShowRedraw] = useState(false);

  async function handleEndGiveaway() {
    setLoading("end");
    const result = await endGiveaway(giveawayId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Giveaway ended");
      router.refresh();
    }
    setLoading(null);
  }

  async function handleDrawWinners() {
    setLoading("draw");
    const result = await drawWinners(giveawayId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`${result.winners?.length} winner(s) selected!`);
      router.refresh();
    }
    setLoading(null);
  }

  async function handleRedraw() {
    setLoading("redraw");
    const clearResult = await clearWinners(giveawayId);
    if (clearResult.error) {
      toast.error(clearResult.error);
      setLoading(null);
      return;
    }
    const result = await drawWinners(giveawayId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`${result.winners?.length} new winner(s) selected!`);
      router.refresh();
    }
    setLoading(null);
    setShowRedraw(false);
  }

  const canEnd = status === "live";
  const canDraw = (status === "ended" || isPastEnd) && !hasWinners;
  const canRedraw = (status === "ended" || isPastEnd) && hasWinners;

  return (
    <div className="flex flex-wrap gap-3">
      {canEnd && (
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            <StopCircle className="h-4 w-4 mr-2" />
            End giveaway
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>End this giveaway?</DialogTitle>
              <DialogDescription>
                This will stop accepting new entries. You can then draw winners.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={handleEndGiveaway}
                disabled={loading === "end"}
              >
                {loading === "end" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                End giveaway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {canDraw && (
        <Button onClick={handleDrawWinners} disabled={loading === "draw"}>
          {loading === "draw" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trophy className="h-4 w-4 mr-2" />
          )}
          Draw {winnerCount} winner{winnerCount > 1 ? "s" : ""}
        </Button>
      )}

      {canRedraw && (
        <Dialog open={showRedraw} onOpenChange={setShowRedraw}>
          <DialogTrigger render={<Button variant="outline" />}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Redraw winners
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redraw winners?</DialogTitle>
              <DialogDescription>
                This will clear the current winners and select new ones randomly.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={handleRedraw}
                disabled={loading === "redraw"}
              >
                {loading === "redraw" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Redraw winners
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
