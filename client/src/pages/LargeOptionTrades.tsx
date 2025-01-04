import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface LargeOptionTrade {
  id: string;
  ticker: string;
  strike_price: number;
  expiration_date: string;
  premium: number;
  contract_type: 'call' | 'put';
  size: number;
  timestamp: string;
}

export default function LargeOptionTrades() {
  const { data: trades, isLoading } = useQuery<LargeOptionTrade[]>({
    queryKey: ["/api/large-options"],
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Large Options Trades</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Premium Trades ($100k+)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Strike</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Premium</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades?.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>
                        {format(new Date(trade.timestamp), "HH:mm:ss")}
                      </TableCell>
                      <TableCell className="font-medium">{trade.ticker}</TableCell>
                      <TableCell>
                        <Badge
                          variant={trade.contract_type === "call" ? "default" : "destructive"}
                        >
                          {trade.contract_type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>${trade.strike_price}</TableCell>
                      <TableCell>
                        {format(new Date(trade.expiration_date), "MM/dd/yyyy")}
                      </TableCell>
                      <TableCell>{trade.size.toLocaleString()}</TableCell>
                      <TableCell>
                        ${(trade.premium / 1000).toFixed(1)}K
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
