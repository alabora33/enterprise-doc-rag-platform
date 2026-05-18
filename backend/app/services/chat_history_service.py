from sqlalchemy.orm import Session

from app.models.chat import (
    ChatMessage,
    ChatMessageRole,
    ChatSession,
    ChatSource,
)


def create_chat_session(
    db: Session,
    organization_id: int,
    user_id: int,
    title: str | None = None,
) -> ChatSession:
    session = ChatSession(
        organization_id=organization_id,
        user_id=user_id,
        title=title,
    )

    db.add(session)
    db.flush()

    return session


def get_chat_session_by_id(
    db: Session,
    session_id: int,
    organization_id: int,
    user_id: int,
) -> ChatSession | None:
    return (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id,
            ChatSession.organization_id == organization_id,
            ChatSession.user_id == user_id,
        )
        .first()
    )


def list_chat_sessions(
    db: Session,
    organization_id: int,
    user_id: int,
) -> list[ChatSession]:
    return (
        db.query(ChatSession)
        .filter(
            ChatSession.organization_id == organization_id,
            ChatSession.user_id == user_id,
        )
        .order_by(ChatSession.updated_at.desc())
        .all()
    )


def create_chat_message(
    db: Session,
    session_id: int,
    role: ChatMessageRole,
    content: str,
) -> ChatMessage:
    message = ChatMessage(
        session_id=session_id,
        role=role.value,
        content=content,
    )

    db.add(message)
    db.flush()

    return message


def create_chat_sources(
    db: Session,
    message_id: int,
    sources: list[dict],
) -> list[ChatSource]:
    created_sources: list[ChatSource] = []

    for source in sources:
        chat_source = ChatSource(
            message_id=message_id,
            document_id=source["document_id"],
            chunk_id=source["chunk_id"],
            original_file_name=source["original_file_name"],
            chunk_index=source["chunk_index"],
            page_number=source["page_number"],
            sheet_name=source["sheet_name"],
            source_type=source["source_type"],
            similarity_score=source["similarity_score"],
        )

        db.add(chat_source)
        created_sources.append(chat_source)

    db.flush()

    return created_sources