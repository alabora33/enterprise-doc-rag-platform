from datetime import datetime

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=20)
    session_id: int | None = None


class ChatSource(BaseModel):
    document_id: int
    original_file_name: str
    chunk_id: int
    chunk_index: int
    page_number: int | None
    sheet_name: str | None
    source_type: str | None
    similarity_score: float


class ChatResponse(BaseModel):
    session_id: int
    answer: str
    sources: list[ChatSource]


class ChatMessageRead(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class ChatSessionRead(BaseModel):
    id: int
    organization_id: int
    user_id: int | None
    title: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class ChatSessionDetail(ChatSessionRead):
    messages: list[ChatMessageRead]