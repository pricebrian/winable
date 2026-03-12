import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EntryForm } from "@/components/giveaway/entry-form";
import { Logo } from "@/components/logo";
import { format } from "date-fns";
import { Calendar, Users, Gift } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: giveaway } = await supabase
    .from("giveaways")
    .select("title, prize_name")
    .eq("slug", slug)
    .single();

  if (!giveaway) return { title: "Giveaway not found" };

  return {
    title: `${giveaway.title} — Winable`,
    description: `Enter to win ${giveaway.prize_name}. Powered by Winable.`,
  };
}

export default async function GiveawayPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { ref } = await searchParams;

  const supabase = await createClient();

  const { data: giveaway } = await supabase
    .from("giveaways")
    .select("*, profiles!giveaways_creator_id_fkey(display_name, primary_handle, primary_platform)")
    .eq("slug", slug)
    .single();

  if (!giveaway) notFound();

  const { count: entryCount } = await supabase
    .from("entries")
    .select("*", { count: "exact", head: true })
    .eq("giveaway_id", giveaway.id);

  const profile = (giveaway as Record<string, unknown>).profiles as {
    display_name: string;
    primary_handle: string;
    primary_platform: string;
  } | null;

  const isEnded =
    giveaway.status === "ended" || new Date(giveaway.end_date) < new Date();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-center">
          <Logo />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Prize image */}
        {giveaway.prize_image_url && (
          <div className="rounded-2xl overflow-hidden border bg-background">
            <img
              src={giveaway.prize_image_url}
              alt={giveaway.prize_name}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Giveaway info */}
        <div className="bg-background rounded-2xl border p-6 space-y-4">
          <h1 className="text-2xl font-bold">{giveaway.title}</h1>

          {profile && (
            <p className="text-sm text-muted-foreground">
              Hosted by{" "}
              <span className="font-medium text-foreground">
                {profile.display_name}
              </span>{" "}
              {profile.primary_handle && (
                <span className="text-muted-foreground">
                  ({profile.primary_handle})
                </span>
              )}
            </p>
          )}

          {giveaway.host_message && (
            <p className="text-sm text-muted-foreground italic">
              &ldquo;{giveaway.host_message}&rdquo;
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Gift className="h-4 w-4" />
              <span>{giveaway.prize_name}</span>
              {giveaway.prize_value && (
                <span className="text-xs">(${giveaway.prize_value})</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Ends {format(new Date(giveaway.end_date), "MMM d, yyyy")}</span>
            </div>
            {entryCount !== null && entryCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{entryCount.toLocaleString()} entries</span>
              </div>
            )}
          </div>
        </div>

        {/* Entry form */}
        {isEnded ? (
          <div className="bg-background rounded-2xl border p-6 text-center space-y-2">
            <p className="font-semibold">This giveaway has ended</p>
            <p className="text-sm text-muted-foreground">
              Winners will be announced soon.
            </p>
          </div>
        ) : (
          <EntryForm
            giveawayId={giveaway.id}
            giveawaySlug={slug}
            referralCode={ref || undefined}
            referralBonusCount={giveaway.referral_bonus_count}
          />
        )}

        {/* Rules link */}
        <div className="text-center">
          <Link
            href={`/g/${slug}/rules`}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Official rules
          </Link>
        </div>
      </main>
    </div>
  );
}
