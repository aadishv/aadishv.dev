import { Show, createEffect, createSignal, onCleanup } from "solid-js";

const HCAPTCHA_SCRIPT_SRC = "https://js.hcaptcha.com/1/api.js?render=explicit";

let hcaptchaScriptPromise: Promise<void> | null = null;

function loadHcaptchaScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.hcaptcha) {
    return Promise.resolve();
  }

  if (hcaptchaScriptPromise) {
    return hcaptchaScriptPromise;
  }

  hcaptchaScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${HCAPTCHA_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load hCaptcha.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = HCAPTCHA_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load hCaptcha."));
    document.head.append(script);
  });

  return hcaptchaScriptPromise;
}

interface HCaptchaModalProps {
  open: boolean;
  theme: "light" | "dark";
  disabled?: boolean;
  onClose: () => void;
  onVerify: (token: string) => void;
}

export default function HCaptchaModal(props: HCaptchaModalProps) {
  let containerRef: HTMLDivElement | undefined;
  let widgetId: string | number | undefined;
  let renderAttempt = 0;

  const [loadError, setLoadError] = createSignal<string | null>(null);

  const teardownWidget = () => {
    if (widgetId !== undefined && window.hcaptcha) {
      window.hcaptcha.remove(widgetId);
      widgetId = undefined;
    }

    if (containerRef) {
      containerRef.innerHTML = "";
    }
  };

  createEffect(() => {
    const open = props.open;
    const theme = props.theme;

    renderAttempt += 1;
    const currentAttempt = renderAttempt;

    if (!open) {
      setLoadError(null);
      teardownWidget();
      return;
    }

    setLoadError(null);

    void loadHcaptchaScript()
      .then(() => {
        if (!props.open || currentAttempt !== renderAttempt || !containerRef) {
          return;
        }

        teardownWidget();

        widgetId = window.hcaptcha?.render(containerRef, {
          sitekey: "8f643442-c6fa-4714-9888-52d4a11e7378",
          size: "normal",
          theme,
          callback: (token) => props.onVerify(token),
          "error-callback": () => {
            setLoadError("Captcha failed to load. Try again.");
          },
          "expired-callback": () => {
            teardownWidget();
            renderAttempt += 1;
          },
        });
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to load hCaptcha.";
        setLoadError(message);
      });
  });

  onCleanup(() => {
    teardownWidget();
  });

  return (
    <Show when={props.open}>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        onClick={() => {
          if (!props.disabled) {
            props.onClose();
          }
        }}
      >
        <div
          class="min-h-32 min-w-80 border border-border bg-background p-4 shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div
            ref={containerRef}
            class="flex min-h-20 items-center justify-center"
          />
          <Show when={!loadError()}>
            <p class="mt-3 text-center text-sm text-muted-foreground">
              Complete the captcha to post your comment.
            </p>
          </Show>
          <Show when={loadError()}>
            {(message) => (
              <p class="mt-3 text-center text-sm text-red-500">{message()}</p>
            )}
          </Show>
        </div>
      </div>
    </Show>
  );
}
