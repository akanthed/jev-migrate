import json
from openai import OpenAI

client = OpenAI()


def route_ticket(ticket_text: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        max_tokens=20,
        messages=[
            {
                "role": "system",
                "content": "Route this support ticket to the correct department queue: billing, technical, sales.",
            },
            {"role": "user", "content": ticket_text},
        ],
    )
    return response.choices[0].message.content.strip()


def classify_intent(text: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        max_tokens=40,
        messages=[
            {
                "role": "user",
                "content": f'Classify this message and return JSON like {{"intent": "refund"}}.\n\n{text}',
            }
        ],
    )
    raw = response.choices[0].message.content
    result = json.loads(raw)
    return result["intent"]
