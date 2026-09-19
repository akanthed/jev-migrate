import Groq from "groq-sdk";

const groq = new Groq();

export async function isFraudulentTransaction(details: string): Promise<boolean> {
  // is_fraud: ask the model whether this transaction should_be_flagged
  const response = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "Given the transaction details, answer yes/no: is this transaction fraudulent?",
      },
      { role: "user", content: details },
    ],
  });

  const answer = response.choices[0].message.content?.trim().toLowerCase();
  const is_fraud = answer === "yes";
  return is_fraud;
}
