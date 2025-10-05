import { useEffect, useState } from "react";
import useTheme from "./useTheme";
import { Button } from "@/components/ui/button";

type Theme = "dark" | "light" | "system";

export default function ThemeToggle() {
  try {
    localStorage;
  } catch {
    return null;
  }
  const setHtmlTheme = (t: "light" | "dark") => {
    console.log(t);
    if (t == "light") {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
      }
    } else {
      if (!document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.add("dark");
      }
    }
  };
  const [theme, setThemeDoNotUse] = useState<Theme>(() => {
    const v = (localStorage.getItem("theme") ?? "system") as Theme;
    if (v !== "system") {
      setHtmlTheme(v);
    }
    return v;
  });
  const setTheme = (t: Theme) => {
    setThemeDoNotUse(t);
    localStorage.setItem("theme", t);
  };

  useEffect(() => {
    if (theme === "system" && window.matchMedia) {
      const controller = new AbortController();
      const query = window.matchMedia("(prefers-color-scheme: dark)");
      if (query.matches) {
        setHtmlTheme("dark");
      } else {
        setHtmlTheme("light");
      }
      query.addEventListener(
        "change",
        (event) => {
          if (event.matches) {
            setHtmlTheme("dark");
          } else {
            setHtmlTheme("light");
          }
        },
        { signal: controller.signal },
      );
      return () => controller.abort();
    }
  }, [theme]);
  return (
    <Button
      variant="ghost"
      onClick={() => {
        // system -> light -> dark -> system
        if (theme === "system") {
          setTheme("light");
          setHtmlTheme("light");
        } else if (theme === "light") {
          setTheme("dark");
          setHtmlTheme("dark");
        } else if (theme === "dark") {
          setTheme("system");
        }
      }}
      aria-label="Toggle theme"
    >
      {theme == "dark" && "🌙 Dark"}
      {theme == "light" && "☀️ Light"}
      {theme == "system" && "⚙️ System"}
    </Button>
  );
}
