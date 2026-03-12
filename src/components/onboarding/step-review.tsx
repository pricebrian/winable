"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { createGiveaway, uploadPrizeImage } from "@/lib/actions/giveaway";
import type { OnboardingData } from "@/lib/types";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface StepReviewProps {
  data: OnboardingData;
  onBack: () => void;
  onLaunched: (slug: string) => void;
}

export function StepReview({ data, onBack, onLaunched }: StepReviewProps) {
  const [confirmPrize, setConfirmPrize] = useState(false);
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState("");

  async function handleLaunch() {
    setLaunching(true);
    setError("");

    try {
      // Upload image if present
      let prizeImageUrl: string | null = null;
      if (data.prize_image) {
        const formData = new FormData();
        formData.append("file", data.prize_image);
        const result = await uploadPrizeImage(formData);
        if (result.error) {
          setError(result.error);
          setLaunching(false);
          return;
        }
        prizeImageUrl = result.url ?? null;
      }

      const result = await createGiveaway({
        title: data.title,
        prize_name: data.prize_name,
        prize_description: data.prize_description,
        prize_value: data.prize_value ? parseFloat(data.prize_value) : null,
        winner_count: data.winner_count,
        end_date: new Date(data.end_date).toISOString(),
        display_name: data.display_name,
        primary_handle: data.primary_handle,
        primary_platform: data.primary_platform,
        host_message: data.host_message,
        prize_image_url: prizeImageUrl,
        referral_bonus_count: data.referral_enabled
          ? data.referral_bonus_count
          : 0,
      });

      if (result.error) {
        setError(result.error);
        setLaunching(false);
        return;
      }

      if (result.giveaway) {
        onLaunched(result.giveaway.slug);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLaunching(false);
    }
  }

  const canLaunch = confirmPrize && confirmTerms && !launching;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-xl border divide-y">
        <SummaryRow label="Giveaway title" value={data.title} />
        <SummaryRow label="Prize" value={data.prize_name} />
        {data.prize_value && (
          <SummaryRow label="Prize value" value={`$${data.prize_value}`} />
        )}
        <SummaryRow label="Winners" value={String(data.winner_count)} />
        <SummaryRow
          label="End date"
          value={format(new Date(data.end_date), "MMM d, yyyy")}
        />
        <Separator />
        <SummaryRow label="Hosted by" value={data.display_name} />
        <SummaryRow label="Handle" value={data.primary_handle} />
        <SummaryRow
          label="Platform"
          value={data.primary_platform.charAt(0).toUpperCase() + data.primary_platform.slice(1)}
        />
        <Separator />
        <SummaryRow label="Entry method" value="Email" />
        <SummaryRow
          label="Referral bonus"
          value={
            data.referral_enabled
              ? `+${data.referral_bonus_count} entries per referral`
              : "Disabled"
          }
        />
      </div>

      {/* Confirmations */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="confirm-prize"
            checked={confirmPrize}
            onCheckedChange={(c) => setConfirmPrize(c === true)}
          />
          <label htmlFor="confirm-prize" className="text-sm leading-relaxed cursor-pointer">
            I confirm I have the right to offer this prize
          </label>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="confirm-terms"
            checked={confirmTerms}
            onCheckedChange={(c) => setConfirmTerms(c === true)}
          />
          <label htmlFor="confirm-terms" className="text-sm leading-relaxed cursor-pointer">
            I agree to Winable&apos;s terms
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          className="flex-1"
          disabled={launching}
        >
          Back
        </Button>
        <Button
          size="lg"
          className="flex-1"
          disabled={!canLaunch}
          onClick={handleLaunch}
        >
          {launching ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Launching...
            </>
          ) : (
            "Launch giveaway"
          )}
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-5 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
