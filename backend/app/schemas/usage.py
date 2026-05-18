from datetime import datetime

from pydantic import BaseModel


class UsageLogRead(BaseModel):
    id: int
    organization_id: int | None
    user_id: int | None
    action: str
    resource_type: str | None
    resource_id: int | None
    detail: str | None
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class UsageSummary(BaseModel):
    total_documents: int
    total_chunks: int
    total_chat_sessions: int
    total_chat_messages: int
    total_usage_logs: int
    document_upload_count: int
    semantic_search_count: int
    rag_chat_count: int
    document_retry_count: int