import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { OptionsFlow } from "@/components/OptionsFlow";
import { TrendingStocks } from "@/components/TrendingStocks";
import { SocialFeed } from "@/components/SocialFeed";
import { MarketData } from "@/components/MarketData";
import { Leaderboard } from "@/components/Leaderboard";
import { Link } from "wouter";
import { BarChart2, LineChart, Newspaper, LogOut } from "lucide-react";

export default function Home() {
  const { user, logout } = useUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Options Flow</h1>
          <nav className="flex items-center gap-4">
            <Link href="/large-options">
              <Button variant="outline">
                <LineChart className="h-4 w-4 mr-2" />
                Options Data
              </Button>
            </Link>
            <Link href="/paper-trading">
              <Button variant="outline">
                <BarChart2 className="h-4 w-4 mr-2" />
                Paper Trading
              </Button>
            </Link>
            <Link href="/markets">
              <Button variant="outline">
                <Newspaper className="h-4 w-4 mr-2" />
                Markets
              </Button>
            </Link>
            <Button variant="outline" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <TrendingStocks />
              <OptionsFlow />
            </div>
            <div className="lg:col-span-4 space-y-8">
              <Leaderboard />
              <SocialFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}