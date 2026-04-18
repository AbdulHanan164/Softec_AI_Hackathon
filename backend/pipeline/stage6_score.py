from datetime import date
from backend.schemas import OpportunityExtraction, StudentProfile, EligibilityCheck, ScoreBreakdown


def get_urgency_level(days: int | None) -> str:
    if days is None:
        return "unknown"
    if days < 0:
        return "expired"
    if days <= 3:
        return "critical"
    if days <= 7:
        return "high"
    if days <= 14:
        return "medium"
    if days <= 30:
        return "low"
    return "minimal"


def score(
    ext: OpportunityExtraction,
    profile: StudentProfile,
    eligibility_checks: list[EligibilityCheck],
) -> tuple[ScoreBreakdown, str]:

    days_left: int | None = None
    if ext.deadline.value:
        try:
            dl = date.fromisoformat(ext.deadline.value)
            days_left = (dl - date.today()).days
        except ValueError:
            pass

    urgency_level = get_urgency_level(days_left)

    # ── Urgency (0–30) ────────────────────────────────────────────────────
    urgency_map = {
        "expired": 0, "critical": 30, "high": 24,
        "medium": 18, "low": 12, "minimal": 6, "unknown": 10,
    }
    urgency_score = urgency_map[urgency_level]

    # ── Profile fit (0–35) ────────────────────────────────────────────────
    fit = 0
    if ext.opportunity_type in profile.preferred_opportunity_types:
        fit += 15

    passed = sum(1 for c in eligibility_checks if c.status == "pass")
    failed = sum(1 for c in eligibility_checks if c.status == "fail")
    fit += min(15, passed * 5)
    fit -= failed * 8   # penalise confirmed mismatches
    fit = max(0, fit)

    # Interest/skill keyword overlap with title + organization
    title_text = (ext.title.value or "").lower()
    for keyword in profile.skills + profile.interests:
        if keyword.lower() in title_text:
            fit = min(35, fit + 3)
            break

    # ── Completeness (0–20) ───────────────────────────────────────────────
    completeness = 0
    if ext.deadline.value:            completeness += 5
    if ext.application_link.value:    completeness += 5
    if ext.required_documents:        completeness += 5
    if ext.eligibility:               completeness += 5

    # ── Benefit value (0–15) ─────────────────────────────────────────────
    benefit = 0
    if ext.financial_benefit.value:
        benefit += 10 if profile.financial_need == "high" else 5
    if ext.organization.value:
        benefit += 5

    total = urgency_score + fit + completeness + benefit

    return ScoreBreakdown(
        urgency=urgency_score,
        profile_fit=fit,
        completeness=completeness,
        benefit=benefit,
        total=total,
    ), urgency_level
