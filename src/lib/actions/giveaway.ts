"use server";

import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base}-${nanoid(6)}`;
}

export async function createGiveaway(data: {
  title: string;
  prize_name: string;
  prize_description: string;
  prize_value: number | null;
  winner_count: number;
  end_date: string;
  display_name: string;
  primary_handle: string;
  primary_platform: string;
  host_message: string;
  prize_image_url: string | null;
  referral_bonus_count: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: data.display_name,
      primary_handle: data.primary_handle,
      primary_platform: data.primary_platform,
    })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  // Create giveaway
  const slug = generateSlug(data.title);

  const { data: giveaway, error: giveawayError } = await supabase
    .from("giveaways")
    .insert({
      creator_id: user.id,
      title: data.title,
      prize_name: data.prize_name,
      prize_description: data.prize_description,
      prize_value: data.prize_value,
      winner_count: data.winner_count,
      end_date: data.end_date,
      status: "live",
      slug,
      host_message: data.host_message || null,
      prize_image_url: data.prize_image_url,
      referral_bonus_count: data.referral_bonus_count,
    })
    .select()
    .single();

  if (giveawayError) return { error: giveawayError.message };

  return { giveaway };
}

export async function endGiveaway(giveawayId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("giveaways")
    .update({ status: "ended" })
    .eq("id", giveawayId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function drawWinners(giveawayId: string) {
  const supabase = await createClient();

  // Get giveaway details
  const { data: giveaway } = await supabase
    .from("giveaways")
    .select("*")
    .eq("id", giveawayId)
    .single();

  if (!giveaway) return { error: "Giveaway not found" };
  if (giveaway.status !== "ended") return { error: "Giveaway must be ended first" };

  // Check if winners already drawn
  const { data: existingWinners } = await supabase
    .from("winners")
    .select("id")
    .eq("giveaway_id", giveawayId);

  if (existingWinners && existingWinners.length > 0) {
    return { error: "Winners have already been drawn. Clear existing winners first to redraw." };
  }

  // Get all entries with weighted chances (1 base + bonus_entries)
  const { data: entries } = await supabase
    .from("entries")
    .select("*")
    .eq("giveaway_id", giveawayId);

  if (!entries || entries.length === 0) return { error: "No entries found" };

  // Build weighted pool
  const pool: string[] = [];
  for (const entry of entries) {
    const tickets = 1 + (entry.bonus_entries || 0);
    for (let i = 0; i < tickets; i++) {
      pool.push(entry.id);
    }
  }

  // Shuffle and pick unique winners
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const winnerEntryIds = new Set<string>();

  for (const id of shuffled) {
    if (winnerEntryIds.size >= giveaway.winner_count) break;
    winnerEntryIds.add(id);
  }

  // Insert winners
  const winnersToInsert = Array.from(winnerEntryIds).map((entryId) => ({
    giveaway_id: giveawayId,
    entry_id: entryId,
  }));

  const { data: winners, error } = await supabase
    .from("winners")
    .insert(winnersToInsert)
    .select("*, entry:entries(email, first_name)");

  if (error) return { error: error.message };

  return { winners };
}

export async function clearWinners(giveawayId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("winners")
    .delete()
    .eq("giveaway_id", giveawayId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function uploadPrizeImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;

  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop();
  const fileName = `${nanoid()}.${ext}`;

  const { error } = await supabase.storage
    .from("prize-images")
    .upload(fileName, file);

  if (error) return { error: error.message };

  const { data: urlData } = supabase.storage
    .from("prize-images")
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl };
}
