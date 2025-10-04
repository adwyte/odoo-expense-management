from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from ...utils.app.database import get_db
from ...services.ocr_service import _extract_text, parse_receipt_text
from ...models.expense import Expense
from sqlalchemy import select
import uuid, os, shutil
from datetime import date

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

from sqlalchemy import select, text
from ...models.expense import Expense
# If you have SQLAlchemy models for users/companies use them; we’ll use SQL for simplicity.

DEMO_COMPANY_EMAIL = "adwyte@odoo.com"
DEMO_USER_EMAIL = "adwyte@trackon.com"

def _ensure_demo_entities(db) -> tuple[uuid.UUID, uuid.UUID]:
    # company
    row = db.execute(text("SELECT id FROM companies WHERE email=:e"), {"e": DEMO_COMPANY_EMAIL}).first()
    if row:
        company_id = row[0]
    else:
        company_id = uuid.uuid4()
        db.execute(text("""
            INSERT INTO companies (id,name,email,phone,address,country_code,currency_code,is_active,created_at,updated_at)
            VALUES (:id,'Demo Co',:email,'+91-000','Demo Address','IN','INR',true,NOW(),NOW())
        """), {"id": str(company_id), "email": DEMO_COMPANY_EMAIL})

    # user (employee)
    row = db.execute(text("SELECT id FROM users WHERE email=:e"), {"e": DEMO_USER_EMAIL}).first()
    if row:
        employee_id = row[0]
    else:
        employee_id = uuid.uuid4()
        db.execute(text("""
            INSERT INTO users (id,email,password_hash,first_name,last_name,is_active,role,created_at,updated_at,company_id)
            VALUES (:id,:email,'bcrypt$demo','Demo','Employee',true,'EMPLOYEE',NOW(),NOW(),:cid)
        """), {"id": str(employee_id), "email": DEMO_USER_EMAIL, "cid": str(company_id)})

    db.commit()
    return (uuid.UUID(str(company_id)), uuid.UUID(str(employee_id)))


@router.post("/ocr-upload")
async def ocr_upload_receipt(
    file: UploadFile = File(...),
    employee_id: str | None = Form(None),
    company_id: str | None = Form(None),
    db: Session = Depends(get_db),
):
    # if IDs are missing or invalid -> create/fetch demo ones
    try:
        emp_id = uuid.UUID(employee_id) if employee_id else None
        comp_id = uuid.UUID(company_id) if company_id else None
    except Exception:
        emp_id = comp_id = None

    if not emp_id or not comp_id:
        comp_id, emp_id = _ensure_demo_entities(db)

    # 1) persist file
    ext = os.path.splitext(file.filename or "")[1] or ".jpg"
    out_name = f"{uuid.uuid4()}{ext}"
    out_path = os.path.join(UPLOAD_DIR, out_name)
    with open(out_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # 2) OCR + parse
    with open(out_path, "rb") as fh:
        img_bytes = fh.read()
    text = _extract_text(img_bytes) or ""
    parsed = parse_receipt_text(text)

    # 3) insert expense (draft)
    from datetime import date
    exp_date = None
    if parsed.date:
        try:
            y, m, d = parsed.date.split("-")
            exp_date = date(int(y), int(m), int(d))
        except Exception:
            exp_date = None

    exp = Expense(
        company_id=comp_id,
        employee_id=emp_id,
        description=(parsed.merchant or "Receipt"),
        category=None,
        expense_date=exp_date,
        paid_by=None,
        remarks=None,
        amount=(parsed.amount or 0),
        currency_code=(parsed.currency or "INR"),
        status="draft",
        file_url=out_path,
        ocr_text=text,
        ocr_json={
            "amount": parsed.amount,
            "currency": parsed.currency,
            "date": parsed.date,
            "merchant": parsed.merchant,
            "lines": parsed.lines,
        },
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)

    return {
        "expense": {
            "id": str(exp.id),
            "status": exp.status,
            "amount": float(exp.amount or 0),
            "currency": exp.currency_code,
            "description": exp.description,
            "date": str(exp.expense_date) if exp.expense_date else "",
            "category": exp.category or "",
            "paid_by": exp.paid_by or "",
            "remarks": exp.remarks or ""
        },
        "parsed": exp.ocr_json,
        "file_url": exp.file_url,
    }


@router.get("/by-employee/{employee_id}")
def list_by_employee(employee_id: str, db: Session = Depends(get_db)):
    q = select(Expense).where(Expense.employee_id == uuid.UUID(employee_id)).order_by(Expense.created_at.desc())
    rows = db.execute(q).scalars().all()
    return [
        {
            "id": str(r.id),
            "employee_id": str(r.employee_id),
            "description": r.description,
            "date": str(r.expense_date) if r.expense_date else "",
            "category": r.category or "",
            "paidBy": r.paid_by or "",
            "remarks": r.remarks or "",
            "amount": float(r.amount or 0),
            "currency": r.currency_code,
            "status": r.status,
            "file_url": r.file_url,
        }
        for r in rows
    ]

from fastapi import HTTPException

@router.put("/{expense_id}")
def update_expense(expense_id: str, payload: dict, db: Session = Depends(get_db)):
    exp = db.get(Expense, uuid.UUID(expense_id))
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    for k in ["description", "category", "paid_by", "remarks", "currency_code", "status"]:
        if k in payload and payload[k] is not None:
            setattr(exp, k, payload[k])
    if "amount" in payload and payload["amount"] is not None:
        exp.amount = payload["amount"]
    if "expense_date" in payload and payload["expense_date"]:
        try:
            y, m, d = map(int, payload["expense_date"].split("-"))
            from datetime import date
            exp.expense_date = date(y, m, d)
        except Exception:
            pass
    db.commit()
    return {"ok": True, "id": str(exp.id)}
