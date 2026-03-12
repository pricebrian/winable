"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OnboardingData } from "@/lib/types";

interface StepBasicsProps {
  data: OnboardingData;
  update: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function StepBasics({ data, update, onNext }: StepBasicsProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Giveaway title</Label>
        <Input
          id="title"
          placeholder="Win a MacBook Pro"
          value={data.title}
          onChange={(e) => update({ title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prize_name">Prize name</Label>
        <Input
          id="prize_name"
          placeholder='MacBook Pro 14"'
          value={data.prize_name}
          onChange={(e) => update({ prize_name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prize_description">Prize description</Label>
        <Textarea
          id="prize_description"
          placeholder="One winner will receive a new MacBook Pro 14-inch."
          value={data.prize_description}
          onChange={(e) => update({ prize_description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prize_value">Prize value ($)</Label>
          <Input
            id="prize_value"
            type="number"
            placeholder="1999"
            min="0"
            step="0.01"
            value={data.prize_value}
            onChange={(e) => update({ prize_value: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="winner_count">Number of winners</Label>
          <Input
            id="winner_count"
            type="number"
            min="1"
            max="100"
            value={data.winner_count}
            onChange={(e) =>
              update({ winner_count: parseInt(e.target.value) || 1 })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="end_date">End date</Label>
        <Input
          id="end_date"
          type="date"
          value={data.end_date}
          onChange={(e) => update({ end_date: e.target.value })}
          min={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div className="pt-4">
        <Button type="submit" size="lg" className="w-full">
          Continue
        </Button>
      </div>
    </form>
  );
}
