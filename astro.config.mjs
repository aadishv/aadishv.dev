import { defineConfig } from "astro/config";

import react from "@astrojs/react";

export default defineConfig({
  site: "https://aadishv.github.io",
  base: "/",
  integrations: [react()],
});