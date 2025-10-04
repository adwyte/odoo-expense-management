from __future__ import annotations
import io, re, json, os
from dataclasses import dataclass
from typing import Optional
from PIL import Image
import dateparser

# Try pytesseract if available; otherwise fall back to “no OCR”
try:
    import pytesseract
    _HAS_TESS = True
except Exception:
    _HAS_TESS = False

CURRENCY_SIGNS = {"₹":"INR","$":"USD","€":"EUR","£":"GBP"}

@dataclass
class OcrResult:
    text: str
    amount: Optional[float] = None
    currency: Optional[str] = None
    date: Optional[str] = None
    merchant: Optional[str] = None
    lines: list[str] = None

def _extract_text(image_bytes: bytes) -> str:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    if _HAS_TESS:
        try:
            return pytesseract.image_to_string(img)
        except Exception:
            pass
    # “no OCR mode”: try to read any embedded text-like pixels -> just return empty string
    return ""

_amount_re = re.compile(r"(?i)(total|amount|amt|balance)\D{0,10}([+-]?\d{1,3}(?:[, ]\d{3})*(?:\.\d{2})?)")
_currency_code_re = re.compile(r"\b(USD|EUR|INR|GBP|AED|CAD|AUD|JPY|CNY)\b", re.I)
_date_re = re.compile(r"\b(\d{1,2}[-/ ](?:\d{1,2}|[A-Za-z]{3,})[-/ ]\d{2,4})\b")

def parse_receipt_text(text: str) -> OcrResult:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    # amount
    amount = None
    m = _amount_re.search(text.replace(",", ""))
    if m:
        try:
            amount = float(m.group(2))
        except Exception:
            pass
    # currency
    currency = None
    for ch, code in CURRENCY_SIGNS.items():
        if ch in text:
            currency = code; break
    if not currency:
        m = _currency_code_re.search(text)
        if m: currency = m.group(1).upper()

    # date
    dt = None
    m = _date_re.search(text)
    if m:
        dtp = dateparser.parse(m.group(1))
        if dtp:
            dt = dtp.date().isoformat()

    # merchant (best-effort: first non-numeric header line)
    merchant = None
    for l in lines[:5]:
        if len(l) > 2 and not re.search(r"\d", l):
            merchant = l[:128]
            break

    return OcrResult(text=text, amount=amount, currency=currency, date=dt, merchant=merchant, lines=lines)
