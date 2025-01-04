import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

// Mock data - will be replaced with real data later
const trendingStocks = [
  { symbol: "AAPL", name: "Apple Inc.", popularity: 98 },
  { symbol: "TSLA", name: "Tesla, Inc.", popularity: 95 },
  { symbol: "NVDA", name: "NVIDIA Corporation", popularity: 92 },
  { symbol: "AMD", name: "Advanced Micro Devices", popularity: 88 },
  { symbol: "META", name: "Meta Platforms", popularity: 85 },
  { symbol: "MSFT", name: "Microsoft Corporation", popularity: 82 },
  { symbol: "AMZN", name: "Amazon.com Inc.", popularity: 80 },
  { symbol: "GOOGL", name: "Alphabet Inc.", popularity: 78 },
];

export function TrendingStocks() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [news, setNews] = useState<any[]>([]);

  const fetchNews = async (symbol: string) => {
    setNewsLoading(true);
    try {
      // This will be replaced with real API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNews([
        {
          id: 1,
          title: `Latest news for ${symbol}`,
          description: "Sample news description will be replaced with real MarketWatch data",
          url: "https://www.marketwatch.com",
          date: new Date().toLocaleDateString(),
        },
      ]);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleStockClick = async (symbol: string) => {
    setSelectedStock(symbol);
    setNewsDialogOpen(true);
    await fetchNews(symbol);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trending Stocks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2">
            {trendingStocks.map((stock, index) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-between hover:bg-accent"
                  onClick={() => handleStockClick(stock.symbol)}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{stock.symbol}</span>
                    <span className="text-muted-foreground">{stock.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-primary">
                      {stock.popularity}% interest
                    </span>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {selectedStock} News
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            {newsLoading ? (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </motion.div>
              </div>
            ) : (
              <div className="space-y-4">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.date}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="ml-2 flex-shrink-0"
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
