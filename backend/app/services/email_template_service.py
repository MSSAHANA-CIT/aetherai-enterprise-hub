from app.core.config import settings

BRAND_NAME = "AetherAI Enterprise Hub"
SENDER_NAME = "AetherAI Security"


def _logo_block() -> str:
    return """
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 24px auto;">
      <tr>
        <td align="center" style="padding:16px 28px;border-radius:16px;background:linear-gradient(135deg,rgba(99,102,241,0.35),rgba(139,92,246,0.25));border:1px solid rgba(255,255,255,0.12);">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a5b4fc;font-weight:600;margin-bottom:6px;">&#9670; SECURITY</div>
          <div style="font-size:22px;font-weight:700;color:#ffffff;line-height:1.2;">AetherAI</div>
          <div style="font-size:12px;color:#c4b5fd;letter-spacing:1px;margin-top:4px;">Enterprise Security</div>
        </td>
      </tr>
    </table>
    """


def _wrap_email(*, title: str, body_html: str) -> str:
    return f"""\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(180deg,#0b0f1a 0%,#111827 50%,#0f172a 100%);padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <tr>
            <td style="padding:32px 28px;border-radius:20px;background:rgba(17,24,39,0.85);border:1px solid rgba(255,255,255,0.08);box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 60px rgba(99,102,241,0.08);">
              <div style="height:4px;border-radius:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7);margin:-32px -28px 28px -28px;"></div>
              {_logo_block()}
              {body_html}
              <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                <p style="margin:0;font-size:12px;color:#6b7280;">{BRAND_NAME} &bull; Secure AI Workspace</p>
                <p style="margin:6px 0 0;font-size:11px;color:#4b5563;">{SENDER_NAME}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _otp_code_block(otp_code: str) -> str:
    digits = list(otp_code)
    digit_cells = "".join(
        f'<td style="width:44px;height:52px;text-align:center;vertical-align:middle;'
        f'font-size:24px;font-weight:700;color:#ffffff;'
        f'background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.35);'
        f'border-radius:10px;letter-spacing:0;">{d}</td>'
        + ('<td style="width:8px;"></td>' if i < len(digits) - 1 else "")
        for i, d in enumerate(digits)
    )
    return f"""
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px auto;">
      <tr>{digit_cells}</tr>
    </table>
    """


def build_login_otp_email(*, otp_code: str) -> tuple[str, str, str]:
    expiry = settings.otp_expire_minutes
    subject = "Your AetherAI Login Verification Code"

    text_body = (
        f"{BRAND_NAME}\n"
        f"{SENDER_NAME}\n\n"
        "Login Verification Required\n\n"
        "We received a login request for your AetherAI Enterprise Hub account.\n\n"
        f"Your verification code: {otp_code}\n\n"
        f"This code expires in {expiry} minutes.\n\n"
        "If this was not you, you can safely ignore this email.\n\n"
        f"{BRAND_NAME} • Secure AI Workspace"
    )

    body_html = f"""
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#f9fafb;text-align:center;">Login Verification Required</h1>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#9ca3af;text-align:center;">
        We received a login request for your AetherAI Enterprise Hub account.
      </p>
      <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">Enter this verification code to continue:</p>
      {_otp_code_block(otp_code)}
      <p style="margin:0;font-size:13px;color:#fbbf24;text-align:center;">
        This code expires in <strong style="color:#fcd34d;">{expiry} minutes</strong>.
      </p>
      <div style="margin-top:24px;padding:14px 16px;border-radius:12px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);">
        <p style="margin:0;font-size:13px;color:#fca5a5;line-height:1.5;text-align:center;">
          If this was not you, you can safely ignore this email. Your account remains secure.
        </p>
      </div>
    """

    html_body = _wrap_email(title=subject, body_html=body_html)
    return subject, html_body, text_body


def build_signup_otp_email(*, otp_code: str) -> tuple[str, str, str]:
    expiry = settings.otp_expire_minutes
    subject = "Verify Your AetherAI Account"

    text_body = (
        f"{BRAND_NAME}\n"
        f"{SENDER_NAME}\n\n"
        "Welcome to AetherAI Enterprise Hub!\n\n"
        "Use the verification code below to activate your workspace account.\n\n"
        f"Your verification code: {otp_code}\n\n"
        f"This code expires in {expiry} minutes.\n\n"
        "If you did not create an account, you can safely ignore this email.\n\n"
        f"{BRAND_NAME} • Secure AI Workspace"
    )

    body_html = f"""
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#f9fafb;text-align:center;">Verify Your AetherAI Account</h1>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#9ca3af;text-align:center;">
        Welcome to AetherAI Enterprise Hub. Enter this code to activate your secure workspace.
      </p>
      <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">Your account verification code:</p>
      {_otp_code_block(otp_code)}
      <p style="margin:0;font-size:13px;color:#fbbf24;text-align:center;">
        This code expires in <strong style="color:#fcd34d;">{expiry} minutes</strong>.
      </p>
      <div style="margin-top:24px;padding:14px 16px;border-radius:12px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);">
        <p style="margin:0;font-size:13px;color:#c4b5fd;line-height:1.5;text-align:center;">
          Checking your secure workspace access — verify now to unlock AI collaboration, team chat, and enterprise tools.
        </p>
      </div>
    """

    html_body = _wrap_email(title=subject, body_html=body_html)
    return subject, html_body, text_body


def build_password_reset_otp_email(*, otp_code: str) -> tuple[str, str, str]:
    expiry = settings.otp_expire_minutes
    subject = "Reset Your AetherAI Password"

    text_body = (
        f"{BRAND_NAME}\n"
        f"{SENDER_NAME}\n\n"
        "Password Reset Verification\n\n"
        "Use the verification code below to reset your password.\n\n"
        f"Your verification code: {otp_code}\n\n"
        f"This code expires in {expiry} minutes.\n\n"
        "If you did not request a password reset, ignore this email and your password will remain unchanged.\n\n"
        f"{BRAND_NAME} • Secure AI Workspace"
    )

    body_html = f"""
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#f9fafb;text-align:center;">Password Reset Verification</h1>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#9ca3af;text-align:center;">
        Use the verification code below to reset your password.
      </p>
      <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">Your secure reset code:</p>
      {_otp_code_block(otp_code)}
      <p style="margin:0;font-size:13px;color:#fbbf24;text-align:center;">
        This code expires in <strong style="color:#fcd34d;">{expiry} minutes</strong>.
      </p>
      <div style="margin-top:24px;padding:14px 16px;border-radius:12px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);">
        <p style="margin:0;font-size:13px;color:#fca5a5;line-height:1.5;text-align:center;">
          <strong>Security warning:</strong> If you did not request this reset, do not share this code.
          Someone may be attempting to access your account.
        </p>
      </div>
    """

    html_body = _wrap_email(title=subject, body_html=body_html)
    return subject, html_body, text_body
