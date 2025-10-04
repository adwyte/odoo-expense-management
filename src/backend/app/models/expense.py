from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Date, Enum, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
import enum
import uuid
from datetime import datetime
from ..utils.app.database import Base  # uses your existing Base/engine

class ExpenseStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    WAITING_APPROVAL = "WAITING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

class Expense(Base):
    __tablename__ = "expenses"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    employee_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    category: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)
    expense_date: Mapped[datetime | None] = mapped_column(Date)
    currency_code: Mapped[str] = mapped_column(String(8))
    amount_original: Mapped[float] = mapped_column(Numeric(20,2), default=0)
    amount_company: Mapped[float | None] = mapped_column(Numeric(20,2))
    status: Mapped[ExpenseStatus] = mapped_column(Enum(ExpenseStatus), default=ExpenseStatus.DRAFT)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    receipts: Mapped[list["Receipt"]] = relationship(back_populates="expense")

class Receipt(Base):
    __tablename__ = "receipts"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expense_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("expenses.id", ondelete="CASCADE"))
    file_url: Mapped[str] = mapped_column(Text)
    ocr_text: Mapped[str | None] = mapped_column(Text)
    ocr_json: Mapped[dict | None] = mapped_column(JSONB)
    uploaded_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    uploaded_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    expense: Mapped[Expense | None] = relationship(back_populates="receipts")
