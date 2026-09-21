import { ScannedFile } from "./scanner";

export type DetectionType = "routing" | "classification" | "scoring" | "boolean";

export interface Detection {
  file: string;
  line: number;
  type: DetectionType;
  jevTarget: string;
  confidence: number;
  snippet: string;
  provider: string;
}

const CALL_PATTERN = /(\w+)\.(chat\.completions\.create|messages\.create|ChatCompletion\.create)\s*\(/g;

const ROUTING_KEYWORDS = /\b(rout(?:e|ing|er)|dispatch(?:ing)?|assign(?:ed|ing|ment)?|queue(?:d|ing)?|department|team)\b/i;
const CLASSIFICATION_KEYWORDS = /\b(classify|classif(?:ication|ies|ied)|categorize|decide|decision|determine)\b/i;
const SCORING_KEYWORDS = /\b(score|scoring|rating|rank(?:ing)?|priority|urgency)\b/i;
const BOOLEAN_KEYWORDS = /\b(is_\w+|should_\w+|has_\w+|can_\w+|needs_\w+)\b/i;

// [:=] covers both JS object literals (temperature: 0) and Python kwargs (temperature=0)
const TEMP_ZERO = /temperature\s*[:=]\s*0(?![.\d])/;
const MAX_TOKENS = /max_tokens\s*[:=]\s*(\d+)/;
const JSON_PARSE = /JSON\.parse|json\.loads/;
const SCALE_1_5 = /\b1\s*(?:-|to)\s*5\b/i;
const SCALE_0_100 = /\b0\s*(?:-|to)\s*100\b/i;
const YES_NO = /\byes\s*\/\s*no\b|\btrue\s*\/\s*false\b/i;

function findBlockEnd(content: string, openParenIndex: number): number {
  let depth = 0;
  for (let i = openParenIndex; i < content.length; i++) {
    const ch = content[i];
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return Math.min(content.length - 1, openParenIndex + 2000);
}

function lineNumberAt(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (content[i] === "\n") line++;
  }
  return line;
}

interface ScoredCategory {
  type: DetectionType;
  jevTarget: string;
  confidence: number;
}

function scoreCategory(contextBefore: string, contextText: string): ScoredCategory | null {
  const candidates: ScoredCategory[] = [];

  if (ROUTING_KEYWORDS.test(contextBefore) || ROUTING_KEYWORDS.test(contextText)) {
    let confidence = 0.6;
    const tempZero = TEMP_ZERO.test(contextText);
    const maxTokensMatch = contextText.match(MAX_TOKENS);
    const lowMaxTokens = maxTokensMatch ? Number(maxTokensMatch[1]) < 100 : false;
    if (tempZero && lowMaxTokens) confidence = 0.9;
    else if (tempZero) confidence = 0.8;
    else if (lowMaxTokens) confidence = 0.7;
    candidates.push({ type: "routing", jevTarget: "Jev.choice", confidence });
  }

  if (CLASSIFICATION_KEYWORDS.test(contextBefore) || CLASSIFICATION_KEYWORDS.test(contextText)) {
    let confidence = 0.7;
    if (TEMP_ZERO.test(contextText)) confidence += 0.1;
    if (JSON_PARSE.test(contextText)) confidence += 0.1;
    confidence = Math.min(confidence, 0.9);
    candidates.push({ type: "classification", jevTarget: "Jev.choice", confidence });
  }

  if (SCORING_KEYWORDS.test(contextBefore) || SCORING_KEYWORDS.test(contextText)) {
    let confidence = 0.65;
    if (SCALE_1_5.test(contextText) || SCALE_0_100.test(contextText)) confidence += 0.2;
    confidence = Math.min(confidence, 0.85);
    candidates.push({ type: "scoring", jevTarget: "Jev.score", confidence });
  }

  if (BOOLEAN_KEYWORDS.test(contextBefore) || BOOLEAN_KEYWORDS.test(contextText)) {
    let confidence = 0.7;
    if (YES_NO.test(contextText)) confidence += 0.15;
    confidence = Math.min(confidence, 0.85);
    candidates.push({ type: "boolean", jevTarget: "Jev.noul", confidence });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.confidence - a.confidence);
  const best = candidates[0];
  best.confidence = Math.round(best.confidence * 100) / 100;
  return best;
}

export function detectFile(file: ScannedFile): Detection[] {
  const detections: Detection[] = [];
  const content = file.content;
  let match: RegExpExecArray | null;
  CALL_PATTERN.lastIndex = 0;

  while ((match = CALL_PATTERN.exec(content)) !== null) {
    const provider = match[1];
    const callStart = match.index;
    const openParenIndex = content.indexOf("(", callStart);
    if (openParenIndex === -1) continue;
    const blockEnd = findBlockEnd(content, openParenIndex);

    const beforeStart = Math.max(0, callStart - 150);
    const contextBefore = content.slice(beforeStart, callStart);
    const afterEnd = Math.min(content.length, blockEnd + 200);
    const contextText = content.slice(callStart, afterEnd);

    const category = scoreCategory(contextBefore, contextText);
    if (!category) continue;

    const line = lineNumberAt(content, callStart);
    const snippetLine = file.lines[line - 1]?.trim() ?? "";

    detections.push({
      file: file.path,
      line,
      type: category.type,
      jevTarget: category.jevTarget,
      confidence: category.confidence,
      snippet: snippetLine,
      provider,
    });
  }

  return detections;
}

export function detectAll(files: ScannedFile[]): Detection[] {
  const all: Detection[] = [];
  for (const file of files) {
    all.push(...detectFile(file));
  }
  return all;
}
