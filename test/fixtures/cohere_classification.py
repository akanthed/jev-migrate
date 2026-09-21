import cohere

co = cohere.Client("api-key")


def classify_review(review_text):
    """Classify the review as positive, negative, or neutral and decide
    whether it needs a follow-up from support."""
    response = co.chat(
        model="command-r",
        temperature=0,
        message=f"Classify this review as positive, negative, or neutral: {review_text}",
    )
    return response.text
