"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OnboardingData, Platform } from "@/lib/types";
import { Upload, Instagram, Youtube } from "lucide-react";

interface StepBrandingProps {
  data: OnboardingData;
  update: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const platforms: { value: Platform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
];

export function StepBranding({ data, update, onNext, onBack }: StepBrandingProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      update({ prize_image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="display_name">Your display name</Label>
        <Input
          id="display_name"
          placeholder="Brian Price"
          value={data.display_name}
          onChange={(e) => update({ display_name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="primary_handle">Primary social handle</Label>
        <Input
          id="primary_handle"
          placeholder="@brianprice"
          value={data.primary_handle}
          onChange={(e) => update({ primary_handle: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Platform</Label>
        <div className="flex gap-2">
          {platforms.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => update({ primary_platform: p.value })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                data.primary_platform === p.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {p.value === "instagram" && <Instagram className="h-4 w-4" />}
              {p.value === "youtube" && <Youtube className="h-4 w-4" />}
              {p.value === "tiktok" && (
                <span className="text-xs font-bold">TT</span>
              )}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Prize image</Label>
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors ${
            imagePreview ? "border-primary/30" : "border-border"
          }`}
          onClick={() => document.getElementById("prize_image")?.click()}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Prize preview"
              className="max-h-48 mx-auto rounded-lg object-cover"
            />
          ) : (
            <div className="space-y-2 text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto" />
              <p className="text-sm">Click to upload a prize image</p>
              <p className="text-xs">PNG, JPG up to 5MB</p>
            </div>
          )}
          <input
            id="prize_image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="host_message">Host message (optional)</Label>
        <Textarea
          id="host_message"
          placeholder="I'm giving away a MacBook Pro to celebrate 100k followers."
          value={data.host_message}
          onChange={(e) => update({ host_message: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  );
}
