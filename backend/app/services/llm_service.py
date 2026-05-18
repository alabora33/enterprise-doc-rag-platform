from google import genai

from app.core.config import settings


def get_gemini_client() -> genai.Client:
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured.")

    return genai.Client(
        api_key=settings.GEMINI_API_KEY,
    )


def generate_answer_with_context(
    question: str,
    context: str,
) -> str:
    client = get_gemini_client()

    prompt = f"""
Sen kurumsal dokümanlar üzerinde çalışan bir RAG asistanısın.

Görevin:
- Sadece verilen kaynak metinlere dayanarak cevap ver.
- Kaynaklarda bilgi yoksa "Bu bilgi verilen dokümanlarda bulunamadı." de.
- Cevabı Türkçe, açık ve profesyonel yaz.
- Uydurma bilgi ekleme.
- Cevabı mümkünse kısa ama yeterli detayda ver.

KULLANICI SORUSU:
{question}

KAYNAK METİNLER:
{context}

CEVAP:
"""

    response = client.models.generate_content(
        model=settings.CHAT_MODEL,
        contents=prompt,
    )

    return response.text or "Cevap üretilemedi."