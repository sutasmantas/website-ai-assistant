import vinext from "vinext";
import { defineConfig } from "vite";

// Local publication-capture runtime. The deployed site keeps the full
// Cloudflare/Sites configuration in vite.config.ts; media capture needs only
// the application and its server routes.
export default defineConfig({
  plugins: [vinext()],
});
