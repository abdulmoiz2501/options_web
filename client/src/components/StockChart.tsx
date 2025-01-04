import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const demoData = [
  { date: "2024-01", price: 150 },
  { date: "2024-02", price: 180 },
  { date: "2024-03", price: 165 },
  { date: "2024-04", price: 200 },
  { date: "2024-05", price: 190 },
  { date: "2024-06", price: 220 },
];

export function StockChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={demoData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
