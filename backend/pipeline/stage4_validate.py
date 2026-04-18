import re
from datetime import date
from backend.schemas import OpportunityExtraction


def validate(ext: OpportunityExtraction) -> tuple[OpportunityExtraction, list[str]]:
    warnings: list[str] = []

    # ── Deadline ──────────────────────────────────────────────────────────
    if ext.deadline.value:
        try:
            dl = date.fromisoformat(ext.deadline.value)
            if dl < date.today():
                warnings.append(f"Deadline {ext.deadline.value} has already passed — marked expired")
                # keep value so urgency stage can mark it expired
        except ValueError:
            warnings.append(f"Deadline '{ext.deadline.value}' is not a valid date — cleared")
            ext.deadline.value = None
            ext.deadline.evidence = None

        # Evidence sanity: does the evidence contain a date-like pattern?
        if ext.deadline.evidence:
            has_date_pattern = bool(re.search(
                r'\d{4}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b|\d{1,2}[/-]\d{1,2}',
                ext.deadline.evidence, re.IGNORECASE
            ))
            if not has_date_pattern:
                ext.deadline.confidence = "low"
                warnings.append("Deadline evidence doesn't contain a date pattern — confidence lowered")

    # ── Application link ──────────────────────────────────────────────────
    if ext.application_link.value:
        if not re.match(r'https?://', ext.application_link.value):
            warnings.append(f"Application link '{ext.application_link.value}' is not a valid URL — cleared")
            ext.application_link.value = None
            ext.application_link.evidence = None

    # ── CGPA in eligibility ───────────────────────────────────────────────
    for item in ext.eligibility:
        if item.value:
            cgpa_match = re.search(r'(\d+\.\d+)', item.value)
            if cgpa_match:
                val = float(cgpa_match.group(1))
                if val > 4.0 or val < 0:
                    item.confidence = "low"
                    warnings.append(f"CGPA value {val} in eligibility looks invalid")

    return ext, warnings
