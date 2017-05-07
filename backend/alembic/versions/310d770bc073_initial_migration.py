"""initial migration

Revision ID: 310d770bc073
Revises:
Create Date: 2017-03-26 19:56:35.383426

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '310d770bc073'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('Entity_Types',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String(length=255), nullable=True),
                    sa.Column('delete_ts', sa.Integer(), nullable=True),
                    sa.PrimaryKeyConstraint('id'))
    op.create_table('Entities',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('entity_type_id_fk', sa.Integer(), nullable=False),
                    sa.Column('parent_id_fk', sa.Integer(), nullable=True),
                    sa.Column('last_data_fetch_ts', sa.Integer(), nullable=False, default=0),
                    sa.Column('delete_ts', sa.Integer(), nullable=True),
                    sa.ForeignKeyConstraint(['entity_type_id_fk'], ['Entity_Types.id'], ),
                    sa.ForeignKeyConstraint(['parent_id_fk'], ['Entities.id'], ),
                    sa.PrimaryKeyConstraint('id'))
    op.create_table('Meta_Attributes',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String(length=255), nullable=False),
                    sa.Column('entity_type_id_fk', sa.Integer(), nullable=False),
                    sa.Column('delete_ts', sa.Integer(), nullable=True),
                    sa.ForeignKeyConstraint(['entity_type_id_fk'], ['Entity_Types.id'], ),
                    sa.PrimaryKeyConstraint('id'))
    op.create_table('Series_Attributes',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String(length=255), nullable=False),
                    sa.Column('entity_type_id_fk', sa.Integer(), nullable=False),
                    sa.Column('delete_ts', sa.Integer(), nullable=True),
                    sa.Column('type', sa.Enum('real', 'enum', name='series_type'), nullable=False,
                              default='real'),
                    sa.Column('refresh_time', sa.Integer(), nullable=True),
                    sa.ForeignKeyConstraint(['entity_type_id_fk'], ['Entity_Types.id'], ),
                    sa.PrimaryKeyConstraint('id'))
    op.create_table('Tag_Attributes',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String(length=255), nullable=False),
                    sa.Column('entity_type_id_fk', sa.Integer(), nullable=False),
                    sa.Column('delete_ts', sa.Integer(), nullable=True),
                    sa.ForeignKeyConstraint(['entity_type_id_fk'], ['Entity_Types.id'], ),
                    sa.PrimaryKeyConstraint('id'))
    op.create_table('Entity_Meta',
                    sa.Column('entity_id_fk', sa.Integer(), nullable=False),
                    sa.Column('meta_id_fk', sa.Integer(), nullable=False),
                    sa.Column('value', sa.String(length=255), nullable=False),
                    sa.Column('delete_ts', sa.Integer(), nullable=True),
                    sa.ForeignKeyConstraint(['entity_id_fk'], ['Entities.id'], ),
                    sa.ForeignKeyConstraint(['meta_id_fk'], ['Meta_Attributes.id'], ),
                    sa.PrimaryKeyConstraint('entity_id_fk', 'meta_id_fk'))
    op.create_table('Entity_Tags',
                    sa.Column('entity_id_fk', sa.Integer(), nullable=False),
                    sa.Column('tag_id_fk', sa.Integer(), nullable=False),
                    sa.Column('value', sa.String(length=255), nullable=False),
                    sa.Column('delete_ts', sa.Integer(), nullable=True),
                    sa.ForeignKeyConstraint(['entity_id_fk'], ['Entities.id'], ),
                    sa.ForeignKeyConstraint(['tag_id_fk'], ['Tag_Attributes.id'], ),
                    sa.PrimaryKeyConstraint('entity_id_fk', 'tag_id_fk'))


def downgrade():
    op.drop_table('Entity_Tags')
    op.drop_table('Entity_Meta')
    op.drop_table('Tag_Attributes')
    op.drop_table('Series_Attributes')
    op.drop_table('Meta_Attributes')
    op.drop_table('Entities')
    op.drop_table('Entity_Types')
