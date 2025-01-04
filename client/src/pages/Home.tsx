import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { OptionsFlow } from "@/components/OptionsFlow";
import { StockChart } from "@/components/StockChart";
import { SocialFeed } from "@/components/SocialFeed";
import { MarketData } from "@/components/MarketData";

export default function Home() {
  const { user, logout } = useUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Options Flow</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Welcome, {user?.username}
            </span>
            <Button variant="outline" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <MarketData />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <StockChart />
              <OptionsFlow />
            </div>
            <div className="lg:col-span-4">
              <SocialFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}