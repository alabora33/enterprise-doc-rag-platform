from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.documents import get_current_user_primary_organization_id
from app.api.v1.users import get_current_user
from app.db.session import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag_service import answer_question_with_rag


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post(
    "",
    response_model=ChatResponse,
)
def chat_with_documents(
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    organization_id = get_current_user_primary_organization_id(
        db,
        user_id=current_user.id,
    )

    result = answer_question_with_rag(
        db=db,
        organization_id=organization_id,
        question=chat_request.question,
        top_k=chat_request.top_k,
    )

    return result