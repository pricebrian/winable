"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState, Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [copied, setCopied] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const giveawayUrl = `${baseUrl}/g/${slug}`;
  const shareText = `I'm running a giveaway! Enter through the link in my bio. Bonus entries for referrals.`;

  function copyLink() {
    navigator.clipboard.writeText(giveawayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyShareText() {
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  }

  if (!slug) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Your giveaway is live</h1>
            <p className="text-muted-foreground">
              Copy your link, share it with your audience, and start collecting entries.
            </p>
          </div>

          {/* Giveaway URL */}
          <div className="rounded-xl border p-4 space-y-3">
            <p className="text-sm text-muted-foreground">Your giveaway link</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-lg truncate">
                {giveawayUrl}
              </code>
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href={`/g/${slug}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview giveaway
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full">Go to dashboard</Button>
            </Link>
          </div>

          {/* Share copy */}
          <div className="rounded-xl border p-5 text-left space-y-3">
            <p className="text-sm font-medium">Share your giveaway</p>
            <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
              {shareText}
            </p>
            <Button variant="ghost" size="sm" onClick={copyShareText}>
              {copiedShare ? (
                <>
                  <Check className="h-3 w-3 mr-1 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy share text
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
