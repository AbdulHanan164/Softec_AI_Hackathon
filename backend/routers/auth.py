from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime
import hashlib
import secrets
import random
import time

from backend.services.email_service import send_otp_email

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ── In-memory stores ──────────────────────────────────────────────────────────
_users:        dict = {}   # email -> {name, email, password_hash, created_at}
_tokens:       dict = {}   # token -> {email, expires}
_otps:         dict = {}   # email -> {otp, expires, name}
_pending_regs: dict = {}   # email -> {name, password_hash, otp, expires}

TOKEN_EXPIRY      = 24 * 3600   # 24 h
OTP_EXPIRY        = 10 * 60     # 10 min
SIGNUP_OTP_EXPIRY = 2  * 60     # 2 min


# ── Helpers ───────────────────────────────────────────────────────────────────
def _hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def _make_token(email: str) -> str:
    token = secrets.token_urlsafe(32)
    _tokens[token] = {"email": email, "expires": time.time() + TOKEN_EXPIRY}
    return token


def _verify_token(token: str) -> str | None:
    data = _tokens.get(token)
    if not data:
        return None
    if time.time() > data["expires"]:
        _tokens.pop(token, None)
        return None
    return data["email"]


def _make_otp() -> str:
    return str(random.randint(100000, 999999))


security = HTTPBearer(auto_error=False)


def current_user(creds: HTTPAuthorizationCredentials | None = Depends(security)):
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    email = _verify_token(creds.credentials)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = _users.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── Schemas ───────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotRequest(BaseModel):
    email: str


class VerifyOTPRequest(BaseModel):
    email: str
    otp: str
    new_password: str


class ResendOTPRequest(BaseModel):
    email: str


class SignupOTPRequest(BaseModel):
    name: str
    email: str
    password: str


class VerifySignupOTPRequest(BaseModel):
    email: str
    otp: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/send-signup-otp")
def send_signup_otp(req: SignupOTPRequest):
    if not req.name.strip():
        raise HTTPException(400, "Name is required")
    if not req.email.strip() or "@" not in req.email:
        raise HTTPException(400, "Valid email is required")
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    email = req.email.lower().strip()
    if email in _users:
        raise HTTPException(409, "An account with this email already exists")

    otp = _make_otp()
    _pending_regs[email] = {
        "name": req.name.strip(),
        "password_hash": _hash(req.password),
        "otp": otp,
        "expires": time.time() + SIGNUP_OTP_EXPIRY,
    }
    sent = send_otp_email(email, req.name.strip(), otp, purpose="signup")
    return {
        "message": "OTP sent to your email. It expires in 2 minutes.",
        "sent": sent,
        **({"debug_otp": otp} if not sent else {}),
    }


@router.post("/verify-signup-otp")
def verify_signup_otp(req: VerifySignupOTPRequest):
    email = req.email.lower().strip()
    record = _pending_regs.get(email)
    if not record:
        raise HTTPException(400, "No pending registration found. Please start over.")
    if time.time() > record["expires"]:
        _pending_regs.pop(email, None)
        raise HTTPException(400, "OTP expired (2 min limit). Please sign up again.")
    if record["otp"] != req.otp.strip():
        raise HTTPException(400, "Incorrect OTP. Please try again.")
    if email in _users:
        _pending_regs.pop(email, None)
        raise HTTPException(409, "An account with this email already exists")

    _users[email] = {
        "name": record["name"],
        "email": email,
        "password_hash": record["password_hash"],
        "created_at": datetime.utcnow().isoformat(),
    }
    _pending_regs.pop(email, None)
    token = _make_token(email)
    return {"token": token, "user": {"name": record["name"], "email": email}}


@router.post("/register")
def register(req: RegisterRequest):
    if not req.name.strip():
        raise HTTPException(400, "Name is required")
    if not req.email.strip() or "@" not in req.email:
        raise HTTPException(400, "Valid email is required")
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    email = req.email.lower().strip()
    if email in _users:
        raise HTTPException(409, "An account with this email already exists")

    _users[email] = {
        "name": req.name.strip(),
        "email": email,
        "password_hash": _hash(req.password),
        "created_at": datetime.utcnow().isoformat(),
    }
    token = _make_token(email)
    return {"token": token, "user": {"name": req.name.strip(), "email": email}}


@router.post("/login")
def login(req: LoginRequest):
    email = req.email.lower().strip()
    user  = _users.get(email)
    if not user or user["password_hash"] != _hash(req.password):
        raise HTTPException(401, "Invalid email or password")
    token = _make_token(email)
    return {"token": token, "user": {"name": user["name"], "email": email}}


@router.post("/forgot-password")
def forgot_password(req: ForgotRequest):
    email = req.email.lower().strip()
    user  = _users.get(email)

    if not user:
        # Don't reveal whether email exists — return success anyway
        return {"message": "If this email is registered, an OTP has been sent.", "sent": False}

    otp = _make_otp()
    _otps[email] = {"otp": otp, "expires": time.time() + OTP_EXPIRY, "name": user["name"]}

    sent = send_otp_email(email, user["name"], otp)

    return {
        "message": "OTP sent to your email address. Check your inbox (and spam folder).",
        "sent": sent,
        # Only include OTP in response when email fails (so demo still works)
        **({"debug_otp": otp} if not sent else {}),
    }


@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest):
    email = req.email.lower().strip()

    record = _otps.get(email)
    if not record:
        raise HTTPException(400, "No OTP found for this email. Please request a new one.")
    if time.time() > record["expires"]:
        _otps.pop(email, None)
        raise HTTPException(400, "OTP has expired. Please request a new one.")
    if record["otp"] != req.otp.strip():
        raise HTTPException(400, "Incorrect OTP. Please try again.")
    if len(req.new_password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")

    # Update password
    if email not in _users:
        raise HTTPException(404, "Account not found")
    _users[email]["password_hash"] = _hash(req.new_password)
    _otps.pop(email, None)

    # Auto-login after reset
    token = _make_token(email)
    return {
        "message": "Password reset successfully.",
        "token": token,
        "user": {"name": _users[email]["name"], "email": email},
    }


@router.post("/resend-otp")
def resend_otp(req: ResendOTPRequest):
    email = req.email.lower().strip()
    user  = _users.get(email)
    if not user:
        return {"message": "If this email is registered, a new OTP has been sent.", "sent": False}

    otp = _make_otp()
    _otps[email] = {"otp": otp, "expires": time.time() + OTP_EXPIRY, "name": user["name"]}
    sent = send_otp_email(email, user["name"], otp)

    return {
        "message": "New OTP sent.",
        "sent": sent,
        **({"debug_otp": otp} if not sent else {}),
    }


@router.get("/me")
def me(user=Depends(current_user)):
    return {"name": user["name"], "email": user["email"], "created_at": user["created_at"]}
