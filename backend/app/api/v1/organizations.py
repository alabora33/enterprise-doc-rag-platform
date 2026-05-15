from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.users import get_current_user
from app.db.session import get_db
from app.schemas.organization import UserOrganizationRead
from app.services.organization_service import get_user_organizations


router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
)


@router.get(
    "/me",
    response_model=list[UserOrganizationRead],
)
def read_my_organizations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_user_organizations(
        db,
        user_id=current_user.id,
    )