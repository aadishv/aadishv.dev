import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";
import { ConvexHttpClient } from "convex/browser";
import { For, Show, createMemo, createSignal } from "solid-js";
import { api } from "../../convex/_generated/api";
import HCaptchaModal from "./HCaptchaModal";
import useTheme from "./theme/useTheme";

interface CommentsProps {
  slug: string;
}

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL as string);

const commentsQueryKey = (slug: string) => ["comments", slug] as const;

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}.${dd}.${yy}`;
};

export default function Comments(props: CommentsProps) {
  const [body, setBody] = createSignal("");
  const [showCaptcha, setShowCaptcha] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const queryClient = useQueryClient();
  const { isDark } = useTheme();

  const comments = createQuery(() => ({
    queryKey: commentsQueryKey(props.slug),
    queryFn: () => convex.query(api.comments.getComments, { slug: props.slug }),
  }));

  const addComment = createMutation(() => ({
    mutationFn: async (token: string) => {
      const nextBody = body().trim();
      const result = await convex.action(api.comments.addComment, {
        slug: props.slug,
        body: nextBody,
        token,
      });

      if (result) {
        throw new Error(result.error);
      }
    },
    onSuccess: async () => {
      setBody("");
      setErrorMessage(null);
      setShowCaptcha(false);
      await queryClient.invalidateQueries({
        queryKey: commentsQueryKey(props.slug),
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to submit comment.";
      setErrorMessage(message);
      setShowCaptcha(false);
    },
  }));

  const canSubmit = createMemo(() => body().trim().length > 0 && !addComment.isPending);
  const commentList = createMemo(() => comments.data ?? []);

  const handleSubmitClick = () => {
    if (!canSubmit()) {
      return;
    }

    setErrorMessage(null);
    setShowCaptcha(true);
  };

  return (
    <>
      <HCaptchaModal
        open={showCaptcha()}
        theme={isDark() ? "dark" : "light"}
        disabled={addComment.isPending}
        onClose={() => setShowCaptcha(false)}
        onVerify={(token) => {
          void addComment.mutateAsync(token);
        }}
      />
      <div class="mt-12 border-t border-border pt-6">
        <table class="w-full">
          <tbody>
            <tr class="mb-4 flex w-full">
              <td class="w-[9ch] flex-0">&nbsp;</td>
              <td class="flex-1 text-start">
                <h3 class="m-0 font-medium" id="comment-component">
                  Comments
                </h3>
              </td>
            </tr>
            <Show when={comments.isPending}>
              <tr class="mb-2 flex">
                <td class="w-[9ch] text-base font-normal">&nbsp;</td>
                <td class="ml-1.5 flex-1 pl-2 text-base font-normal text-muted-foreground">
                  loading comments...
                </td>
              </tr>
            </Show>
            <Show when={comments.isError}>
              <tr class="mb-2 flex">
                <td class="w-[9ch] text-base font-normal">&nbsp;</td>
                <td class="ml-1.5 flex-1 pl-2 text-base font-normal text-red-500">
                  failed to load comments
                </td>
              </tr>
            </Show>
            <For each={commentList()}>
              {(comment) => (
                <tr class="mb-3 flex">
                  <td class="w-[9ch] text-base font-normal">
                    <span class="flex align-baseline font-medium">
                      <span class="ml-auto mr-1.5">
                        {formatDate(comment._creationTime)}
                      </span>
                    </span>
                  </td>
                  <td class="ml-0.5 flex-1 align-baseline text-base font-normal">
                    {comment.body}
                  </td>
                </tr>
              )}
            </For>
            <Show
              when={
                !comments.isPending && !comments.isError && commentList().length === 0
              }
            >
              <tr class="mb-2 flex">
                <td class="w-[9ch] text-base font-normal">&nbsp;</td>
                <td class="ml-1.5 flex-1 pl-2 text-base font-normal text-muted-foreground">
                  no comments yet
                </td>
              </tr>
            </Show>
          </tbody>
        </table>
        <div class="mt-6">
          <table class="w-full">
            <tbody>
              <tr class="flex">
                <td class="w-[9ch] flex-0">&nbsp;</td>
                <td class="flex flex-1 gap-3 pr-3 pb-3">
                  <input
                    type="text"
                    value={body()}
                    onInput={(event) => setBody(event.currentTarget.value)}
                    placeholder="write a comment..."
                    class="flex-1 border border-border bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground transition-colors focus:border-foreground focus:outline-hidden"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSubmitClick();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSubmitClick}
                    disabled={!canSubmit()}
                    class="px-4 py-2 text-base font-medium bg-transparent border border-border hover:border-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Show when={addComment.isPending} fallback="submit">
                      submitting...
                    </Show>
                  </button>
                </td>
              </tr>
              <Show when={errorMessage()}>
                {(message) => (
                  <tr class="flex">
                    <td class="w-[9ch] flex-0">&nbsp;</td>
                    <td class="flex-1 text-sm text-red-500">{message()}</td>
                  </tr>
                )}
              </Show>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
