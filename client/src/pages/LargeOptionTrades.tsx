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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OptionContract {
  ticker: string;
  underlying_ticker: string;
  strike_price: number;
  expiration_date: string;
  contract_type: "call" | "put";
  shares_per_contract: number;
}

const STOCK_SYMBOLS = [
  "AAPL", "TSLA", "MSFT", "GOOGL", "NVDA",
  "AMZN", "FB", "BRK.B", "V", "JNJ",
  "JPM", "UNH", "MA", "PG", "DIS"
];

export default function LargeOptionTrades() {
  const { data: contracts, isLoading, error } = useQuery<OptionContract[]>({
    queryKey: ["options-contracts"],
    queryFn: async () => {
      try {
        console.log("Fetching data for stock symbols:", STOCK_SYMBOLS);

        const responses = await Promise.all(
          STOCK_SYMBOLS.map(async (symbol) => {
            const url = `https://api.polygon.io/v3/reference/options/contracts?underlying_ticker=${symbol}&limit=20&apiKey=qBSnUkjN2be9SZeJTFID7Q_2q5LdJBD0`;
            console.log(`Fetching data for symbol: ${symbol} -> ${url}`);

            const response = await fetch(url);

            if (!response.ok) {
              console.error(`Error fetching data for ${symbol}:`, response.status, response.statusText);
              return []; // Return an empty array for failed requests
            }

            const data = await response.json();
            console.log(`Response for ${symbol}:`, data);

            return data.results || [];
          })
        );

        const allContracts = responses.flat();
        console.log("Combined contracts data:", allContracts);

        return allContracts;
      } catch (err) {
        console.error("Error during fetching options contracts:", err);
        return []; // Return empty array on total failure
      }
    },
  });

  // Filtering logic
 // Filtering logic - Adjusted to fit the data
const scalps = contracts?.filter(
  (contract) => contract.strike_price < 100 && contract.contract_type === "call"
);

const unusual = contracts?.filter(
  (contract) => contract.strike_price > 200 && contract.contract_type === "put"
);

const goldenSweeps = contracts?.filter(
  (contract) =>
    contract.contract_type === "call" &&
    contract.strike_price > 500 // Adjusting since shares_per_contract is always 100
);

// Debug logs to check filtered data
console.log("Scalps Data:", scalps);
console.log("Unusual Data:", unusual);
console.log("Golden Sweeps Data:", goldenSweeps);


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
            <h1 className="text-2xl font-bold">Options Data</h1>
          </div>
        </div>

        <Tabs defaultValue="flow" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="flow">Flow Feed</TabsTrigger>
            <TabsTrigger value="scalps">Scalps</TabsTrigger>
            <TabsTrigger value="unusual">Unusual</TabsTrigger>
            <TabsTrigger value="golden">Golden Sweeps</TabsTrigger>
            <TabsTrigger value="frc">FRC AI Sweeps</TabsTrigger>
            <TabsTrigger value="premium">Premium ($100K+)</TabsTrigger>
          </TabsList>

          {/* Flow Feed */}
          <TabsContent value="flow">
            <OptionTable data={contracts} isLoading={isLoading} error={error} title="Flow Feed" />
          </TabsContent>

          {/* Scalps */}
          <TabsContent value="scalps">
            <OptionTable data={scalps} isLoading={isLoading} error={error} title="Scalps" />
          </TabsContent>

          {/* Unusual */}
          <TabsContent value="unusual">
            <OptionTable data={unusual} isLoading={isLoading} error={error} title="Unusual Trades" />
          </TabsContent>

          {/* Golden Sweeps */}
          <TabsContent value="golden">
            <OptionTable data={goldenSweeps} isLoading={isLoading} error={error} title="Golden Sweeps" />
          </TabsContent>

          {/* Other Tabs Coming Soon */}
          {["frc", "premium"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{tab}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    Coming soon...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

// Reusable Table Component
function OptionTable({ data, isLoading, error, title }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex justify-center py-8 text-red-500">Error fetching data.</div>
        ) : data && data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Strike</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Shares/Contract</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((contract: OptionContract) => (
                <TableRow key={contract.ticker}>
                  <TableCell className="font-medium">{contract.underlying_ticker}</TableCell>
                  <TableCell>
                    <Badge variant={contract.contract_type === "call" ? "default" : "destructive"}>
                      {contract.contract_type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>${contract.strike_price}</TableCell>
                  <TableCell>{format(new Date(contract.expiration_date), "MM/dd/yyyy")}</TableCell>
                  <TableCell>{contract.shares_per_contract}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex justify-center py-8">No data available.</div>
        )}
      </CardContent>
    </Card>
  );
}
