from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=20)


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
    answer: str
    sources: list[ChatSource]