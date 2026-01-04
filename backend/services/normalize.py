import re
from typing import List, Dict, Any
from services.knowledge import KnowledgeBase

_SPLIT_RE = re.compile(r",(?![^()]*\))")  # split on commas not inside parentheses

def _clean_token(t: str) -> str:
    t = t.strip()
    t = re.sub(r"\s+", " ", t)
    t = t.strip(" .;:")
    return t

def _explode_parentheses(token: str) -> List[str]:
    # e.g. "whey (milk), soy lecithin" => ["whey", "milk"]
    # keep both outer + inner for better tagging
    out = []
    token = token.strip()
    if "(" in token and ")" in token:
        outer = token[:token.index("(")].strip()
        inner = token[token.index("(")+1:token.rindex(")")].strip()
        if outer:
            out.append(outer)
        # inner may have commas
        for part in inner.split(","):
            part = part.strip()
            if part:
                out.append(part)
    else:
        out.append(token)
    return out

def normalize_ingredients(text: str, kb: KnowledgeBase) -> List[Dict[str, Any]]:
    if not text or not text.strip():
        return []

    # remove leading "ingredients:" label
    text = re.sub(r"^\s*ingredients\s*:\s*", "", text.strip(), flags=re.IGNORECASE)

    raw_tokens = _SPLIT_RE.split(text)
    expanded = []
    for tok in raw_tokens:
        tok = _clean_token(tok)
        if not tok:
            continue
        expanded.extend(_explode_parentheses(tok))

    results: List[Dict[str, Any]] = []
    seen = set()

    for raw in expanded:
        raw_clean = _clean_token(raw)
        if not raw_clean:
            continue

        canonical = kb.resolve(raw_clean)
        meta = kb.get(canonical)

        # avoid exact duplicates
        key = canonical
        if key in seen:
            continue
        seen.add(key)

        results.append({
            "raw": raw_clean,
            "canonical": canonical,
            "known": meta is not None,
            "category": (meta.get("category") if meta else "unknown"),
            "function": (meta.get("function") if meta else "unknown"),
            "flags": (meta.get("flags") if meta else []),
            "evidence": (meta.get("evidence") if meta else "unknown"),
            "notes": (meta.get("notes") if meta else "")
        })

    return results
