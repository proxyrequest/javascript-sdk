import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    models: "src/models.ts",
    openapi: "src/openapi.ts",
  },
  format: ["esm", "cjs"],
  target: "es2022",
  platform: "neutral",
  dts: {
    sourcemap: true,
    cjsReexport: false,
  },
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  deps: {
    neverBundle: ["openapi-fetch"],
  },
});
