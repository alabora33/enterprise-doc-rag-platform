from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.users import get_current_superuser
from app.db.session import get_db
from app.schemas.usage import UsageLogRead, UsageSummary
from app.services.usage_service import get_usage_logs, get_usage_summary


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get(
    "/usage/summary",
    response_model=UsageSummary,
)
def read_usage_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_superuser),
):
    return get_usage_summary(
        db=db,
    )


@router.get(
    "/usage/logs",
    response_model=list[UsageLogRead],
)
def read_usage_logs(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_superuser),
):
    return get_usage_logs(
        db=db,
        limit=limit,
    )