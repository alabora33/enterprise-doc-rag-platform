from sqlalchemy.orm import Session

from app.models.organization import (
    Organization,
    OrganizationRole,
    UserOrganizationRole,
)


def create_organization(
    db: Session,
    name: str,
) -> Organization:
    organization = Organization(
        name=name,
    )

    db.add(organization)
    db.flush()

    return organization


def add_user_to_organization(
    db: Session,
    user_id: int,
    organization_id: int,
    role: OrganizationRole = OrganizationRole.MEMBER,
) -> UserOrganizationRole:
    user_role = UserOrganizationRole(
        user_id=user_id,
        organization_id=organization_id,
        role=role.value,
    )

    db.add(user_role)
    db.flush()

    return user_role


def get_user_organizations(
    db: Session,
    user_id: int,
) -> list[UserOrganizationRole]:
    return (
        db.query(UserOrganizationRole)
        .filter(UserOrganizationRole.user_id == user_id)
        .all()
    )