#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";
import { scan } from "./scanner";
import { detectAll } from "./detector";
import { buildSummary, formatReport } from "./reporter";

function reportRoot(root: string): string {
  return fs.statSync(root).isFile() ? path.dirname(root) : root;
}

const program = new Command();

program
  .name("jev-migrate")
  .description("Scan a codebase for LLM calls that can be converted to TypeSafe Jev")
  .version("0.1.0");

program
  .command("scan")
  .description("Scan a directory and report potential Jev conversions")
  .argument("[dir]", "directory to scan", ".")
  .action((dir: string) => {
    const root = path.resolve(dir);
    const files = scan(root);
    const detections = detectAll(files);
    const summary = buildSummary(files.length, detections);
    console.log(formatReport(reportRoot(root), summary));
  });

program
  .command("suggest")
  .description("Alias for scan: show suggested conversions")
  .argument("[dir]", "directory to scan", ".")
  .action((dir: string) => {
    const root = path.resolve(dir);
    const files = scan(root);
    const detections = detectAll(files);
    const summary = buildSummary(files.length, detections);
    console.log(formatReport(reportRoot(root), summary));
  });

program
  .command("convert")
  .description("(preview) Show what a converted call would look like")
  .argument("[dir]", "directory to scan", ".")
  .action((dir: string) => {
    const root = path.resolve(dir);
    const files = scan(root);
    const detections = detectAll(files);
    if (detections.length === 0) {
      console.log("No convertible LLM calls found.");
      return;
    }
    for (const d of detections) {
      const rel = path.relative(reportRoot(root), d.file).split(path.sep).join("/");
      console.log(`${rel}:${d.line} [${Math.round(d.confidence * 100)}%] ${d.type} -> ${d.jevTarget}`);
    }
  });

program.parse(process.argv);
