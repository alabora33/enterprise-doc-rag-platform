from sqlalchemy.orm import Session

from app.models.chat import ChatMessage, ChatSession
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.usage import UsageAction, UsageLog


def create_usage_log(
    db: Session,
    action: UsageAction,
    organization_id: int | None = None,
    user_id: int | None = None,
    resource_type: str | None = None,
    resource_id: int | None = None,
    detail: str | None = None,
) -> UsageLog:
    usage_log = UsageLog(
        organization_id=organization_id,
        user_id=user_id,
        action=action.value,
        resource_type=resource_type,
        resource_id=resource_id,
        detail=detail,
    )

    db.add(usage_log)
    db.flush()

    return usage_log


def get_usage_logs(
    db: Session,
    limit: int = 100,
) -> list[UsageLog]:
    return (
        db.query(UsageLog)
        .order_by(UsageLog.created_at.desc())
        .limit(limit)
        .all()
    )


def get_usage_summary(
    db: Session,
) -> dict:
    total_documents = db.query(Document).count()
    total_chunks = db.query(DocumentChunk).count()
    total_chat_sessions = db.query(ChatSession).count()
    total_chat_messages = db.query(ChatMessage).count()
    total_usage_logs = db.query(UsageLog).count()

    document_upload_count = (
        db.query(UsageLog)
        .filter(UsageLog.action == UsageAction.DOCUMENT_UPLOAD.value)
        .count()
    )

    semantic_search_count = (
        db.query(UsageLog)
        .filter(UsageLog.action == UsageAction.SEMANTIC_SEARCH.value)
        .count()
    )

    rag_chat_count = (
        db.query(UsageLog)
        .filter(UsageLog.action == UsageAction.RAG_CHAT.value)
        .count()
    )

    document_retry_count = (
        db.query(UsageLog)
        .filter(UsageLog.action == UsageAction.DOCUMENT_RETRY.value)
        .count()
    )

    return {
        "total_documents": total_documents,
        "total_chunks": total_chunks,
        "total_chat_sessions": total_chat_sessions,
        "total_chat_messages": total_chat_messages,
        "total_usage_logs": total_usage_logs,
        "document_upload_count": document_upload_count,
        "semantic_search_count": semantic_search_count,
        "rag_chat_count": rag_chat_count,
        "document_retry_count": document_retry_count,
    }