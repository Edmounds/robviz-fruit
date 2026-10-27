import { mkdtemp, mkdir, writeFile, symlink, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { build, createServer, type InlineConfig } from "vite";
import { DEFAULT_PLUGIN_IDS, packagePathSchema, pluginManifestSchema } from "../../src/plugins/manifest";
import { parsePluginDefinition } from "../../src/plugins/definition";
import { catalogSchema, installCatalogPlugin, pluginFilesPlugin, readPackage, recoverPluginTransaction, scanPlugins, withPluginLock } from "../../scripts/plugin-files";

const manifest = { id: "sample", name: "Sample", version: "1.0.0", sdkApiVersion: 1, entry: "index.js", files: ["index.js"], requiredServices: [] };
const directories: string[] = [];
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "robviz-package-"));
  directories.push(root);
  await mkdir(join(root, "sample"));
  await writeFile(join(root, "sample", "manifest.json"), JSON.stringify(manifest));
  await writeFile(join(root, "sample", "index.js"), "export default {id:'sample',name:'Sample'};");
  return root;
}
afterEach(async () => { await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true }))); });

describe("plugin package protocol", () => {
  it.each(["../index.js", "/index.js", "a/../index.js", "a//index.js", "a\\index.js", "%2e%2e/index.js", "https://example.com/index.js", "index.js?v=1", "index.js#x"])("rejects unsafe resource path %s", (path) => {
    expect(packagePathSchema.safeParse(path).success).toBe(false);
  });
  it("validates SDK version, package files and unsupported dependencies", () => {
    expect(pluginManifestSchema.parse(manifest).id).toBe("sample");
    expect(pluginManifestSchema.safeParse({ ...manifest, sdkApiVersion: 2 }).success).toBe(false);
    expect(pluginManifestSchema.safeParse({ ...manifest, entry: "missing.js" }).success).toBe(false);
    expect(pluginManifestSchema.safeParse({ ...manifest, files: ["index.js", "index.js"] }).success).toBe(false);
    expect(pluginManifestSchema.safeParse({ ...manifest, dependencies: ["another-plugin"] }).success).toBe(false);
  });
  it("checks evaluated module definitions and namespace ids", () => {
    expect(parsePluginDefinition({ id: "sample", name: "Sample", sections: [{ id: "main", title: "Main", component: () => null }] }, "sample").id).toBe("sample");
    expect(() => parsePluginDefinition({ id: "other", name: "Other" }, "sample")).toThrow();
    expect(() => parsePluginDefinition({ id: "sample", name: "Sample", sections: [{ id: "main", title: "Main", component: 7 }] }, "sample")).toThrow();
    const tool = { id: "tool", component: () => null };
    const settings = { id: "settings", title: "Settings", component: () => null };
    expect(parsePluginDefinition({ id: "sample", name: "Sample", toolbarTools: [tool], settings: [settings] }, "sample").toolbarTools).toHaveLength(1);
    expect(() => parsePluginDefinition({ id: "sample", name: "Sample", toolbarTools: [tool, tool] }, "sample")).toThrow("Duplicate");
    expect(() => parsePluginDefinition({ id: "sample", name: "Sample", settings: [settings, settings] }, "sample")).toThrow("Duplicate");
  });
  it("indexes a complete package and isolates an invalid package", async () => {
    const root = await fixture();
    await mkdir(join(root, "broken"));
    const index = await scanPlugins(root);
    expect(index.plugins.map((plugin) => plugin.id)).toEqual(["sample"]);
    expect(index.errors.map((error) => error.id)).toEqual(["broken"]);
    expect(JSON.parse(await readFile(join(root, "index.json"), "utf8"))).toEqual(index);
  });
  it("rejects symbolic links, including intermediate asset directories", async () => {
    const root = await fixture();
    await writeFile(join(root, "outside.js"), "export default {};");
    await rm(join(root, "sample", "index.js"));
    await symlink(join(root, "outside.js"), join(root, "sample", "index.js"));
    await expect(readPackage(root, "sample")).rejects.toThrow("symlinks");
    await rm(join(root, "sample", "index.js"));
    await writeFile(join(root, "sample", "index.js"), "export default {};");
    await mkdir(join(root, "assets"));
    await writeFile(join(root, "assets", "data.json"), "{}");
    await symlink(join(root, "assets"), join(root, "sample", "assets"));
    await writeFile(join(root, "sample", "manifest.json"), JSON.stringify({ ...manifest, files: ["index.js", "assets/data.json"] }));
    await expect(readPackage(root, "sample")).rejects.toThrow("symlinks");
  });

  it("installs verified catalog files and preserves the old package on bad downloads", async () => {
    const root = await fixture();
    const files: Record<string, Buffer> = {
      "manifest.json": Buffer.from(JSON.stringify({ ...manifest, version: "1.1.0" })),
      "index.js": Buffer.from("export default {id:'sample',name:'New version'};"),
    };
    const catalog = { sdkApiVersion: 1, plugins: [{ id: "sample", version: "1.1.0", directory: "sample",
      sha256: Object.fromEntries(Object.entries(files).map(([name, data]) => [name, createHash("sha256").update(data).digest("hex")])) }] };
    await withPluginLock(root, () => installCatalogPlugin(root, catalog, "sample", async (path) => files[path.split("/").at(-1)!]));
    expect((await readPackage(root, "sample")).version).toBe("1.1.0");
    const before = await readFile(join(root, "index.json"), "utf8");
    await expect(withPluginLock(root, () => installCatalogPlugin(root, catalog, "sample", async () => Buffer.from("corrupted")))).rejects.toThrow("checksum");
    expect((await readPackage(root, "sample")).version).toBe("1.1.0");
    expect(await readFile(join(root, "index.json"), "utf8")).toBe(before);
    expect(catalogSchema.safeParse({ ...catalog, plugins: [...catalog.plugins, ...catalog.plugins] }).success).toBe(false);
  });

  it("recovers an interrupted directory swap and serializes writers", async () => {
    const root = await fixture();
    const { rename } = await import("node:fs/promises");
    await rename(join(root, "sample"), join(root, ".previous-sample"));
    await mkdir(join(root, "sample"));
    await writeFile(join(root, "sample", "index.js"), "broken");
    await mkdir(join(root, ".stage-test"));
    await writeFile(join(root, ".transaction.json"), JSON.stringify({ id: "sample", stage: ".stage-test", hadOld: true }));
    await withPluginLock(root, async () => {
      await expect(withPluginLock(root, async () => undefined)).rejects.toThrow("locked");
      await recoverPluginTransaction(root);
    });
    expect((await readPackage(root, "sample")).version).toBe("1.0.0");
    expect(JSON.parse(await readFile(join(root, "index.json"), "utf8")).plugins[0].id).toBe("sample");
  });

  it("emits only declared default-plugin assets and rejects symlinks in static builds", async () => {
    const root = await fixture();
    for (const id of [...DEFAULT_PLUGIN_IDS, "private-fruit"]) {
      const dir = join(root, "plugins", id);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, "manifest.json"), JSON.stringify({ ...manifest, id }));
      await writeFile(join(dir, "index.js"), `export default {id:'${id}'};`);
      await writeFile(join(dir, "index.tsx"), "private source, not a declared runtime asset");
    }
    const config: InlineConfig = { root, configFile: false, publicDir: false, logLevel: "silent",
      plugins: [pluginFilesPlugin(join(root, "private-runtime"))],
      build: { write: false, rolldownOptions: { input: join(root, "sample", "index.js") } } };
    const result = await build(config);
    if (Array.isArray(result) || !("output" in result)) throw new Error("Expected one static build");
    const assets = new Map(result.output.filter((file) => file.type === "asset").map((file) => [file.fileName, String(file.source)]));
    const index = JSON.parse(assets.get("plugins/index.json")!);
    expect(index.plugins.map((plugin: { id: string }) => plugin.id)).toEqual(DEFAULT_PLUGIN_IDS);
    expect(index.errors).toEqual([]);
    expect([...assets.keys()].sort()).toEqual(["plugins/index.json", ...DEFAULT_PLUGIN_IDS.flatMap((id) =>
      [`plugins/${id}/manifest.json`, `plugins/${id}/index.js`])].sort());
    for (const id of DEFAULT_PLUGIN_IDS) {
      expect(assets.get(`plugins/${id}/index.js`)).toBe(await readFile(join(root, "plugins", id, "index.js"), "utf8"));
    }
    await rm(join(root, "plugins", "image", "index.js"));
    await symlink(join(root, "sample", "index.js"), join(root, "plugins", "image", "index.js"));
    await expect(build(config)).rejects.toThrow("symlinks");
  });

  it("rejects web uninstall and catalog replacement of default plugins without deleting sources", async () => {
    const root = await fixture();
    await mkdir(join(root, "image"));
    const original = { ...manifest, id: "image" };
    await writeFile(join(root, "image", "manifest.json"), JSON.stringify(original));
    await writeFile(join(root, "image", "index.js"), "original output");
    await writeFile(join(root, "image", "index.tsx"), "local source edits");
    const server = await createServer({ configFile: false, root, logLevel: "silent",
      plugins: [pluginFilesPlugin(root)], server: { host: "127.0.0.1", port: 0 } });
    try {
      await server.listen();
      const address = server.httpServer!.address();
      if (!address || typeof address === "string") throw new Error("Expected HTTP test server");
      const response = await fetch(`http://127.0.0.1:${address.port}/plugin-management/uninstall`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: "image" }),
      });
      expect(response.status).toBe(400);
      expect((await response.json()).error).toContain("updated with Core");
      const files: Record<string, Buffer> = { "manifest.json": Buffer.from(JSON.stringify({ ...original, version: "2.0.0" })), "index.js": Buffer.from("replacement") };
      const catalog = { sdkApiVersion: 1, plugins: [{ id: "image", version: "2.0.0", directory: "image",
        sha256: Object.fromEntries(Object.entries(files).map(([name, bytes]) => [name, createHash("sha256").update(bytes).digest("hex")])) }] };
      await expect(withPluginLock(root, () => installCatalogPlugin(root, catalog, "image", async (path) => files[path.split("/").at(-1)!]))).rejects.toThrow("updated with Core");
      expect((await readPackage(root, "image")).version).toBe("1.0.0");
      expect(await readFile(join(root, "image", "index.js"), "utf8")).toBe("original output");
      expect(await readFile(join(root, "image", "index.tsx"), "utf8")).toBe("local source edits");
    } finally { await server.close(); }
  });
});
