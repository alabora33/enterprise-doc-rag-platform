from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.documents import get_current_user_primary_organization_id
from app.api.v1.users import get_current_user
from app.db.session import get_db
from app.schemas.search import SearchRequest, SearchResult
from app.services.semantic_search_service import semantic_search_chunks


router = APIRouter(
    prefix="/search",
    tags=["Search"],
)


@router.post(
    "",
    response_model=list[SearchResult],
)
def search_documents(
    search_request: SearchRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    organization_id = get_current_user_primary_organization_id(
        db,
        user_id=current_user.id,
    )

    return semantic_search_chunks(
        db=db,
        organization_id=organization_id,
        query=search_request.query,
        top_k=search_request.top_k,
    )