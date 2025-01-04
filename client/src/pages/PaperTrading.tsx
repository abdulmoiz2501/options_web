import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "wouter";

interface TradeForm {
  symbol: string;
  amount: number;
  type: 'call' | 'put';
  expiry: string;
  strike: number;
}

export default function PaperTrading() {
  const [position, setPosition] = useState<any>(null);
  const [riskAssessment, setRiskAssessment] = useState<string | null>(null);

  const form = useForm<TradeForm>({
    defaultValues: {
      symbol: "",
      amount: 1000,
      type: 'call',
      expiry: "",
      strike: 0,
    },
  });

  const onSubmit = async (data: TradeForm) => {
    // Calculate max loss
    const maxLoss = data.type === 'call' ? data.amount : data.strike * 100;
    
    // Simple risk assessment
    const riskLevel = maxLoss > 5000 ? 'HIGH' : maxLoss > 2000 ? 'MEDIUM' : 'LOW';
    setRiskAssessment(`Risk Level: ${riskLevel} - Max Loss: $${maxLoss.toLocaleString()}`);

    // Simulate position
    setPosition({
      ...data,
      entryPrice: data.strike,
      currentPrice: data.strike,
      pnl: 0,
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Paper Trading Simulator</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>New Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symbol</FormLabel>
                        <FormControl>
                          <Input placeholder="AAPL" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Option Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select option type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="call">Call</SelectItem>
                            <SelectItem value="put">Put</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="strike"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strike Price</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Simulate Trade
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {riskAssessment && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{riskAssessment}</AlertDescription>
            </Alert>
          )}

          {position && (
            <Card>
              <CardHeader>
                <CardTitle>Current Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="font-medium">{position.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{position.type.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entry Price:</span>
                    <span className="font-medium">${position.entryPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Price:</span>
                    <span className="font-medium">${position.currentPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">P&L:</span>
                    <span className={`font-medium ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${position.pnl}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
