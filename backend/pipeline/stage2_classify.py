from backend.config import MODEL, TEMPERATURE, client
from backend.schemas import ClassificationResult

SYSTEM_PROMPT = """You classify university student emails.

An email IS an opportunity if it contains a specific, actionable chance:
scholarship, internship, competition, fellowship, admission, research position, grant, job opening.

NOT opportunities: maintenance notices, newsletters without application process,
general event invitations, system alerts, administrative notices, wifi/IT issues.

Rules:
- Return is_opportunity: true or false
- Return reason: exactly one sentence explaining your decision
- reason must never be null or empty
"""

def classify(email_text: str) -> ClassificationResult:
    response = client.beta.chat.completions.parse(
        model=MODEL,
        temperature=TEMPERATURE,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": email_text},
        ],
        response_format=ClassificationResult,
    )
    return response.choices[0].message.parsed
