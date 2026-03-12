"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/logo";
import { StepBasics } from "@/components/onboarding/step-basics";
import { StepBranding } from "@/components/onboarding/step-branding";
import { StepEntry } from "@/components/onboarding/step-entry";
import { StepReview } from "@/components/onboarding/step-review";
import type { OnboardingData, Platform } from "@/lib/types";

const STEPS = [
  "What are you giving away?",
  "Make it look like yours",
  "Choose how people enter",
  "Review and launch",
];

const defaultEndDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
};

const initialData: OnboardingData = {
  title: "",
  prize_name: "",
  prize_description: "",
  prize_value: "",
  winner_count: 1,
  end_date: defaultEndDate(),
  display_name: "",
  primary_handle: "",
  primary_platform: "instagram" as Platform,
  prize_image: null,
  host_message: "",
  referral_enabled: true,
  referral_bonus_count: 3,
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [launchedSlug, setLaunchedSlug] = useState<string | null>(null);
  const router = useRouter();

  const progress = ((step + 1) / STEPS.length) * 100;

  function update(partial: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function onLaunched(slug: string) {
    setLaunchedSlug(slug);
  }

  if (launchedSlug) {
    router.push(`/onboarding/success?slug=${launchedSlug}`);
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <span className="text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto w-full px-4">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-10">
        <h2 className="text-2xl font-bold mb-8">{STEPS[step]}</h2>

        {step === 0 && (
          <StepBasics data={data} update={update} onNext={next} />
        )}
        {step === 1 && (
          <StepBranding data={data} update={update} onNext={next} onBack={back} />
        )}
        {step === 2 && (
          <StepEntry data={data} update={update} onNext={next} onBack={back} />
        )}
        {step === 3 && (
          <StepReview data={data} onBack={back} onLaunched={onLaunched} />
        )}
      </main>
    </div>
  );
}
