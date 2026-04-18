import re


def preprocess_email(subject: str, body: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', body)
    text = re.sub(r'&[a-z]+;', ' ', text)          # HTML entities
    text = re.sub(r'http\S+', '[LINK]', text)        # collapse URLs to token
    text = re.sub(r'\s+', ' ', text).strip()

    if len(text) < 30:
        raise ValueError("Email body too short to process")

    return f"SUBJECT: {subject.strip()}\n\nBODY:\n{text}"
