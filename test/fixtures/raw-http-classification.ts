// Some teams skip the SDK and call the REST endpoint directly.
// Classify the uploaded document into one category so it can be filed.
export async function classifyDocument(text: string, apiKey: string) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3-8b-instruct",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: "Classify this document into one category: legal, financial, technical.",
        },
        { role: "user", content: text },
      ],
    }),
  });

  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}
