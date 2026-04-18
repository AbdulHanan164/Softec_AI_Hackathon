from backend.config import MODEL, TEMPERATURE, client
from backend.schemas import OpportunityExtraction

SYSTEM_PROMPT = """You extract structured information from student opportunity emails.

STRICT RULES — no exceptions:
1. For every field, provide the EXACT verbatim quote from the email as evidence.
2. If you cannot find a field explicitly stated, set value=null AND evidence=null.
3. NEVER infer, estimate, or guess. Null is always better than a wrong answer.
4. Deadlines: format as YYYY-MM-DD only. If year is missing or ambiguous, set value=null.
5. Evidence must be copied word-for-word from the email — not paraphrased.
6. Extract each eligibility criterion and required document as a separate list item.
7. opportunity_type must be one of: scholarship, internship, competition, fellowship, admission, other.
8. confidence: "high" if evidence is explicit, "medium" if implied, "low" if inferred.
9. The student profile is provided for context only — do not let it influence what you extract.
"""

def extract(email_text: str, profile_context: str) -> OpportunityExtraction:
    response = client.beta.chat.completions.parse(
        model=MODEL,
        temperature=TEMPERATURE,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"STUDENT PROFILE (context only):\n{profile_context}\n\nEMAIL:\n{email_text}"},
        ],
        response_format=OpportunityExtraction,
    )
    return response.choices[0].message.parsed
