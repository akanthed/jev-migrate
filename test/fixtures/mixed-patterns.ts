import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const openai = new OpenAI();
const anthropic = new Anthropic();

export async function assignToTeam(issue: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 15,
    messages: [
      { role: "system", content: "Assign this issue to the correct team queue." },
      { role: "user", content: issue },
    ],
  });
  return response.choices[0].message.content;
}

export async function categorizeSupportTicket(ticket: string) {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    temperature: 0,
    max_tokens: 40,
    messages: [
      {
        role: "user",
        content: `Categorize this ticket and return JSON, e.g. {"category": "bug"}.\n\n${ticket}`,
      },
    ],
  });
  const raw = response.content[0].type === "text" ? response.content[0].text : "{}";
  return JSON.parse(raw).category;
}

export async function rateContentUrgency(content: string) {
  // rank the urgency of this content on a scale of 0 to 100
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 10,
    messages: [
      { role: "system", content: "Rank urgency from 0 to 100." },
      { role: "user", content },
    ],
  });
  return Number(response.choices[0].message.content);
}

export async function needsHumanReview(content: string): Promise<boolean> {
  // needs_review: should_escalate to a human, answer true/false
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    temperature: 0,
    max_tokens: 5,
    messages: [
      { role: "user", content: `Does this need human review? Answer true/false.\n\n${content}` },
    ],
  });
  const text = response.content[0].type === "text" ? response.content[0].text : "false";
  return text.trim().toLowerCase() === "true";
}
