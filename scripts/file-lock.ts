import { spawn } from "node:child_process";
import { lstat, mkdir } from "node:fs/promises";
import { join } from "node:path";

/** The OS releases this advisory lock even after process termination. */
export async function withPluginLock<T>(root: string, action: () => Promise<T>): Promise<T> {
  await mkdir(root, { recursive: true });
  const base = await lstat(root);
  if (!base.isDirectory() || base.isSymbolicLink()) throw new Error("Invalid lock directory");
  const lock = join(root, ".write-lock");
  const info = await lstat(lock).catch((error: NodeJS.ErrnoException) => { if (error.code !== "ENOENT") throw error; });
  if (info?.isSymbolicLink()) throw new Error("Invalid lock file");
  const child = spawn("flock", ["-n", lock, process.execPath, "-e", 'process.stdout.write("locked");process.stdin.resume();'], { stdio: ["pipe", "pipe", "ignore"] });
  const exited = new Promise<void>((accept) => child.once("exit", () => accept()));
  await new Promise<void>((accept, reject) => {
    child.once("error", () => reject(new Error("flock is required for configuration and plugin management")));
    child.once("exit", () => reject(new Error("Directory is locked")));
    child.stdout.once("data", () => accept());
  });
  try { return await action(); }
  finally { child.stdin.end(); await exited; }
}
