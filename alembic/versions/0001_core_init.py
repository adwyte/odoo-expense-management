"""Core init: companies, users, expenses (OCR-ready)

Revision ID: 0001_core_init
Revises:
Create Date: 2025-10-04
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as psql

revision = "0001_core_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    # companies (email already unique via column arg)
    op.create_table(
        "companies",
        sa.Column("id", psql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(120), nullable=False, unique=True),
        sa.Column("phone", sa.String(20)),
        sa.Column("address", sa.Text),
        sa.Column("country_code", sa.String(2), nullable=False),
        sa.Column("currency_code", sa.String(3), nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("TRUE")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=False), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=False), nullable=False, server_default=sa.text("NOW()")),
    )

    # users
    op.create_table(
        "users",
        sa.Column("id", psql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("email", sa.String(120), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(128), nullable=False),
        sa.Column("first_name", sa.String(50), nullable=False),
        sa.Column("last_name", sa.String(50), nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("TRUE")),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=False), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=False), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("company_id", psql.UUID(as_uuid=True), nullable=False),
        sa.Column("manager_id", psql.UUID(as_uuid=True)),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["manager_id"], ["users.id"]),
    )
    op.create_index(
        "ix_users_email",
        "users",
        ["email"],
        unique=True,
        postgresql_with={"fillfactor": "100", "deduplicate_items": "true"},
    )

    # expenses (OCR-ready)
    op.create_table(
        "expenses",
        sa.Column("id", psql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("company_id", psql.UUID(as_uuid=True), nullable=False),
        sa.Column("employee_id", psql.UUID(as_uuid=True), nullable=False),

        sa.Column("description", sa.Text, nullable=False),
        sa.Column("category", sa.String(80)),
        sa.Column("expense_date", sa.Date),
        sa.Column("paid_by", sa.String(30)),
        sa.Column("remarks", sa.Text),

        sa.Column("amount", sa.Numeric(20, 2), nullable=False, server_default="0"),
        sa.Column("currency_code", sa.String(3), nullable=False, server_default="INR"),

        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.CheckConstraint(
            "status IN ('draft','submitted','waiting-approval','approved','rejected')",
            name="ck_expenses_status_valid",
        ),

        sa.Column("file_url", sa.Text),
        sa.Column("ocr_text", sa.Text),
        sa.Column("ocr_json", psql.JSONB),

        sa.Column("created_at", sa.TIMESTAMP(timezone=False), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=False), nullable=False, server_default=sa.text("NOW()")),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.ForeignKeyConstraint(["employee_id"], ["users.id"]),
    )

    op.create_index("expenses_company_status_idx", "expenses", ["company_id", "status"])
    op.create_index("expenses_employee_idx", "expenses", ["employee_id", sa.text("expense_date DESC")])

    op.execute(
        """
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
        """
    )
    op.execute(
        """
        CREATE TRIGGER expenses_set_updated_at
        BEFORE UPDATE ON expenses
        FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
        """
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS expenses_set_updated_at ON expenses;")
    op.execute("DROP FUNCTION IF EXISTS set_updated_at;")
    op.drop_index("expenses_employee_idx", table_name="expenses")
    op.drop_index("expenses_company_status_idx", table_name="expenses")
    op.drop_table("expenses")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.drop_table("companies")
