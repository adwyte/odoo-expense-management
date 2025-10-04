from __future__ import annotations
import io, re
from dataclasses import dataclass
from typing import Optional
from PIL import Image

try:
    import pytesseract
    _HAS_TESS = True
except Exception:
    _HAS_TESS = False

@dataclass
class OcrParsed:
    text: str
    amount: Optional[float]
    currency: Optional[str]
    date: Optional[str]          # ISO 'YYYY-MM-DD'
    merchant: Optional[str]
    lines: list[str]

def _extract_text(image_bytes: bytes) -> str:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    if _HAS_TESS:
        try:
            return pytesseract.image_to_string(img)
        except Exception:
            return ""
    return ""  # fallback when Tesseract isn't installed

_amount_re = re.compile(r"(?i)(total|amount|amt)\D{0,10}([+-]?\d{1,3}(?:[, ]\d{3})*(?:\.\d{2})?)")
_currency_code_re = re.compile(r"\b(INR|USD|EUR|GBP|JPY|AED|CAD|AUD)\b", re.I)
_date_re = re.compile(r"\b(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b")

def parse_receipt_text(text: str) -> OcrParsed:
    lines = [l.strip() for l in (text or "").splitlines() if l.strip()]

    # amount
    amt = None
    m = _amount_re.search((text or "").replace(",", ""))
    if m:
        try:
            amt = float(m.group(2))
        except Exception:
            amt = None

    # currency
    cur = None
    m = _currency_code_re.search(text or "")
    if m:
        cur = m.group(1).upper()

    # date → ISO if possible
    dt = None
    m = _date_re.search(text or "")
    if m:
        s = m.group(1)
        # crude normalizer
        s = s.replace("/", "-")
        parts = s.split("-")
        if len(parts[0]) == 4:
            dt = s  # already YYYY-MM-DD-ish
        else:
            # assume DD-MM-YYYY or MM-DD-YYYY → best-effort normalize
            p = [p.zfill(2) for p in parts]
            if len(p) == 3 and len(p[2]) == 4:
                # try D-M-Y -> Y-M-D
                dt = f"{p[2]}-{p[1]}-{p[0]}"

    # merchant (first header-like line without digits)
    merch = None
    for l in lines[:5]:
        if len(l) > 2 and not re.search(r"\d", l):
            merch = l[:128]
            break

    return OcrParsed(text or "", amt, cur or "INR", dt, merch, lines)
