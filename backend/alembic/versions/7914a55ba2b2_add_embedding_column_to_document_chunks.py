"""add embedding column to document chunks

Revision ID: 7914a55ba2b2
Revises: af7df02fecaa
Create Date: 2026-05-18 14:52:07.343610

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = '7914a55ba2b2'
down_revision: Union[str, Sequence[str], None] = 'af7df02fecaa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.add_column(
        "document_chunks",
        sa.Column(
            "embedding",
            Vector(1536),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column(
        "document_chunks",
        "embedding",
    )
