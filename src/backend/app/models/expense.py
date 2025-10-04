from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import String, Text, Date, Numeric
from datetime import datetime
import uuid
from ..utils.app.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    employee_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)

    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(80))
    expense_date: Mapped[datetime | None] = mapped_column(Date)
    paid_by: Mapped[str | None] = mapped_column(String(30))
    remarks: Mapped[str | None] = mapped_column(Text)

    amount: Mapped[float] = mapped_column(Numeric(20,2), default=0)
    currency_code: Mapped[str] = mapped_column(String(3), default="INR")

    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft/submitted/waiting-approval/approved/rejected

    file_url: Mapped[str | None] = mapped_column(Text)
    ocr_text: Mapped[str | None] = mapped_column(Text)
    ocr_json: Mapped[dict | None] = mapped_column(JSONB)

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
