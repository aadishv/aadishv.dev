import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/solid-query";
import Comments from "./Comments";

const queryClient = new QueryClient();

export default function ConvexComments({ slug }: { slug: string }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Comments slug={slug} />
    </QueryClientProvider>
  );
}
