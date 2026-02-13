"""add payment date column

Revision ID: 9182981db22b
Revises: adc9380f2523
Create Date: 2026-02-11 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '9182981db22b'
down_revision = 'adc9380f2523'
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Upgrade schema."""
    # Add the missing payment_date column
    op.add_column('payments', sa.Column('payment_date', sa.Date(), nullable=True))
    
    # Optional: Update existing rows with a default date
    op.execute("UPDATE payments SET payment_date = CURRENT_DATE WHERE payment_date IS NULL")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('payments', 'payment_date')
