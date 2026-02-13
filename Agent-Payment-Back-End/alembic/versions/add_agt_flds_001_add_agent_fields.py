"""add agent fields

Revision ID: add_agt_flds_001
Revises: 9182981db22b
Create Date: 2026-02-13 06:35:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_agt_flds_001'
down_revision = '9182981db22b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add columns to agents table
    op.add_column('agents', sa.Column('date_of_birth', sa.Date(), nullable=True))
    op.add_column('agents', sa.Column('email_address', sa.String(), nullable=True))
    op.add_column('agents', sa.Column('phone_number', sa.String(), nullable=True))
    
    # Create unique constraint for email_address
    op.create_unique_constraint('uq_agent_email', 'agents', ['email_address'])


def downgrade() -> None:
    # Remove unique constraint
    op.drop_constraint('uq_agent_email', 'agents', type_='unique')
    
    # Remove columns from agents table
    op.drop_column('agents', 'phone_number')
    op.drop_column('agents', 'email_address')
    op.drop_column('agents', 'date_of_birth')
