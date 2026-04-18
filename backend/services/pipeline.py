from backend.schemas import (
    AnalysisRequest, AnalysisResponse, RankedOpportunity, FilteredEmail, GapAnalysisItem,
)
from backend.pipeline.stage1_preprocess import preprocess_email
from backend.pipeline.stage2_classify import classify
from backend.pipeline.stage3_extract import extract
from backend.pipeline.stage4_validate import validate
from backend.pipeline.stage5_eligibility import check_eligibility
from backend.pipeline.stage6_score import score
from backend.pipeline.stage7_checklist import build_checklist


def run_pipeline(req: AnalysisRequest) -> AnalysisResponse:
    profile = req.profile
    profile_context = (
        f"Degree: {profile.degree_program}, Semester: {profile.semester}, "
        f"CGPA: {profile.cgpa}, Skills: {', '.join(profile.skills)}, "
        f"Interests: {', '.join(profile.interests)}, "
        f"Preferred types: {', '.join(profile.preferred_opportunity_types)}, "
        f"Financial need: {profile.financial_need}, Location: {profile.location_preference}"
    )

    ranked: list[RankedOpportunity] = []
    filtered: list[FilteredEmail] = []

    for idx, email in enumerate(req.emails):
        # Stage 1 — preprocess
        try:
            clean_text = preprocess_email(email.subject, email.body)
        except ValueError as e:
            filtered.append(FilteredEmail(
                email_index=idx,
                email_subject=email.subject,
                email_sender=email.sender,
                reason=str(e),
            ))
            continue

        # Stage 2 — classify
        classification = classify(clean_text)
        if not classification.is_opportunity:
            filtered.append(FilteredEmail(
                email_index=idx,
                email_subject=email.subject,
                email_sender=email.sender,
                reason=classification.reason,
            ))
            continue

        # Stage 3 — extract
        extraction = extract(clean_text, profile_context)

        # Stage 4 — validate
        extraction, warnings = validate(extraction)

        # Stage 5 — eligibility
        elig_checks, is_eligible, match_reasons, mismatch_warnings = check_eligibility(extraction, profile)

        # Stage 6 — score
        score_breakdown, urgency_level = score(extraction, profile, elig_checks)

        # Stage 7 — checklist
        checklist = build_checklist(extraction, profile)

        ranked.append(RankedOpportunity(
            rank=0,  # assigned after sort
            email_index=idx,
            email_subject=email.subject,
            email_sender=email.sender,
            original_email_body=email.body,
            classification_reason=classification.reason,
            extraction=extraction,
            validation_warnings=warnings,
            eligibility_checks=elig_checks,
            scores=score_breakdown,
            urgency_level=urgency_level,
            match_reasons=match_reasons,
            mismatch_warnings=mismatch_warnings,
            action_checklist=checklist,
            is_eligible=is_eligible,
        ))

    # Sort by total score descending, assign ranks
    ranked.sort(key=lambda o: o.scores.total, reverse=True)
    for i, opp in enumerate(ranked):
        opp.rank = i + 1

    # Gap analysis — what profile additions would unlock ineligible opportunities
    gap_analysis = _build_gap_analysis(filtered, ranked, profile, req.emails)

    # Today queue — cross-opportunity consolidated urgent actions
    today_queue = _build_today_queue(ranked)

    return AnalysisResponse(
        total_emails=len(req.emails),
        opportunities_found=len(ranked),
        ranked_opportunities=ranked,
        filtered_out=filtered,
        gap_analysis=gap_analysis,
        today_queue=today_queue,
    )


def _build_today_queue(ranked: list[RankedOpportunity]) -> list[str]:
    queue: list[str] = []
    urgent = [o for o in ranked if o.urgency_level in ("critical", "high")]
    for opp in urgent:
        title = opp.extraction.title.value or opp.email_subject
        for action in opp.action_checklist[:2]:
            queue.append(f"[{title}] {action}")
    return queue


def _build_gap_analysis(
    filtered: list[FilteredEmail],
    ranked: list[RankedOpportunity],
    profile,
    emails,
) -> list[GapAnalysisItem]:
    items: list[GapAnalysisItem] = []

    # Check ranked opportunities for unknown/fail eligibility criteria
    missing_map: dict[str, list[str]] = {}
    for opp in ranked:
        title = opp.extraction.title.value or opp.email_subject
        for check in opp.eligibility_checks:
            if check.status == "fail":
                key = check.criterion
                missing_map.setdefault(key, []).append(title)

    for missing, unlocks in missing_map.items():
        items.append(GapAnalysisItem(missing=missing, unlocks=unlocks))

    return items
