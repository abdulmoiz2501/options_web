import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, Activity } from "lucide-react";

// Mock data - will be replaced with real data later
const mockMarketData = {
  marketCap: "2.1T",
  volume: "52.4B",
  trending: [
    { symbol: "AAPL", change: "+2.3%" },
    { symbol: "TSLA", change: "-1.2%" },
    { symbol: "NVDA", change: "+3.1%" },
  ],
  volatility: "High",
};

export function MarketData() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-2xl font-bold"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              ${mockMarketData.marketCap}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-2xl font-bold"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              ${mockMarketData.volume}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockMarketData.trending.map((stock, index) => (
                <motion.div
                  key={stock.symbol}
                  className="flex items-center justify-between"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="font-medium">{stock.symbol}</span>
                  <span
                    className={
                      stock.change.startsWith("+")
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {stock.change}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Volatility</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-2xl font-bold"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              {mockMarketData.volatility}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
