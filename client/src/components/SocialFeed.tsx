import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useUser } from "@/hooks/use-user";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

type PostForm = {
  content: string;
  ticker?: string;
};

export function SocialFeed() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  const form = useForm<PostForm>({
    defaultValues: {
      content: "",
      ticker: "",
    },
  });

  const createPost = useMutation({
    mutationFn: async (data: PostForm) => {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      form.reset();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Feed</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={form.handleSubmit((data) => createPost.mutate(data))}
          className="space-y-4"
        >
          <Textarea
            placeholder="Share your market analysis..."
            {...form.register("content")}
          />
          <Button type="submit" disabled={createPost.isPending}>
            {createPost.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Post
          </Button>
        </form>

        <div className="space-y-4">
          {posts?.map((post: any) => (
            <div
              key={post.id}
              className="border border-border rounded-lg p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{post.user.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(post.createdAt), "PPp")}
                  </p>
                </div>
                {post.ticker && (
                  <span className="text-sm font-medium text-primary">
                    ${post.ticker}
                  </span>
                )}
              </div>
              <p className="text-sm">{post.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
