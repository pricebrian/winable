"use server";

import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export async function submitEntry(data: {
  giveaway_id: string;
  email: string;
  first_name?: string;
  referral_code?: string; // code of the person who referred this entrant
}) {
  const supabase = await createClient();

  // Check giveaway is live
  const { data: giveaway } = await supabase
    .from("giveaways")
    .select("*")
    .eq("id", data.giveaway_id)
    .single();

  if (!giveaway) return { error: "Giveaway not found" };
  if (giveaway.status !== "live") return { error: "This giveaway is no longer accepting entries" };
  if (new Date(giveaway.end_date) < new Date()) return { error: "This giveaway has ended" };

  // Check for duplicate entry
  const { data: existing } = await supabase
    .from("entries")
    .select("id, referral_code")
    .eq("giveaway_id", data.giveaway_id)
    .eq("email", data.email)
    .single();

  if (existing) {
    return { entry: existing, alreadyEntered: true };
  }

  // Look up referring entry if referral code provided
  let referredByEntryId: string | null = null;
  if (data.referral_code) {
    const { data: referrer } = await supabase
      .from("entries")
      .select("id")
      .eq("referral_code", data.referral_code)
      .eq("giveaway_id", data.giveaway_id)
      .single();

    if (referrer) {
      referredByEntryId = referrer.id;
    }
  }

  // Create entry
  const entryReferralCode = nanoid(10);

  const { data: entry, error } = await supabase
    .from("entries")
    .insert({
      giveaway_id: data.giveaway_id,
      email: data.email,
      first_name: data.first_name || null,
      referral_code: entryReferralCode,
      referred_by_entry_id: referredByEntryId,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Award bonus entries to referrer
  if (referredByEntryId) {
    await supabase.rpc("increment_bonus_entries", {
      entry_id: referredByEntryId,
      bonus: giveaway.referral_bonus_count,
    });
  }

  return { entry, alreadyEntered: false };
}
