declare function renderMathInElement(
  element: HTMLElement,
  options?: any,
): void;

interface HCaptchaRenderOptions {
  sitekey: string;
  size?: "normal" | "compact" | "invisible";
  theme?: "light" | "dark";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

interface HCaptchaApi {
  render: (
    container: string | HTMLElement,
    options: HCaptchaRenderOptions,
  ) => string | number;
  reset: (widgetId?: string | number) => void;
  remove: (widgetId?: string | number) => void;
}

declare global {
  interface Window {
    hcaptcha?: HCaptchaApi;
  }
}

export {};
