import httpx
import json

base_url = "http://localhost:8010/api"
r_log = []

def log(msg):
    r_log.append(msg)
    print(msg)

log("--- Testing API Endpoints ---\n")

# 1. Health Check
try:
    r = httpx.get(f"{base_url}/health")
    if r.status_code == 200:
        log("PASS: GET /api/health")
    else:
        log(f"FAIL: GET /api/health - Failed with status {r.status_code}")
except Exception as e:
    log(f"FAIL: GET /api/health - Error - {e}")

# 2. Sample Emails
try:
    r = httpx.get(f"{base_url}/sample-emails")
    if r.status_code == 200 and isinstance(r.json(), list):
        sample_emails = r.json()
        log(f"PASS: GET /api/sample-emails (Retrieved {len(sample_emails)} emails)")
    else:
        log(f"FAIL: GET /api/sample-emails - Failed with status {r.status_code}")
except Exception as e:
    log(f"FAIL: GET /api/sample-emails - Error - {e}")

# 3. Extract Profile
dummy_resume = b"John Doe\nBS Computer Science\nSkills: Python, Django, React\nInterests: Machine Learning, Web Development"
profile = None
try:
    # Use tuple format (filename, file-like object, content_type)
    files = {"file": ("resume.txt", dummy_resume, "text/plain")}
    r = httpx.post(f"{base_url}/extract-profile", files=files)
    if r.status_code == 200:
        profile = r.json()
        log(f"PASS: POST /api/extract-profile (Extracted name: {profile.get('name')})")
    else:
        log(f"FAIL: POST /api/extract-profile - Failed with status {r.status_code} - {r.text}")
except Exception as e:
    log(f"FAIL: POST /api/extract-profile - Error - {e}")

# Fallback profile if extraction failed
if not profile:
    profile = {
        "name": "Test User",
        "degree_program": "BS CS",
        "semester": 4,
        "cgpa": 3.5,
        "skills": ["Python"],
        "interests": ["AI"],
        "preferred_opportunity_types": ["internship"],
        "financial_need": "medium",
        "location_preference": "any",
        "past_experience": []
    }

# 4. Analyze Emails
try:
    payload = {
        "profile": profile,
        "emails": sample_emails[:2]  # Test with just 2 emails to be fast
    }
    r = httpx.post(f"{base_url}/analyze", json=payload, timeout=60.0)
    if r.status_code == 200:
        analysis = r.json()
        log(f"PASS: POST /api/analyze (Found {analysis.get('opportunities_found')} opportunities out of {analysis.get('total_emails')} tested emails)")
    else:
        log(f"FAIL: POST /api/analyze - Failed with status {r.status_code} - {r.text}")
except Exception as e:
    log(f"FAIL: POST /api/analyze - Error - {e}")

log("\n--- Testing Complete ---")

with open("test_results.log", "w", encoding="utf-8") as f:
    f.write("\n".join(r_log))
