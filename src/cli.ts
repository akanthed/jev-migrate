#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";
import { scan } from "./scanner";
import { detectAll } from "./detector";
import { buildSummary, formatReport } from "./reporter";
import { buildConversions } from "./converter";

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
  .description("Preview before/after Jev call scaffolds for detected LLM calls (does not write files)")
  .argument("[dir]", "directory to scan", ".")
  .action((dir: string) => {
    const root = path.resolve(dir);
    const files = scan(root);
    const detections = detectAll(files);
    if (detections.length === 0) {
      console.log("No convertible LLM calls found.");
      return;
    }
    const conversions = buildConversions(detections);
    for (const c of conversions) {
      const rel = path
        .relative(reportRoot(root), c.detection.file)
        .split(path.sep)
        .join("/");
      console.log(`\n${rel}:${c.detection.line} [${Math.round(c.detection.confidence * 100)}%] ${c.detection.type} -> ${c.detection.jevTarget}`);
      console.log(`  before: ${c.original}`);
      console.log(`  after:`);
      for (const line of c.replacement.split("\n")) {
        console.log(`    ${line}`);
      }
    }
    console.log(
      "\nThese are scaffolds, not a safe drop-in rewrite. Fill in options/input from your original prompt before replacing the call."
    );
  });

program.parse(process.argv);
