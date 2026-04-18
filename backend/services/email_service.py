import smtplib
import ssl
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASS = os.getenv("EMAIL_PASS", "")
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))


def _html_template(otp: str, recipient_name: str, purpose: str = "reset") -> str:
    if purpose == "signup":
        title = "Verify Your Email Address"
        desc  = (
            "Thanks for signing up for Opportunity Copilot! "
            "Use the OTP below to verify your email and activate your account. "
            "This code is valid for <strong>2 minutes</strong>."
        )
        subject_label = "Email Verification Code"
        warning_text  = "If you didn't sign up, ignore this email."
    else:
        title = "Your Password Reset Code"
        desc  = (
            "We received a request to reset the password for your Opportunity Copilot account. "
            "Use the OTP below to proceed. This code is valid for <strong>10 minutes</strong>."
        )
        subject_label = "One-Time Password"
        warning_text  = "Didn't request this? Ignore this email — your account remains secure. Never share this OTP with anyone."

    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body {{ margin:0; padding:0; background:#0a0b14; font-family:'Segoe UI',Arial,sans-serif; }}
    .wrap {{ max-width:520px; margin:40px auto; background:#0f1120; border-radius:20px; overflow:hidden; border:1px solid rgba(99,102,241,0.2); }}
    .header {{ background:linear-gradient(135deg,#4f46e5,#7c3aed); padding:36px 40px 28px; text-align:center; }}
    .logo {{ display:inline-flex; align-items:center; gap:10px; }}
    .logo-icon {{ width:40px;height:40px;background:rgba(255,255,255,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px; }}
    .logo-text {{ color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.3px; }}
    .body {{ padding:36px 40px; }}
    .greeting {{ color:#94a3b8;font-size:14px;margin-bottom:6px; }}
    .title {{ color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 16px; }}
    .desc {{ color:#64748b;font-size:14px;line-height:1.6;margin-bottom:28px; }}
    .otp-wrap {{ background:#1e1b4b;border:1px solid #4f46e5;border-radius:14px;padding:24px;text-align:center;margin-bottom:24px; }}
    .otp-label {{ color:#818cf8;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px; }}
    .otp {{ color:#fff;font-size:42px;font-weight:800;letter-spacing:10px;font-family:'Courier New',monospace; }}
    .expiry {{ color:#94a3b8;font-size:12px;margin-top:10px; }}
    .divider {{ border:none;border-top:1px solid #1e293b;margin:24px 0; }}
    .warning {{ background:#1e1019;border:1px solid #7f1d1d;border-radius:10px;padding:14px 18px;color:#fca5a5;font-size:12px;line-height:1.5; }}
    .footer {{ background:#080910;padding:20px 40px;text-align:center;color:#334155;font-size:11px; }}
    .footer a {{ color:#4f46e5;text-decoration:none; }}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">📬</div>
        <div class="logo-text">Opportunity Copilot</div>
      </div>
    </div>
    <div class="body">
      <p class="greeting">Hello, {recipient_name}</p>
      <h2 class="title">{title}</h2>
      <p class="desc">{desc}</p>
      <div class="otp-wrap">
        <div class="otp-label">{subject_label}</div>
        <div class="otp">{otp}</div>
        <div class="expiry">{'Expires in 2 minutes' if purpose == 'signup' else 'Expires in 10 minutes'}</div>
      </div>
      <hr class="divider"/>
      <div class="warning">
        <strong>Didn't request this?</strong> {warning_text}
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Opportunity Copilot &nbsp;·&nbsp;
      Built for SOFTEC 2026
    </div>
  </div>
</body>
</html>
"""


def send_otp_email(to_email: str, recipient_name: str, otp: str, purpose: str = "reset") -> bool:
    """Send OTP email. Returns True on success, False on failure."""
    if not EMAIL_USER or not EMAIL_PASS:
        print("[Email] No credentials configured — skipping send")
        return False

    msg = MIMEMultipart("alternative")
    if purpose == "signup":
        msg["Subject"] = f"{otp} is your Opportunity Copilot verification code"
        expiry_text    = "2 minutes"
        action_text    = "verify your email"
    else:
        msg["Subject"] = f"{otp} is your Opportunity Copilot reset code"
        expiry_text    = "10 minutes"
        action_text    = "reset your password"

    msg["From"] = f"Opportunity Copilot <{EMAIL_USER}>"
    msg["To"]   = to_email

    # Plain-text fallback
    plain = (
        f"Hi {recipient_name},\n\n"
        f"Your OTP to {action_text} is: {otp}\n\n"
        f"This code expires in {expiry_text}.\n\n"
        f"If you did not request this, ignore this email.\n\n"
        f"— Opportunity Copilot"
    )
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(_html_template(otp, recipient_name, purpose), "html"))

    # Try STARTTLS first (port 587), fallback to SSL (port 465)
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=10) as smtp:
            smtp.ehlo()
            smtp.starttls(context=ctx)
            smtp.ehlo()
            smtp.login(EMAIL_USER, EMAIL_PASS)
            smtp.sendmail(EMAIL_USER, to_email, msg.as_string())
        print(f"[Email] OTP sent to {to_email}")
        return True
    except Exception as e:
        print(f"[Email] STARTTLS failed: {e} — trying SSL port 465")

    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        with smtplib.SMTP_SSL(EMAIL_HOST, 465, context=ctx, timeout=10) as smtp:
            smtp.login(EMAIL_USER, EMAIL_PASS)
            smtp.sendmail(EMAIL_USER, to_email, msg.as_string())
        print(f"[Email] OTP sent via SSL to {to_email}")
        return True
    except Exception as e:
        print(f"[Email] SSL also failed: {e}")
        return False
