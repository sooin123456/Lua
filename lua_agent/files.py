from __future__ import annotations

import re


def safe_markdown_filename(name: str) -> str:
    cleaned = re.sub(r'[<>:"/\\|?*]+', " ", name)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return f"{cleaned or 'Untitled'}.md"
