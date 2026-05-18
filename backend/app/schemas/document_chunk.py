from datetime import datetime

from pydantic import BaseModel


class DocumentChunkRead(BaseModel):
    id: int
    document_id: int
    organization_id: int
    chunk_index: int
    content: str
    page_number: int | None
    sheet_name: str | None
    source_type: str | None
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }