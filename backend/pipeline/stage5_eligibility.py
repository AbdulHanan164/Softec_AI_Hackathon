import re
from backend.schemas import OpportunityExtraction, StudentProfile, EligibilityCheck


def check_eligibility(
    ext: OpportunityExtraction, profile: StudentProfile
) -> tuple[list[EligibilityCheck], bool, list[str], list[str]]:
    """
    Returns (checks, is_eligible, match_reasons, mismatch_warnings)
    is_eligible=False only on a confirmed hard FAIL.
    """
    checks: list[EligibilityCheck] = []
    hard_fails = 0
    match_reasons: list[str] = []
    mismatch_warnings: list[str] = []

    for item in ext.eligibility:
        if not item.value:
            continue

        criterion = item.value.lower()
        status = "unknown"
        profile_value = None

        # ── CGPA check ─────────────────────────────────────────────────
        cgpa_match = re.search(r'cgpa[^\d]*(\d+\.?\d*)', criterion)
        if cgpa_match:
            required = float(cgpa_match.group(1))
            profile_value = str(profile.cgpa)
            if profile.cgpa >= required:
                status = "pass"
                match_reasons.append(f"Your CGPA {profile.cgpa} meets the minimum {required}")
            else:
                status = "fail"
                hard_fails += 1
                mismatch_warnings.append(f"Requires CGPA ≥ {required} — you have {profile.cgpa}")

        # ── Degree/program check ────────────────────────────────────────
        degree_keywords = {
            "computer science": ["computer science", "cs", "software"],
            "engineering": ["engineering", "engg"],
            "business": ["business", "bba", "mba"],
            "medicine": ["medicine", "mbbs", "medical"],
        }
        for field, keywords in degree_keywords.items():
            if any(k in criterion for k in keywords):
                profile_deg = profile.degree_program.lower()
                profile_value = profile.degree_program
                if any(k in profile_deg for k in keywords):
                    status = "pass"
                    match_reasons.append(f"Your degree matches the required field ({field})")
                else:
                    status = "fail"
                    hard_fails += 1
                    mismatch_warnings.append(f"Requires {field} background — you have {profile.degree_program}")
                break

        # ── Semester / year check ───────────────────────────────────────
        if re.search(r'final\s+year|8th\s+semester|last\s+year', criterion):
            profile_value = f"Semester {profile.semester}"
            if profile.semester >= 7:
                status = "pass"
                match_reasons.append("You are in your final year — meets the requirement")
            else:
                status = "fail"
                hard_fails += 1
                mismatch_warnings.append(f"Requires final year — you are in semester {profile.semester}")

        if re.search(r'undergraduate|bachelors|bs|b\.s', criterion):
            profile_value = profile.degree_program
            if any(x in profile.degree_program.lower() for x in ["bs", "bachelor", "undergrad"]):
                status = "pass"
                match_reasons.append("You are an undergraduate — meets the requirement")
            else:
                status = "unknown"

        # ── Skill/interest keyword match ────────────────────────────────
        for skill in profile.skills + profile.interests:
            if skill.lower() in criterion:
                if status == "unknown":
                    status = "pass"
                    match_reasons.append(f"Your skill '{skill}' aligns with eligibility criteria")
                break

        checks.append(EligibilityCheck(
            criterion=item.value,
            status=status,
            evidence=item.evidence,
            profile_value=profile_value,
        ))

    # Opportunity type preference match
    if ext.opportunity_type in profile.preferred_opportunity_types:
        match_reasons.append(f"Matches your preferred opportunity type: {ext.opportunity_type}")

    # Location preference
    if ext.location.value:
        loc = ext.location.value.lower()
        pref = profile.location_preference.lower()
        if pref == "any" or pref in loc or loc in pref or loc == "remote" and pref == "remote":
            match_reasons.append(f"Location preference matches ({ext.location.value})")
        else:
            mismatch_warnings.append(f"Location is {ext.location.value} — you prefer {profile.location_preference}")

    is_eligible = hard_fails == 0
    return checks, is_eligible, match_reasons, mismatch_warnings
