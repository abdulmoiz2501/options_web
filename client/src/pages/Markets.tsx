import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Newspaper } from "lucide-react";
import { Link } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { format } from "date-fns";

// Define your API Key
const API_KEY = "e6028ca7e1mshcedd69de9360a63p107b54jsnb7ab54c32578";
const API_HOST = "yahoo-finance15.p.rapidapi.com";

// Define NewsItem interface
interface NewsItem {
  url: string;
  img: string;
  title: string;
  text: string;
  source: string;
  time: string;
}

// Fetch News Data
const fetchNews = async () => {
  const response = await fetch(
    "https://yahoo-finance15.p.rapidapi.com/api/v2/markets/news?type=ALL",
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }

  const data = await response.json();
  return data.body as NewsItem[];
};

export default function Markets() {
  // Use react-query to fetch news
  const { data: news, error, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["marketNews"],
    queryFn: fetchNews,
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Markets</h1>
        </div>

        <Tabs defaultValue="news" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="news">
              <Newspaper className="h-4 w-4 mr-2" />
              News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle>Market News</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {isLoading && <p>Loading news...</p>}
                    {error && <p>Error fetching news.</p>}
                    {news?.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {item.img && (
                            <img
                              src={item.img}
                              alt={item.title}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                          )}
                          <h3 className="font-medium mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.text}
                          </p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{item.source}</span>
                            <span>
                              {format(new Date(item.time), "MMM d, h:mm a")}
                            </span>
                          </div>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
