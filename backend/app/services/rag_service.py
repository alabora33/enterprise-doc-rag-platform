from sqlalchemy.orm import Session

from app.services.llm_service import generate_answer_with_context
from app.services.semantic_search_service import semantic_search_chunks


def build_context_from_search_results(
    search_results: list[dict],
) -> str:
    context_parts: list[str] = []

    for index, result in enumerate(search_results, start=1):
        source_label = f"[Kaynak {index}]"

        file_name = result["original_file_name"]
        page_number = result.get("page_number")
        sheet_name = result.get("sheet_name")
        source_type = result.get("source_type")
        content = result["content"]

        metadata_parts = [
            f"Dosya: {file_name}",
            f"Tür: {source_type}",
        ]

        if page_number is not None:
            metadata_parts.append(f"Sayfa: {page_number}")

        if sheet_name is not None:
            metadata_parts.append(f"Sheet: {sheet_name}")

        metadata = " | ".join(metadata_parts)

        context_parts.append(
            f"{source_label}\n{metadata}\nİçerik:\n{content}"
        )

    return "\n\n---\n\n".join(context_parts)


def answer_question_with_rag(
    db: Session,
    organization_id: int,
    question: str,
    top_k: int = 5,
) -> dict:
    search_results = semantic_search_chunks(
        db=db,
        organization_id=organization_id,
        query=question,
        top_k=top_k,
    )

    if not search_results:
        return {
            "answer": "Bu bilgi verilen dokümanlarda bulunamadı.",
            "sources": [],
        }

    context = build_context_from_search_results(
        search_results,
    )

    answer = generate_answer_with_context(
        question=question,
        context=context,
    )

    sources = [
        {
            "document_id": result["document_id"],
            "original_file_name": result["original_file_name"],
            "chunk_id": result["chunk_id"],
            "chunk_index": result["chunk_index"],
            "page_number": result["page_number"],
            "sheet_name": result["sheet_name"],
            "source_type": result["source_type"],
            "similarity_score": result["similarity_score"],
        }
        for result in search_results
    ]

    return {
        "answer": answer,
        "sources": sources,
    }