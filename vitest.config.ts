// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts"],
    },
  },
});
