from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.services.embedding_service import create_embedding


def semantic_search_chunks(
    db: Session,
    organization_id: int,
    query: str,
    top_k: int = 5,
):
    query_embedding = create_embedding(
        query,
    )

    distance = DocumentChunk.embedding.cosine_distance(
        query_embedding,
    )

    results = (
        db.query(
            DocumentChunk,
            Document.original_file_name,
            distance.label("distance"),
        )
        .join(
            Document,
            Document.id == DocumentChunk.document_id,
        )
        .filter(
            DocumentChunk.organization_id == organization_id,
            DocumentChunk.embedding.isnot(None),
        )
        .order_by(distance)
        .limit(top_k)
        .all()
    )

    formatted_results = []

    for chunk, original_file_name, distance_value in results:
        similarity_score = 1 - float(distance_value)

        formatted_results.append(
            {
                "document_id": chunk.document_id,
                "original_file_name": original_file_name,
                "chunk_id": chunk.id,
                "chunk_index": chunk.chunk_index,
                "content": chunk.content,
                "page_number": chunk.page_number,
                "sheet_name": chunk.sheet_name,
                "source_type": chunk.source_type,
                "similarity_score": similarity_score,
            }
        )

    return formatted_results