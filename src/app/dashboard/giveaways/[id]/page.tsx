import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { GiveawayActions } from "@/components/dashboard/giveaway-actions";
import { format } from "date-fns";
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Users,
  Mail,
  Trophy,
  Calendar,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GiveawayDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: giveaway } = await supabase
    .from("giveaways")
    .select("*")
    .eq("id", id)
    .eq("creator_id", user.id)
    .single();

  if (!giveaway) notFound();

  const { data: entries, count: entryCount } = await supabase
    .from("entries")
    .select("*", { count: "exact" })
    .eq("giveaway_id", id)
    .order("created_at", { ascending: false });

  const { count: referralCount } = await supabase
    .from("entries")
    .select("*", { count: "exact", head: true })
    .eq("giveaway_id", id)
    .not("referred_by_entry_id", "is", null);

  const { data: winners } = await supabase
    .from("winners")
    .select("*, entry:entries(email, first_name)")
    .eq("giveaway_id", id);

  const isPastEnd = new Date(giveaway.end_date) < new Date();
  const effectiveStatus =
    giveaway.status === "live" && isPastEnd ? "ended" : giveaway.status;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const publicUrl = `${baseUrl}/g/${giveaway.slug}`;

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{giveaway.title}</h1>
            <p className="text-muted-foreground">{giveaway.prize_name}</p>
          </div>
          <Badge
            variant={
              effectiveStatus === "live"
                ? "default"
                : effectiveStatus === "ended"
                ? "outline"
                : "secondary"
            }
          >
            {effectiveStatus}
          </Badge>
        </div>

        {/* Public link */}
        <div className="rounded-xl border p-4 flex items-center gap-3">
          <code className="flex-1 text-sm truncate text-muted-foreground">
            {publicUrl}
          </code>
          <Link href={`/g/${giveaway.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Entries"
            value={entryCount || 0}
          />
          <StatCard
            icon={<Mail className="h-4 w-4" />}
            label="Emails"
            value={entryCount || 0}
          />
          <StatCard
            icon={<ExternalLink className="h-4 w-4" />}
            label="Referrals"
            value={referralCount || 0}
          />
          <StatCard
            icon={<Calendar className="h-4 w-4" />}
            label="End date"
            value={format(new Date(giveaway.end_date), "MMM d")}
          />
        </div>

        {/* Actions */}
        <GiveawayActions
          giveawayId={giveaway.id}
          status={effectiveStatus}
          isPastEnd={isPastEnd}
          winnerCount={giveaway.winner_count}
          hasWinners={(winners?.length || 0) > 0}
        />

        {/* Winners */}
        {winners && winners.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Winners
            </h2>
            <div className="rounded-xl border divide-y">
              {winners.map((w) => {
                const entry = w.entry as unknown as {
                  email: string;
                  first_name: string | null;
                };
                return (
                  <div
                    key={w.id}
                    className="px-5 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {entry?.first_name || "Entrant"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry?.email}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Selected {format(new Date(w.selected_at), "MMM d, yyyy")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Separator />

        {/* Entries list */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Entries ({entryCount || 0})
          </h2>
          {entries && entries.length > 0 ? (
            <div className="rounded-xl border divide-y">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{entry.email}</p>
                    {entry.first_name && (
                      <p className="text-xs text-muted-foreground">
                        {entry.first_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {entry.referred_by_entry_id && (
                      <span className="bg-muted px-2 py-0.5 rounded">
                        Referred
                      </span>
                    )}
                    {entry.bonus_entries > 0 && (
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                        +{entry.bonus_entries} bonus
                      </span>
                    )}
                    <span>
                      {format(new Date(entry.created_at), "MMM d")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border p-4 space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
