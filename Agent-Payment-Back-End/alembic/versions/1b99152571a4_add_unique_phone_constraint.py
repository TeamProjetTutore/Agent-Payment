"""add_unique_phone_constraint

Revision ID: 1b99152571a4
Revises: add_agt_flds_001
Create Date: 2026-02-13 08:08:14.706500

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1b99152571a4'
down_revision: Union[str, Sequence[str], None] = 'add_agt_flds_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add unique constraint to phone_number column
    # First, remove any duplicate phone numbers by setting them to NULL
    op.execute("""
        UPDATE agents 
        SET phone_number = NULL 
        WHERE id NOT IN (
            SELECT MIN(id) 
            FROM agents 
            WHERE phone_number IS NOT NULL 
            GROUP BY phone_number
        ) AND phone_number IS NOT NULL
    """)
    
    # Now add the unique constraint
    op.create_unique_constraint('uq_agents_phone_number', 'agents', ['phone_number'])


def downgrade() -> None:
    """Downgrade schema."""
    # Remove unique constraint from phone_number column
    op.drop_constraint('uq_agents_phone_number', 'agents', type_='unique')
