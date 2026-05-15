from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate
from app.models.organization import OrganizationRole
from app.services.organization_service import (
    add_user_to_organization,
    create_organization,
)


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(
    db: Session,
    user_id: int,
) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def create_user(
    db: Session,
    user_in: UserCreate,
) -> User:
    hashed_password = get_password_hash(user_in.password)

    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_password,
        is_active=True,
        is_superuser=False,
    )

    db.add(user)
    db.flush()

    organization = create_organization(
        db,
        name=user_in.organization_name,
    )

    add_user_to_organization(
        db,
        user_id=user.id,
        organization_id=organization.id,
        role=OrganizationRole.OWNER,
    )

    db.commit()
    db.refresh(user)

    return user
def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:
    user = get_user_by_email(db, email=email)

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user