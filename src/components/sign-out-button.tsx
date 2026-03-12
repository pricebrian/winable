"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button variant="ghost" size="sm" type="submit">
        <LogOut className="h-4 w-4 mr-1" />
        Log out
      </Button>
    </form>
  );
}
