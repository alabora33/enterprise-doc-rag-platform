from google import genai
from google.genai import types

from app.core.config import settings


def get_gemini_client() -> genai.Client:
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured.")

    return genai.Client(
        api_key=settings.GEMINI_API_KEY,
    )


def create_embedding(
    text: str,
) -> list[float]:
    client = get_gemini_client()

    result = client.models.embed_content(
        model=settings.EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(
            output_dimensionality=settings.EMBEDDING_DIMENSION,
        ),
    )

    return result.embeddings[0].values


def create_embeddings(
    texts: list[str],
) -> list[list[float]]:
    if not texts:
        return []

    client = get_gemini_client()

    result = client.models.embed_content(
        model=settings.EMBEDDING_MODEL,
        contents=texts,
        config=types.EmbedContentConfig(
            output_dimensionality=settings.EMBEDDING_DIMENSION,
        ),
    )

    return [
        embedding.values
        for embedding in result.embeddings
    ]