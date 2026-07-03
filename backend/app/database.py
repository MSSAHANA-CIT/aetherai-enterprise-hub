from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_database_host_type, settings

_database_url = (settings.database_url or "").strip()
if not _database_url:
    raise RuntimeError(
        "DATABASE_URL is not configured. Set DATABASE_URL environment variable."
    )

print("Database host type:", get_database_host_type(_database_url))

_is_sqlite = _database_url.startswith("sqlite")

if _database_url.startswith("postgresql"):
    try:
        import psycopg2  # noqa: F401
    except ImportError:
        try:
            import psycopg  # noqa: F401
        except ImportError as exc:
            raise RuntimeError(
                "PostgreSQL driver not installed. "
                "Install psycopg2-binary or psycopg[binary]."
            ) from exc
        if "+psycopg" not in _database_url:
            _database_url = _database_url.replace(
                "postgresql://", "postgresql+psycopg://", 1
            )

connect_args = {"check_same_thread": False} if _is_sqlite else {}

engine = create_engine(_database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
