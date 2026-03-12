import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Gift, Mail, Trophy, Zap, Users, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Create my giveaway</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Launch a giveaway in minutes. Capture emails. Pick a winner fairly.
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            No code. No agency. No messy spreadsheets.
          </p>
          <div className="pt-4">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 h-12">
                Create my giveaway
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Free to start. Launch in under 3 minutes.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-12">
            Everything you need to run a giveaway
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Launch in minutes"
              description="Simple step-by-step wizard. No complicated setup."
            />
            <FeatureCard
              icon={<Mail className="h-5 w-5" />}
              title="Capture emails"
              description="Every entrant gives you their email. Build your list."
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="Referral system"
              description="Entrants share for bonus entries. Viral growth built in."
            />
            <FeatureCard
              icon={<Gift className="h-5 w-5" />}
              title="Your brand"
              description="Customize with your name, handle, and prize image."
            />
            <FeatureCard
              icon={<Trophy className="h-5 w-5" />}
              title="Fair winner selection"
              description="Random, transparent drawing. No favoritism."
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="Auto-generated rules"
              description="Professional rules page for every giveaway."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to run your giveaway?</h2>
          <p className="text-muted-foreground">
            Join creators who use Winable to grow their audience with giveaways.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-base px-8 h-12">
              Create my giveaway
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <Logo />
          <p>&copy; {new Date().getFullYear()} Winable</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
