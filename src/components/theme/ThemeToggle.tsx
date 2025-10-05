import useTheme from "./useTheme";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? "🌙 Dark" : "☀️ Light"}
    </Button>
  );
}
