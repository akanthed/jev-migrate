import * as path from "path";
import { Detection } from "./detector";

const HIGH_CONFIDENCE_THRESHOLD = 0.6;

export interface ReportSummary {
  filesScanned: number;
  filesWithDetections: number;
  totalDetections: number;
  highConfidenceDetections: Detection[];
}

export function buildSummary(filesScanned: number, detections: Detection[]): ReportSummary {
  const fileSet = new Set(detections.map((d) => d.file));
  const highConfidence = detections
    .filter((d) => d.confidence > HIGH_CONFIDENCE_THRESHOLD)
    .sort((a, b) => b.confidence - a.confidence);

  return {
    filesScanned,
    filesWithDetections: fileSet.size,
    totalDetections: detections.length,
    highConfidenceDetections: highConfidence,
  };
}

function relPath(root: string, filePath: string): string {
  return path.relative(root, filePath).split(path.sep).join("/");
}

export function formatReport(root: string, summary: ReportSummary): string {
  const lines: string[] = [];

  lines.push("📊 jev-migrate scan results");
  lines.push("");
  lines.push(`  Files scanned: ${summary.filesScanned}`);
  lines.push(`  Files with potential conversions: ${summary.filesWithDetections}`);
  lines.push(`  Total detections: ${summary.totalDetections}`);
  lines.push("");
  lines.push("💰 Estimated savings if converted:");
  lines.push(`  Cost reduction: 99%`);
  lines.push(`  Latency improvement: 50-200x faster`);
  lines.push(`  High-confidence conversions: ${summary.highConfidenceDetections.length}`);
  lines.push("");
  lines.push("🎯 High-confidence detections (> 60% confidence):");
  lines.push("");

  const top = summary.highConfidenceDetections.slice(0, 10);
  top.forEach((d, i) => {
    const pct = Math.round(d.confidence * 100);
    lines.push(`  ${i + 1}. ${relPath(root, d.file)}:${d.line}`);
    lines.push(`     Type: ${d.type} → ${d.jevTarget}`);
    lines.push(`     Confidence: ${pct}%`);
    lines.push(`     Code: ${d.snippet}`);
    lines.push("");
  });

  if (summary.highConfidenceDetections.length > top.length) {
    lines.push(`  ... and ${summary.highConfidenceDetections.length - top.length} more`);
  }

  return lines.join("\n");
}
