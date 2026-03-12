"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { submitEntry } from "@/lib/actions/entry";
import { Check, Copy, Users, Loader2 } from "lucide-react";

interface EntryFormProps {
  giveawayId: string;
  giveawaySlug: string;
  referralCode?: string;
  referralBonusCount: number;
}

export function EntryForm({
  giveawayId,
  giveawaySlug,
  referralCode,
  referralBonusCount,
}: EntryFormProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [entryReferralCode, setEntryReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isSubmitted = entryReferralCode !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreedToRules) return;
    setSubmitting(true);
    setError("");

    const result = await submitEntry({
      giveaway_id: giveawayId,
      email,
      first_name: firstName || undefined,
      referral_code: referralCode,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    if (result.entry) {
      setEntryReferralCode(result.entry.referral_code);
    }
    setSubmitting(false);
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = entryReferralCode
    ? `${baseUrl}/g/${giveawaySlug}?ref=${entryReferralCode}`
    : "";

  function copyReferralLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isSubmitted) {
    return (
      <div className="bg-background rounded-2xl border p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <p className="font-semibold text-lg">You&apos;re entered!</p>
        </div>

        {referralBonusCount > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <p>
                Want better odds? Invite friends and earn{" "}
                <span className="font-medium text-foreground">
                  +{referralBonusCount} extra entries
                </span>{" "}
                for each friend who enters.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-lg truncate">
                {referralLink}
              </code>
              <Button variant="outline" size="icon" onClick={copyReferralLink}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl border p-6 space-y-6">
      <h2 className="text-lg font-semibold">Enter giveaway</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="first_name">
            First name <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="first_name"
            placeholder="Your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="agree-rules"
            checked={agreedToRules}
            onCheckedChange={(c) => setAgreedToRules(c === true)}
          />
          <label htmlFor="agree-rules" className="text-sm leading-relaxed cursor-pointer">
            I agree to the giveaway rules
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!agreedToRules || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Entering...
            </>
          ) : (
            "Enter giveaway"
          )}
        </Button>
      </form>

      {referralCode && referralBonusCount > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          You were referred! The person who invited you will earn bonus entries.
        </p>
      )}
    </div>
  );
}
