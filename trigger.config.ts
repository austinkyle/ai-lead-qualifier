import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_roqiqehzpseezwkmlspv",
  dirs: ["./trigger"],
  runtime: "node",
  logLevel: "info",
  maxDuration: 300, // 5 minutes — more than enough for a Claude API call
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
});
