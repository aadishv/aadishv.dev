import { createSignal, onCleanup, onMount } from "solid-js";

export default function useTheme() {
  const [isDark, setIsDark] = createSignal(false);

  onMount(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    onCleanup(() => observer.disconnect());
  });

  return { isDark };
}
