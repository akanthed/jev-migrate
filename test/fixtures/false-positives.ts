import OpenAI from "openai";

const openai = new OpenAI();

// This call produces open-ended creative writing and has nothing
// to do with picking between fixed options or checking a condition.
export async function writeMarketingCopy(productDescription: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.9,
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content: "You are a creative copywriter. Write an engaging product blurb.",
      },
      { role: "user", content: productDescription },
    ],
  });

  return response.choices[0].message.content;
}

export async function summarizeArticle(article: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 300,
    messages: [
      { role: "system", content: "Summarize the following article in three sentences." },
      { role: "user", content: article },
    ],
  });

  return response.choices[0].message.content;
}
