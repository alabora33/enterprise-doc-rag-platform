from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.documents import get_current_user_primary_organization_id
from app.api.v1.users import get_current_user
from app.db.session import get_db
from app.models.chat import ChatMessageRole
from app.models.usage import UsageAction
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatSessionDetail,
    ChatSessionRead,
)
from app.services.chat_history_service import (
    create_chat_message,
    create_chat_session,
    create_chat_sources,
    get_chat_session_by_id,
    list_chat_sessions,
)
from app.services.rag_service import answer_question_with_rag
from app.services.usage_service import create_usage_log


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

    if chat_request.session_id:
        chat_session = get_chat_session_by_id(
            db=db,
            session_id=chat_request.session_id,
            organization_id=organization_id,
            user_id=current_user.id,
        )

        if not chat_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found.",
            )
    else:
        title = chat_request.question[:80]

        chat_session = create_chat_session(
            db=db,
            organization_id=organization_id,
            user_id=current_user.id,
            title=title,
        )

    create_chat_message(
        db=db,
        session_id=chat_session.id,
        role=ChatMessageRole.USER,
        content=chat_request.question,
    )

    rag_result = answer_question_with_rag(
        db=db,
        organization_id=organization_id,
        question=chat_request.question,
        top_k=chat_request.top_k,
    )

    assistant_message = create_chat_message(
        db=db,
        session_id=chat_session.id,
        role=ChatMessageRole.ASSISTANT,
        content=rag_result["answer"],
    )

    create_chat_sources(
        db=db,
        message_id=assistant_message.id,
        sources=rag_result["sources"],
    )

    create_usage_log(
        db=db,
        action=UsageAction.RAG_CHAT,
        organization_id=organization_id,
        user_id=current_user.id,
        resource_type="chat_session",
        resource_id=chat_session.id,
        detail=f"Question: {chat_request.question}",
    )

    db.commit()

    return {
        "session_id": chat_session.id,
        "answer": rag_result["answer"],
        "sources": rag_result["sources"],
    }


@router.get(
    "/sessions",
    response_model=list[ChatSessionRead],
)
def get_my_chat_sessions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    organization_id = get_current_user_primary_organization_id(
        db,
        user_id=current_user.id,
    )

    return list_chat_sessions(
        db=db,
        organization_id=organization_id,
        user_id=current_user.id,
    )


@router.get(
    "/sessions/{session_id}",
    response_model=ChatSessionDetail,
)
def get_chat_session_detail(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    organization_id = get_current_user_primary_organization_id(
        db,
        user_id=current_user.id,
    )

    chat_session = get_chat_session_by_id(
        db=db,
        session_id=session_id,
        organization_id=organization_id,
        user_id=current_user.id,
    )

    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found.",
        )

    return chat_session