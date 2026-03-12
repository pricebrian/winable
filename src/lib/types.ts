export type Platform = "instagram" | "tiktok" | "youtube";
export type GiveawayStatus = "draft" | "live" | "ended";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  primary_handle: string | null;
  primary_platform: Platform | null;
  created_at: string;
}

export interface Giveaway {
  id: string;
  creator_id: string;
  title: string;
  prize_name: string;
  prize_description: string | null;
  prize_value: number | null;
  winner_count: number;
  end_date: string;
  status: GiveawayStatus;
  slug: string;
  host_message: string | null;
  prize_image_url: string | null;
  referral_bonus_count: number;
  created_at: string;
}

export interface Entry {
  id: string;
  giveaway_id: string;
  email: string;
  first_name: string | null;
  referral_code: string;
  referred_by_entry_id: string | null;
  bonus_entries: number;
  created_at: string;
}

export interface Winner {
  id: string;
  giveaway_id: string;
  entry_id: string;
  selected_at: string;
}

export interface GiveawayWithStats extends Giveaway {
  entry_count: number;
  referral_count: number;
  winner_count_actual: number;
}

// Onboarding wizard state
export interface OnboardingData {
  // Step 1: Basics
  title: string;
  prize_name: string;
  prize_description: string;
  prize_value: string;
  winner_count: number;
  end_date: string;
  // Step 2: Branding
  display_name: string;
  primary_handle: string;
  primary_platform: Platform;
  prize_image: File | null;
  host_message: string;
  // Step 3: Entry
  referral_enabled: boolean;
  referral_bonus_count: number;
}
