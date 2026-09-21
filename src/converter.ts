import { Detection, DetectionType } from "./detector";

export interface ConvertedCall {
  detection: Detection;
  original: string;
  replacement: string;
}

const JEV_CALL_TEMPLATE: Record<DetectionType, (varName: string) => string> = {
  routing: (v) =>
    `const ${v} = await Jev.choice({\n  // TODO: paste your option list here, e.g. ["billing", "technical", "sales"]\n  options: [],\n  input: /* TODO: original prompt input */ "",\n});`,
  classification: (v) =>
    `const ${v} = await Jev.choice({\n  // TODO: paste your category list here\n  options: [],\n  input: /* TODO: original prompt input */ "",\n});`,
  scoring: (v) =>
    `const ${v} = await Jev.score({\n  // TODO: set the scale, e.g. { min: 1, max: 5 }\n  scale: { min: 0, max: 100 },\n  input: /* TODO: original prompt input */ "",\n});`,
  boolean: (v) =>
    `const ${v} = await Jev.noul({\n  input: /* TODO: original prompt input */ "",\n});`,
};

function guessVarName(snippet: string): string {
  const match = snippet.match(/const\s+(\w+)\s*=/);
  return match ? match[1] : "result";
}

export function buildConversion(detection: Detection): ConvertedCall {
  const varName = guessVarName(detection.snippet);
  const replacement = JEV_CALL_TEMPLATE[detection.type](varName);

  return {
    detection,
    original: detection.snippet,
    replacement,
  };
}

export function buildConversions(detections: Detection[]): ConvertedCall[] {
  return detections.map(buildConversion);
}
