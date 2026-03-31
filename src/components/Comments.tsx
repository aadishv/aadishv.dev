import { ConvexClient } from "convex/browser";
import { For, Show, createMemo, createSignal, onCleanup } from "solid-js";
import { api } from "../../convex/_generated/api";
import HCaptchaModal from "./HCaptchaModal";
import useTheme from "./theme/useTheme";

interface Comment {
  _id: string;
  _creationTime: number;
  body: string;
}

interface CommentsProps {
  slug: string;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}.${dd}.${yy}`;
};

export default function Comments(props: CommentsProps) {
  const client = new ConvexClient(import.meta.env.PUBLIC_CONVEX_URL as string);

  const [comments, setComments] = createSignal<Comment[] | undefined>(
    undefined,
  );
  const [commentsError, setCommentsError] = createSignal<string | null>(null);
  const [body, setBody] = createSignal("");
  const [showCaptcha, setShowCaptcha] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const { isDark } = useTheme();

  const unsubscribe = client.onUpdate(
    api.comments.getComments,
    { slug: props.slug },
    (result) => {
      setComments(result as Comment[]);
      setCommentsError(null);
    },
    (error) => {
      setCommentsError(error.message);
    },
  );

  onCleanup(() => {
    unsubscribe();
    void client.close();
  });

  const canSubmit = createMemo(
    () => body().trim().length > 0 && !isSubmitting(),
  );
  const commentList = createMemo(() => comments() ?? []);

  const handleSubmitClick = () => {
    if (!canSubmit()) {
      return;
    }

    setErrorMessage(null);
    setShowCaptcha(true);
  };

  const submitComment = async (token: string) => {
    const nextBody = body().trim();
    if (!nextBody) {
      return;
    }

    setShowCaptcha(false);
    setIsSubmitting(true);

    try {
      const result = await client.action(api.comments.addComment, {
        slug: props.slug,
        body: nextBody,
        token,
      });

      if (result) {
        setErrorMessage(result.error);
        return;
      }

      setBody("");
      setErrorMessage(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to submit comment.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <HCaptchaModal
        open={showCaptcha()}
        theme={isDark() ? "dark" : "light"}
        disabled={isSubmitting()}
        onClose={() => setShowCaptcha(false)}
        onVerify={(token) => {
          void submitComment(token);
        }}
      />
      <section class="mt-12 border-t border-border pt-6">
        <h3 class="m-0 text-[1.1rem] font-medium" id="comment-component">
          Comments
        </h3>

        <div class="mt-6 space-y-4">
          <Show when={comments() === undefined && !commentsError()}>
            <p class="m-0 text-base text-muted-foreground">
              loading comments...
            </p>
          </Show>

          <Show when={commentsError()}>
            {(message) => <p class="m-0 text-base text-red-500">{message()}</p>}
          </Show>

          <For each={commentList()}>
            {(comment) => (
              <div class="grid grid-cols-[7ch_minmax(0,1fr)] items-start gap-x-3 gap-y-1">
                <div class="text-base font-medium tabular-nums">
                  {formatDate(comment._creationTime)}
                </div>
                <div class="min-w-0 break-words text-base font-normal [overflow-wrap:anywhere]">
                  {comment.body}
                </div>
              </div>
            )}
          </For>

          <Show
            when={
              comments() !== undefined &&
              !commentsError() &&
              commentList().length === 0
            }
          >
            <p class="m-0 text-base text-muted-foreground">no comments yet</p>
          </Show>
        </div>

        <div class="mt-6 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <input
            type="text"
            value={body()}
            onInput={(event) => setBody(event.currentTarget.value)}
            placeholder="write a comment..."
            class="min-w-0 border border-border bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground transition-colors focus:border-foreground focus:outline-hidden"
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
            class="border border-border bg-transparent px-4 py-2 text-base font-medium transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Show when={isSubmitting()} fallback="submit">
              submitting...
            </Show>
          </button>
        </div>

        <Show when={errorMessage()}>
          {(message) => (
            <p class="mt-3 mb-0 text-sm text-red-500">{message()}</p>
          )}
        </Show>
      </section>
    </>
  );
}
