import * as fs from "fs";
import * as path from "path";

const SUPPORTED_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".py"]);

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "venv",
  "__pycache__",
]);

export interface ScannedFile {
  path: string;
  content: string;
  lines: string[];
}

export function walkDirectory(root: string): string[] {
  const results: string[] = [];

  function walk(dir: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".") {
        if (entry.isDirectory()) continue;
      }
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (SUPPORTED_EXT.has(ext)) {
          results.push(fullPath);
        }
      }
    }
  }

  const stat = fs.statSync(root);
  if (stat.isFile()) {
    const ext = path.extname(root);
    if (SUPPORTED_EXT.has(ext)) results.push(root);
    return results;
  }

  walk(root);
  return results;
}

export function readFile(filePath: string): ScannedFile {
  const content = fs.readFileSync(filePath, "utf-8");
  return {
    path: filePath,
    content,
    lines: content.split(/\r?\n/),
  };
}

export function scan(root: string): ScannedFile[] {
  const files = walkDirectory(root);
  return files.map(readFile);
}
