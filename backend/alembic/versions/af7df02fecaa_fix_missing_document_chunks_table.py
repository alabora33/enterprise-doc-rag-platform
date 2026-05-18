"""fix missing document chunks table

Revision ID: af7df02fecaa
Revises: bbf5718ec7bd
Create Date: 2026-05-16 00:50:00.875056

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'af7df02fecaa'
down_revision: Union[str, Sequence[str], None] = 'bbf5718ec7bd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "document_chunks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.Column("organization_id", sa.Integer(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=True),
        sa.Column("sheet_name", sa.String(length=255), nullable=True),
        sa.Column("source_type", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["document_id"],
            ["documents.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_document_chunks_id"),
        "document_chunks",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_document_chunks_document_id"),
        "document_chunks",
        ["document_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_document_chunks_organization_id"),
        "document_chunks",
        ["organization_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_document_chunks_chunk_index"),
        "document_chunks",
        ["chunk_index"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_document_chunks_chunk_index"),
        table_name="document_chunks",
    )

    op.drop_index(
        op.f("ix_document_chunks_organization_id"),
        table_name="document_chunks",
    )

    op.drop_index(
        op.f("ix_document_chunks_document_id"),
        table_name="document_chunks",
    )

    op.drop_index(
        op.f("ix_document_chunks_id"),
        table_name="document_chunks",
    )

    op.drop_table("document_chunks")