import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { DEFAULT_PLUGIN_IDS, pluginManifestSchema } from "../src/plugins/manifest.ts";
import { readPackage } from "./plugin-files.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const external = ["@robviz/core", "react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "three"];

for (const id of DEFAULT_PLUGIN_IDS) {
  const manifest = pluginManifestSchema.parse(JSON.parse(await readFile(new URL(`../plugins/${id}/manifest.json`, import.meta.url), "utf8")));
  if (manifest.id !== id) throw new Error(`Plugin id does not match directory: ${id}`);
  await build({
    root,
    configFile: false,
    publicDir: false,
    build: {
      outDir: `plugins/${id}`,
      emptyOutDir: false,
      lib: { entry: `plugins/${id}/index.tsx`, formats: ["es"], fileName: () => "index.js", cssFileName: "style" },
      rolldownOptions: { external, output: { codeSplitting: false } },
    },
  });
  await readPackage(`${root}plugins`, id);
}
