from __future__ import annotations

import csv
import io
import json
from datetime import datetime, timezone
from typing import Any

SUPPORTED_FORMATS = {"txt", "md", "json", "csv", "pdf"}


def _utc_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def export_content(*, content: str, title: str, export_format: str, metadata: dict[str, Any] | None = None) -> tuple[bytes, str, str]:
    fmt = export_format.lower().strip()
    if fmt not in SUPPORTED_FORMATS:
        raise ValueError(f"Unsupported format: {export_format}")

    safe_title = "".join(c if c.isalnum() or c in ("-", "_", " ") else "_" for c in title).strip() or "export"
    filename_base = safe_title.replace(" ", "_")

    if fmt == "txt":
        body = f"{title}\n{'=' * len(title)}\nExported: {_utc_stamp()}\n\n{content}"
        return body.encode("utf-8"), f"{filename_base}.txt", "text/plain"

    if fmt == "md":
        body = f"# {title}\n\n*Exported: {_utc_stamp()}*\n\n{content}"
        return body.encode("utf-8"), f"{filename_base}.md", "text/markdown"

    if fmt == "json":
        payload = {
            "title": title,
            "exported_at": _utc_stamp(),
            "content": content,
            "metadata": metadata or {},
        }
        return json.dumps(payload, indent=2).encode("utf-8"), f"{filename_base}.json", "application/json"

    if fmt == "csv":
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        rows = (metadata or {}).get("rows")
        if isinstance(rows, list) and rows:
            if rows and isinstance(rows[0], dict):
                headers = ["task", "owner", "deadline", "description", "priority"]
                writer.writerow(headers)
                for row in rows:
                    if not isinstance(row, dict):
                        writer.writerow([str(row), "", "", "", ""])
                        continue
                    writer.writerow([
                        str(row.get("task") or row.get("title") or row.get("description") or ""),
                        str(row.get("owner") or row.get("assignee") or ""),
                        str(row.get("deadline") or row.get("due_date") or row.get("suggested_due_date") or ""),
                        str(row.get("description") or ""),
                        str(row.get("priority") or ""),
                    ])
            else:
                writer.writerow(["item"])
                for row in rows:
                    writer.writerow([str(row)])
        else:
            writer.writerow(["title", "exported_at", "content"])
            writer.writerow([title, _utc_stamp(), content])
        return buffer.getvalue().encode("utf-8"), f"{filename_base}.csv", "text/csv"

    # Minimal text-only PDF
    pdf_bytes = _build_simple_pdf(title=title, content=content)
    return pdf_bytes, f"{filename_base}.pdf", "application/pdf"


def _build_simple_pdf(*, title: str, content: str) -> bytes:
    """Generate a basic single-page PDF without external dependencies."""
    lines = [title, "", f"Exported: {_utc_stamp()}", ""] + content.replace("\r", "").split("\n")
    text_ops = ["BT", "/F1 11 Tf", "50 750 Td", "14 TL"]
    y_offset = 0
    for line in lines[:60]:
        escaped = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        if y_offset == 0:
            text_ops.append(f"({escaped}) Tj")
        else:
            text_ops.append("T*")
            text_ops.append(f"({escaped}) Tj")
        y_offset += 1
    text_ops.append("ET")
    stream = "\n".join(text_ops).encode("latin-1", errors="replace")

    objects: list[bytes] = []
    objects.append(b"1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n")
    objects.append(b"2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n")
    objects.append(
        b"3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n"
    )
    objects.append(
        f"4 0 obj<< /Length {len(stream)} >>stream\n".encode("ascii")
        + stream
        + b"\nendstream endobj\n"
    )
    objects.append(b"5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n")

    pdf = b"%PDF-1.4\n"
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf += obj

    xref_pos = len(pdf)
    pdf += f"xref\n0 {len(offsets)}\n".encode("ascii")
    pdf += b"0000000000 65535 f \n"
    for offset in offsets[1:]:
        pdf += f"{offset:010d} 00000 n \n".encode("ascii")
    pdf += (
        f"trailer<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF".encode("ascii")
    )
    return pdf
