import ollama

# Route the incoming ticket to the right team: billing, technical, or sales.
def route_ticket(ticket_text):
    response = ollama.chat(
        model="llama3",
        temperature=0,
        messages=[
            {
                "role": "system",
                "content": "Route this ticket to a department: billing, technical, sales.",
            },
            {"role": "user", "content": ticket_text},
        ],
    )
    return response["message"]["content"]
