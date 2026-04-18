from pydantic import BaseModel


# ── Input ──────────────────────────────────────────────────────────────────

class StudentProfile(BaseModel):
    name: str
    degree_program: str
    semester: int
    cgpa: float
    skills: list[str]
    interests: list[str]
    preferred_opportunity_types: list[str]  # ["internship","scholarship","competition"]
    financial_need: str                     # "high"|"medium"|"low"
    location_preference: str               # "remote"|"onsite"|"any"
    past_experience: list[str]


class EmailInput(BaseModel):
    subject: str
    sender: str
    body: str
    received_date: str | None = None


class AnalysisRequest(BaseModel):
    profile: StudentProfile
    emails: list[EmailInput]


# ── AI stage models ────────────────────────────────────────────────────────

class ClassificationResult(BaseModel):
    is_opportunity: bool
    reason: str


class FieldWithEvidence(BaseModel):
    value: str | None = None
    evidence: str | None = None   # verbatim quote from email
    confidence: str = "high"      # "high"|"medium"|"low"


class OpportunityExtraction(BaseModel):
    opportunity_type: str                         # scholarship|internship|competition|fellowship|admission|other
    title: FieldWithEvidence
    organization: FieldWithEvidence
    deadline: FieldWithEvidence                   # YYYY-MM-DD or null
    eligibility: list[FieldWithEvidence] = []
    required_documents: list[FieldWithEvidence] = []
    application_link: FieldWithEvidence
    contact_info: FieldWithEvidence
    financial_benefit: FieldWithEvidence
    location: FieldWithEvidence


class ChecklistAdditions(BaseModel):
    items: list[str]


# ── Deterministic stage models ─────────────────────────────────────────────

class EligibilityCheck(BaseModel):
    criterion: str
    status: str          # "pass"|"fail"|"unknown"
    evidence: str | None = None
    profile_value: str | None = None


class ScoreBreakdown(BaseModel):
    urgency: int
    profile_fit: int
    completeness: int
    benefit: int
    total: int


# ── Output ─────────────────────────────────────────────────────────────────

class RankedOpportunity(BaseModel):
    rank: int
    email_index: int
    email_subject: str
    email_sender: str
    original_email_body: str
    classification_reason: str
    extraction: OpportunityExtraction
    validation_warnings: list[str]
    eligibility_checks: list[EligibilityCheck]
    scores: ScoreBreakdown
    urgency_level: str           # "critical"|"high"|"medium"|"low"|"expired"
    match_reasons: list[str]
    mismatch_warnings: list[str]
    action_checklist: list[str]
    is_eligible: bool


class FilteredEmail(BaseModel):
    email_index: int
    email_subject: str
    email_sender: str
    reason: str


class GapAnalysisItem(BaseModel):
    missing: str
    unlocks: list[str]


class AnalysisResponse(BaseModel):
    total_emails: int
    opportunities_found: int
    ranked_opportunities: list[RankedOpportunity]
    filtered_out: list[FilteredEmail]
    gap_analysis: list[GapAnalysisItem]
    today_queue: list[str]
