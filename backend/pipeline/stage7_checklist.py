from backend.config import MODEL, TEMPERATURE, client
from backend.schemas import OpportunityExtraction, StudentProfile, ChecklistAdditions


def build_checklist(ext: OpportunityExtraction, profile: StudentProfile) -> list[str]:
    checklist: list[str] = []

    # ── Deterministic items (template-driven, no AI) ───────────────────
    if ext.application_link.value:
        checklist.append(f"Visit application portal: {ext.application_link.value}")

    for doc in ext.required_documents:
        if doc.value:
            checklist.append(f"Prepare document: {doc.value}")

    if ext.deadline.value:
        checklist.append(f"Submit before deadline: {ext.deadline.value}")

    if ext.contact_info.value:
        checklist.append(f"Contact for questions: {ext.contact_info.value}")

    # ── AI adds 2–3 personalized steps not already covered ────────────
    existing = "\n".join(f"- {item}" for item in checklist)
    try:
        response = client.beta.chat.completions.parse(
            model=MODEL,
            temperature=TEMPERATURE,
            messages=[{
                "role": "user",
                "content": (
                    f"Opportunity: {ext.title.value or 'Unknown'} ({ext.opportunity_type})\n"
                    f"Organization: {ext.organization.value or 'Unknown'}\n"
                    f"Student: {profile.degree_program}, semester {profile.semester}, CGPA {profile.cgpa}\n"
                    f"Skills: {', '.join(profile.skills)}\n"
                    f"Existing checklist:\n{existing}\n\n"
                    "Add exactly 2-3 SHORT, specific next-step actions NOT already in the checklist above. "
                    "Be concrete (e.g. 'Request recommendation letter from Prof. X', not 'Get references'). "
                    "Return only a list of action strings."
                ),
            }],
            response_format=ChecklistAdditions,
        )
        checklist.extend(response.choices[0].message.parsed.items)
    except Exception:
        pass  # checklist still has deterministic items

    return checklist
