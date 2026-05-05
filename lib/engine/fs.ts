import type { VFile, VFiles } from "../types";

export function normalizePath(input: string, cwd: string): string {
  let path = input;
  if (!path.startsWith("/")) {
    path = `${cwd.replace(/\/$/, "")}/${path}`;
  }
  const parts = path.split("/").filter(Boolean);
  const stack: string[] = [];
  for (const p of parts) {
    if (p === ".") continue;
    if (p === "..") {
      stack.pop();
      continue;
    }
    stack.push(p);
  }
  return "/" + stack.join("/");
}

export function getFile(files: VFiles, abs: string): VFile | null {
  const direct = files[abs];
  if (direct) return direct;
  // Allow trailing slash variants
  const stripped = abs.replace(/\/$/, "");
  return files[stripped] ?? null;
}

export function isDirectory(files: VFiles, abs: string): boolean {
  if (getFile(files, abs)) return false;
  const prefix = abs.endsWith("/") ? abs : `${abs}/`;
  if (abs === "/") return true;
  for (const key of Object.keys(files)) {
    if (key.startsWith(prefix)) return true;
  }
  return false;
}

/** List immediate children of an absolute directory path. Returns sorted unique names. */
export function listDir(
  files: VFiles,
  abs: string,
  opts: { all?: boolean } = {},
): string[] | null {
  if (!isDirectory(files, abs)) return null;
  const prefix = abs === "/" ? "/" : `${abs.replace(/\/$/, "")}/`;
  const seen = new Set<string>();
  for (const key of Object.keys(files)) {
    if (!key.startsWith(prefix)) continue;
    const rest = key.slice(prefix.length);
    if (!rest) continue;
    const name = rest.split("/")[0];
    if (!opts.all && name.startsWith(".")) continue;
    seen.add(name);
  }
  return Array.from(seen).sort();
}

/** Walk every file path under an absolute root. */
export function walk(files: VFiles, root: string): string[] {
  const prefix = root === "/" ? "/" : `${root.replace(/\/$/, "")}/`;
  const out: string[] = [];
  for (const key of Object.keys(files)) {
    if (key === root || key.startsWith(prefix)) out.push(key);
  }
  return out.sort();
}
