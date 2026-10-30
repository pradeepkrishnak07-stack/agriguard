import logging
from typing import Any, Dict, List

import httpx
from google import genai
from google.genai import errors, types

from ..core.config import settings
from ..schemas.farm_schemas import AssistantConversationTurn

logger = logging.getLogger("agriguard.gemini_assistant")

SYSTEM_INSTRUCTION = """You are AGRIGUARD, an agricultural information assistant for farmers.
Answer questions about crops, soil, fertilizers, irrigation, plant diseases, and farming practices.
Reply in the user's requested language: English, Tamil, or Hindi.
Ask a concise follow-up question when essential details (such as crop, growth stage, soil test,
irrigation source, or land area) are missing. Never invent soil-test results, weather readings,
field observations, disease diagnoses, pesticide names, or pesticide rates. Give general
information as general information, distinguish it from verified local recommendations, and
recommend a soil test or qualified agricultural expert when needed. Do not prescribe pesticide
products or dosages; direct farmers to local agricultural extension guidance and the product
label. You are not the image disease-detection model and cannot confirm a diagnosis from a chat.
Treat prior conversation and crop context as user-provided, not as verified measurements.
Do not claim to have checked live weather or farm records unless those facts are provided."""

LANGUAGE_NAMES = {"en": "English", "ta": "Tamil", "hi": "Hindi"}
REQUEST_TIMEOUT_MS = 25_000


class GeminiAssistantError(Exception):
    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


def _contents(
    query: str,
    crop_hint: str | None,
    language: str,
    history: List[AssistantConversationTurn],
) -> List[types.Content]:
    contents: List[types.Content] = []
    for turn in history:
        role = "model" if turn.role == "assistant" else "user"
        if role == "model" and not contents:
            continue
        if contents and contents[-1].role == role:
            previous_text = contents[-1].parts[0].text or ""
            contents[-1].parts[0].text = f"{previous_text}\n{turn.content}"
        else:
            contents.append(
                types.Content(role=role, parts=[types.Part(text=turn.content)])
            )

    current_prompt = f"Answer this question in {LANGUAGE_NAMES[language]}: {query}"
    if crop_hint:
        current_prompt = (
            f"Farmer-provided crop context (unverified): {crop_hint}\n\n{current_prompt}"
        )
    if contents and contents[-1].role == "user":
        previous_text = contents[-1].parts[0].text or ""
        contents[-1].parts[0].text = f"{previous_text}\n\n{current_prompt}"
    else:
        contents.append(
            types.Content(role="user", parts=[types.Part(text=current_prompt)])
        )
    return contents


def ask_agriculture_question(
    query: str,
    crop_hint: str | None,
    language: str,
    history: List[AssistantConversationTurn],
) -> Dict[str, Any]:
    api_key = settings.GEMINI_API_KEY.strip()
    if not api_key:
        raise GeminiAssistantError(
            503,
            "The agriculture assistant is not configured. Set GEMINI_API_KEY in the backend environment.",
        )

    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(timeout=REQUEST_TIMEOUT_MS),
    )
    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=_contents(query, crop_hint, language, history),
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.2,
                max_output_tokens=768,
            ),
        )
    except errors.APIError as exc:
        code = getattr(exc, "code", 0)
        logger.warning("Gemini request failed with provider status %s", code)
        if code == 429:
            raise GeminiAssistantError(
                429,
                "The agriculture assistant is rate-limited right now. Please wait a moment and try again.",
            ) from exc
        if code in (401, 403):
            raise GeminiAssistantError(
                503,
                "The agriculture assistant could not authenticate with Gemini. Check the backend API key and Google AI access.",
            ) from exc
        if code == 404:
            raise GeminiAssistantError(
                503,
                f"The configured Gemini model '{settings.GEMINI_MODEL}' is unavailable to this API key. Set GEMINI_MODEL to a model available in Google AI Studio, such as gemini-3.5-flash-lite, then restart the backend.",
            ) from exc
        if code >= 500:
            raise GeminiAssistantError(
                503,
                "Google Gemini is temporarily unavailable. Please try again later.",
            ) from exc
        raise GeminiAssistantError(
            502,
            "Gemini could not process this agriculture question. Please rephrase it and try again.",
        ) from exc
    except httpx.TimeoutException as exc:
        raise GeminiAssistantError(
            504,
            "The agriculture assistant took too long to respond. Please try again.",
        ) from exc
    except httpx.RequestError as exc:
        raise GeminiAssistantError(
            503,
            "The agriculture assistant cannot reach Google Gemini right now. Check the backend internet connection.",
        ) from exc
    finally:
        client.close()

    answer = (response.text or "").strip()
    if not answer:
        raise GeminiAssistantError(
            502,
            "Gemini returned an empty answer. Please rephrase your question and try again.",
        )

    return {
        "success": True,
        "topic_en": "Agricultural Guidance",
        "topic_ta": "விவசாய வழிகாட்டுதல்",
        "topic_hi": "कृषि मार्गदर्शन",
        "reply_en": answer if language == "en" else "",
        "reply_ta": answer if language == "ta" else "",
        "reply_hi": answer if language == "hi" else "",
        "spoken_text": answer,
        "reference": "AI-generated general information; verify local recommendations with TNAU, ICAR, or a qualified agricultural expert.",
        "model": settings.GEMINI_MODEL,
    }
