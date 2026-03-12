"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { OnboardingData } from "@/lib/types";
import { Mail, Users, Info } from "lucide-react";

interface StepEntryProps {
  data: OnboardingData;
  update: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const bonusOptions = [1, 3, 5];

export function StepEntry({ data, update, onNext, onBack }: StepEntryProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Email entry - always on */}
      <div className="rounded-xl border p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Email entry</p>
            <p className="text-sm text-muted-foreground">
              Entrants submit their email to enter
            </p>
          </div>
          <span className="ml-auto text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
            Required
          </span>
        </div>
      </div>

      {/* Referral bonus */}
      <div className="rounded-xl border p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Referral bonus entries</p>
            <p className="text-sm text-muted-foreground">
              Entrants earn extra entries when they invite friends who also enter
            </p>
          </div>
          <Checkbox
            checked={data.referral_enabled}
            onCheckedChange={(checked) =>
              update({ referral_enabled: checked === true })
            }
          />
        </div>

        {data.referral_enabled && (
          <div className="space-y-2 pl-[52px]">
            <Label className="text-sm">Bonus entries per referral</Label>
            <div className="flex gap-2">
              {bonusOptions.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update({ referral_bonus_count: n })}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    data.referral_bonus_count === n
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  +{n} {n === 1 ? "entry" : "entries"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Helper copy */}
      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          Winable directly tracks email entries and referrals. Social actions can
          still be mentioned in your giveaway copy.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  );
}
