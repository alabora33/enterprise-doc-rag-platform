from datetime import datetime

from pydantic import BaseModel


class DocumentRead(BaseModel):
    id: int
    organization_id: int
    uploaded_by_user_id: int | None
    original_file_name: str
    stored_file_name: str
    file_path: str
    content_type: str | None
    file_size: int | None
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }