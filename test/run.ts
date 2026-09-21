import * as path from "path";
import { readFile } from "../src/scanner";
import { detectFile, DetectionType } from "../src/detector";

interface Expectation {
  file: string;
  minDetections: number;
  minConfidence?: number;
  expectedTypes?: DetectionType[];
}

const FIXTURES_DIR = path.join(__dirname, "fixtures");

const expectations: Expectation[] = [
  { file: "ticket-routing.ts", minDetections: 1, minConfidence: 0.8, expectedTypes: ["routing"] },
  { file: "content-moderation.ts", minDetections: 1, minConfidence: 0.8, expectedTypes: ["classification"] },
  { file: "fraud-detection.ts", minDetections: 1, minConfidence: 0.8, expectedTypes: ["boolean"] },
  { file: "scoring-system.ts", minDetections: 1, minConfidence: 0.8, expectedTypes: ["scoring"] },
  { file: "false-positives.ts", minDetections: 0 },
  {
    file: "mixed-patterns.ts",
    minDetections: 4,
    minConfidence: 0.8,
    expectedTypes: ["routing", "classification", "scoring", "boolean"],
  },
  {
    file: "ticket_routing.py",
    minDetections: 2,
    minConfidence: 0.8,
    expectedTypes: ["routing", "classification"],
  },
  { file: "gemini-scoring.ts", minDetections: 1, minConfidence: 0.8, expectedTypes: ["scoring"] },
  {
    file: "cohere_classification.py",
    minDetections: 1,
    minConfidence: 0.8,
    expectedTypes: ["classification"],
  },
  { file: "mistral-boolean.ts", minDetections: 1, minConfidence: 0.8, expectedTypes: ["boolean"] },
  { file: "ollama-routing.py", minDetections: 1, minConfidence: 0.8, expectedTypes: ["routing"] },
  {
    file: "raw-http-classification.ts",
    minDetections: 1,
    minConfidence: 0.8,
    expectedTypes: ["classification"],
  },
];

let failures = 0;

for (const exp of expectations) {
  const filePath = path.join(FIXTURES_DIR, exp.file);
  const scanned = readFile(filePath);
  const detections = detectFile(scanned);

  const countOk = detections.length >= exp.minDetections;
  if (!countOk) {
    console.error(
      `FAIL ${exp.file}: expected >= ${exp.minDetections} detections, got ${detections.length}`
    );
    failures++;
    continue;
  }

  if (exp.minConfidence !== undefined) {
    const lowConfidence = detections.filter((d) => d.confidence < exp.minConfidence!);
    if (lowConfidence.length > 0 && exp.minDetections > 0) {
      const belowThreshold = detections.every((d) => d.confidence < exp.minConfidence!);
      if (belowThreshold) {
        console.error(
          `FAIL ${exp.file}: no detection reached confidence >= ${exp.minConfidence}`
        );
        failures++;
        continue;
      }
    }
  }

  if (exp.expectedTypes) {
    const foundTypes = new Set(detections.map((d) => d.type));
    const missing = exp.expectedTypes.filter((t) => !foundTypes.has(t));
    if (missing.length > 0) {
      console.error(`FAIL ${exp.file}: missing expected types ${missing.join(", ")}`);
      failures++;
      continue;
    }
  }

  console.log(`PASS ${exp.file} (${detections.length} detection(s))`);
}

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
} else {
  console.log(`\nAll ${expectations.length} fixture tests passed.`);
}
