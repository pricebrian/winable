import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { Plus, ExternalLink, Calendar, Users, Mail, Trophy } from "lucide-react";
import { format } from "date-fns";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: giveaways } = await supabase
    .from("giveaways")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  // Get stats for each giveaway
  const giveawaysWithStats = await Promise.all(
    (giveaways || []).map(async (g) => {
      const { count: entryCount } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true })
        .eq("giveaway_id", g.id);

      const { count: referralCount } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true })
        .eq("giveaway_id", g.id)
        .not("referred_by_entry_id", "is", null);

      const { count: winnerCount } = await supabase
        .from("winners")
        .select("*", { count: "exact", head: true })
        .eq("giveaway_id", g.id);

      return {
        ...g,
        entry_count: entryCount || 0,
        referral_count: referralCount || 0,
        winner_count_actual: winnerCount || 0,
      };
    })
  );

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/onboarding">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New giveaway
              </Button>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your giveaways</h1>

        {giveawaysWithStats.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground">No giveaways yet.</p>
            <Link href="/onboarding">
              <Button>Create your first giveaway</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {giveawaysWithStats.map((g) => (
              <Link
                key={g.id}
                href={`/dashboard/giveaways/${g.id}`}
                className="block"
              >
                <div className="rounded-xl border p-5 hover:border-primary/30 transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="font-semibold">{g.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {g.prize_name}
                      </p>
                    </div>
                    <StatusBadge status={g.status} endDate={g.end_date} />
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {g.entry_count} entries
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4" />
                      {g.entry_count} emails
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="h-4 w-4" />
                      {g.referral_count} referrals
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Ends {format(new Date(g.end_date), "MMM d, yyyy")}
                    </div>
                    {g.winner_count_actual > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-4 w-4" />
                        {g.winner_count_actual} winner(s)
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status, endDate }: { status: string; endDate: string }) {
  const isPastEnd = new Date(endDate) < new Date();
  const effectiveStatus = status === "live" && isPastEnd ? "ended" : status;

  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    live: "default",
    ended: "outline",
  };

  return (
    <Badge variant={variants[effectiveStatus] || "secondary"}>
      {effectiveStatus === "live" && "Live"}
      {effectiveStatus === "ended" && "Ended"}
      {effectiveStatus === "draft" && "Draft"}
    </Badge>
  );
}
