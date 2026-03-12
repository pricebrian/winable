import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { format } from "date-fns";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RulesPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: giveaway } = await supabase
    .from("giveaways")
    .select("*, profiles!giveaways_creator_id_fkey(display_name)")
    .eq("slug", slug)
    .single();

  if (!giveaway) notFound();

  const profile = (giveaway as Record<string, unknown>).profiles as {
    display_name: string;
  } | null;

  const hostName = profile?.display_name || "the giveaway host";
  const endDate = format(new Date(giveaway.end_date), "MMMM d, yyyy");
  const startDate = format(new Date(giveaway.created_at), "MMMM d, yyyy");

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-center">
          <Logo />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-background rounded-2xl border p-8 space-y-8">
          <div>
            <Link
              href={`/g/${slug}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              &larr; Back to giveaway
            </Link>
            <h1 className="text-2xl font-bold mt-4">
              Official Rules: {giveaway.title}
            </h1>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Eligibility</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This giveaway is open to individuals who are 18 years of age or
              older at the time of entry. Employees of the sponsor and their
              immediate family members are not eligible.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Entry Period</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The giveaway begins on {startDate} and ends on {endDate} at
              11:59 PM (local time of the sponsor). Entries submitted after the
              end date will not be eligible.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Prize</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Prize:</strong> {giveaway.prize_name}
              {giveaway.prize_description && (
                <>. {giveaway.prize_description}</>
              )}
              {giveaway.prize_value && (
                <>
                  {" "}
                  Approximate retail value: ${Number(giveaway.prize_value).toLocaleString()}.
                </>
              )}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Number of winners: {giveaway.winner_count}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">How to Enter</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To enter, visit the giveaway page and submit your email address
              through the entry form. Each individual is limited to one entry per
              email address.
            </p>
            {giveaway.referral_bonus_count > 0 && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Referral bonus:</strong> After entering, you will receive
                a unique referral link. For each new entrant who enters using
                your referral link, you will receive {giveaway.referral_bonus_count}{" "}
                additional {giveaway.referral_bonus_count === 1 ? "entry" : "entries"}{" "}
                into the giveaway.
              </p>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Winner Selection</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Winner(s) will be selected at random from all eligible entries
              after the entry period ends. Each entry (including bonus entries
              from referrals) represents one chance to win. Winners will be
              notified via the email address provided at the time of entry.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Odds of Winning</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The odds of winning depend on the total number of eligible entries
              received during the entry period, including any bonus entries
              earned through referrals.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Sponsor</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This giveaway is sponsored by {hostName}. Winable provides the
              platform for running this giveaway but is not the sponsor or
              administrator of the prize.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">General Conditions</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By entering this giveaway, entrants agree to be bound by these
              Official Rules. The sponsor reserves the right to cancel, suspend,
              or modify the giveaway if fraud, technical failures, or other
              factors beyond the sponsor&apos;s control impair the integrity of the
              giveaway. The sponsor reserves the right to disqualify any entrant
              who tampers with the entry process or violates these Official
              Rules.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
