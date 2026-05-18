from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=1000)
    top_k: int = Field(default=5, ge=1, le=20)


class SearchResult(BaseModel):
    document_id: int
    original_file_name: str
    chunk_id: int
    chunk_index: int
    content: str
    page_number: int | None
    sheet_name: str | None
    source_type: str | None
    similarity_score: float