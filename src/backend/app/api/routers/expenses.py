from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from ...utils.app.database import get_db
from ...services.ocr_service import _extract_text, parse_receipt_text
from ...models.expense import Expense, Receipt, ExpenseStatus
from sqlalchemy import select
import uuid
import os, shutil

router = APIRouter(prefix="/api/expenses", tags=["expenses"])

# where to store uploaded images (dev)
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/ocr-upload")
async def ocr_upload_receipt(
    file: UploadFile = File(...),
    employee_id: str = Form(...),
    company_id: str = Form(...),
    db: Session = Depends(get_db),
):
    # store file
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    out_name = f"{uuid.uuid4()}{ext}"
    out_path = os.path.join(UPLOAD_DIR, out_name)
    with open(out_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    with open(out_path, "rb") as fh:
        img_bytes = fh.read()
    text = _extract_text(img_bytes)
    parsed = parse_receipt_text(text)

    if not parsed.currency:
        # default to company currency if you want (simplify hackathon)
        # You can also look it up from companies table; for brevity just fallback to 'INR'
        parsed.currency = "INR"

    # Create expense (DRAFT) with what we parsed
    exp = Expense(
        company_id=uuid.UUID(company_id),
        employee_id=uuid.UUID(employee_id),
        category="Uncategorized",
        description=parsed.merchant or "Receipt",
        expense_date=None,
        currency_code=parsed.currency,
        amount_original=parsed.amount or 0,
        amount_company=None,  # if you have a trigger it will fill later
        status=ExpenseStatus.DRAFT,
    )
    db.add(exp)
    db.flush()  # get exp.id

    rec = Receipt(
        expense_id=exp.id,
        file_url=out_path,
        ocr_text=text,
        ocr_json={
            "amount": parsed.amount,
            "currency": parsed.currency,
            "date": parsed.date,
            "merchant": parsed.merchant,
            "lines": parsed.lines,
        },
        uploaded_by=uuid.UUID(employee_id),
    )
    db.add(rec)
    db.commit()
    db.refresh(exp)

    return {
        "expense": {
            "id": str(exp.id),
            "status": exp.status.value,
            "amount_original": float(exp.amount_original or 0),
            "currency_code": exp.currency_code,
            "description": exp.description,
        },
        "receipt": {"id": str(rec.id), "file_url": rec.file_url},
        "parsed": rec.ocr_json,
    }
