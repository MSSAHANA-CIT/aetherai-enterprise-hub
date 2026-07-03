from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ROLE_EMPLOYEE = "employee"
ROLE_MANAGER = "manager"
ROLE_ADMIN = "admin"
ROLE_ADMIN_REQUEST = "admin_request"
ROLE_SUPER_ADMIN = "super_admin"

VALID_ROLES = frozenset({ROLE_EMPLOYEE, ROLE_MANAGER, ROLE_ADMIN, ROLE_ADMIN_REQUEST, ROLE_SUPER_ADMIN})
ADMIN_ROLES = frozenset({ROLE_ADMIN, ROLE_SUPER_ADMIN})


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.access_token_expire_hours)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        subject = payload.get("sub")
        if subject is None:
            return None
        return str(subject)
    except JWTError:
        return None


def is_valid_role(role: str) -> bool:
    return role in VALID_ROLES


def is_admin_role(role: str) -> bool:
    return role in ADMIN_ROLES


def is_super_admin_role(role: str) -> bool:
    return role == ROLE_SUPER_ADMIN
