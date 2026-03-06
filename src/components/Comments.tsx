import { createSignal, onCleanup, onMount, For, Show } from "solid-js";
import { ConvexClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const SITEKEY = "8f643442-c6fa-4714-9888-52d4a11e7378";

interface Comment {
  _id: string;
  _creationTime: number;
  body: string;
}

function fmtDate(ts: number) {
  const d = new Date(ts);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}.${String(d.getFullYear()).slice(-2)}`;
}

export default function Comments(props: { slug: string }) {
  const client = new ConvexClient(import.meta.env.PUBLIC_CONVEX_URL);
  const [comments, setComments] = createSignal<Comment[] | undefined>(
    undefined,
  );
  const [body, setBody] = createSignal("");
  const [submitting, setSubmitting] = createSignal(false);
  const [showCaptcha, setShowCaptcha] = createSignal(false);

  const unsub = client.onUpdate(
    api.comments.getComments,
    { slug: props.slug },
    (result) => setComments(result as Comment[]),
  );

  onMount(async () => {
    // side-effect import registers <h-captcha> custom element
    await import("@hcaptcha/vanilla-hcaptcha");
  });

  onCleanup(() => {
    unsub();
    client.close();
  });

  async function onVerified(e: Event) {
    const token = (e as CustomEvent<{ token: string }>).detail.token;
    setShowCaptcha(false);
    setSubmitting(true);
    try {
      const result = await client.action(api.comments.addComment, {
        slug: props.slug,
        body: body().trim(),
        token,
      });
      if (result?.error) alert(result.error);
      else setBody("");
    } catch {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div class="mt-12 border-t border-border pt-6">
      <table class="w-full">
        <tbody>
          <tr class="flex w-full mb-4">
            <td class="flex-0 w-[9ch]">&nbsp;</td>
            <td class="flex-1 text-start">
              <h3 class="font-medium text-aadish m-0" id="comment-component">
                Comments
              </h3>
            </td>
          </tr>
        </tbody>
        <tbody>
          <Show
            when={comments() !== undefined}
            fallback={
              <tr class="flex mb-2">
                <td class="text-base !font-normal w-[9ch]">&nbsp;</td>
                <td class="text-base !font-normal flex-1 ml-1.5 pl-2 text-muted-foreground">
                  loading...
                </td>
              </tr>
            }
          >
            <Show
              when={(comments() ?? []).length > 0}
              fallback={
                <tr class="flex mb-2">
                  <td class="text-base !font-normal w-[9ch]">&nbsp;</td>
                  <td class="text-base !font-normal flex-1 ml-1.5 pl-2 text-muted-foreground">
                    no comments yet
                  </td>
                </tr>
              }
            >
              <For each={comments()}>
                {(c) => (
                  <tr class="flex mb-3">
                    <td class="text-base !font-normal w-[9ch]">
                      <span class="flex font-medium align-baseline">
                        <span class="ml-auto mr-1.5">
                          {fmtDate(c._creationTime)}
                        </span>
                      </span>
                    </td>
                    <td class="ml-0.5 text-base !font-normal flex-1 align-baseline">
                      {c.body}
                    </td>
                  </tr>
                )}
              </For>
            </Show>
          </Show>
        </tbody>
      </table>
      <div class="mt-6">
        <table class="w-full">
          <tbody>
            <tr class="flex">
              <td class="flex-0 w-[9ch]">&nbsp;</td>
              <td class="flex-1 flex gap-3 pr-3 pb-3">
                <input
                  type="text"
                  placeholder="write a comment..."
                  maxLength={200}
                  value={body()}
                  onInput={(e) => setBody(e.currentTarget.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && body().trim() && setShowCaptcha(true)
                  }
                  class="flex-1 bg-transparent border border-border px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-hidden focus:border-aadish transition-colors"
                />
                <button
                  type="button"
                  disabled={!body().trim() || submitting()}
                  onClick={() => setShowCaptcha(true)}
                  class="px-4 py-2 text-base font-medium bg-transparent border border-border hover:border-aadish hover:text-aadish disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting() ? "..." : "submit"}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Show when={showCaptcha()}>
        <div
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowCaptcha(false)}
        >
          {/* @ts-expect-error custom element */}
          <h-captcha
            site-key={SITEKEY}
            theme={
              document.documentElement.classList.contains("dark")
                ? "dark"
                : "light"
            }
            on:verified={onVerified}
          />
        </div>
      </Show>
    </div>
  );
}
