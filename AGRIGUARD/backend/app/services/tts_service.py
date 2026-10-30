import os
import io
import hashlib
from typing import Optional
from ..core.config import settings

class TTSService:
    """
    High-fidelity Text-To-Speech engine supporting natural Tamil ('ta'), Hindi ('hi'), and English ('en').
    Caches generated speech audio locally to provide instant response and offline replay.
    """
    def __init__(self):
        self.cache_dir = os.path.join(settings.DATA_DIR, "tts_cache")
        os.makedirs(self.cache_dir, exist_ok=True)

    def _get_cache_path(self, text: str, lang: str) -> str:
        key = f"{lang}:{text.strip()}"
        file_hash = hashlib.md5(key.encode("utf-8")).hexdigest()
        return os.path.join(self.cache_dir, f"{lang}_{file_hash}.mp3")

    def synthesize(self, text: str, lang: str = "ta") -> io.BytesIO:
        """
        Synthesizes text into MP3 audio stream using gTTS with caching.
        """
        clean_text = text.strip()
        if not clean_text:
            raise ValueError("Text cannot be empty for speech synthesis")

        # Map language codes
        lang_code = "ta" if lang == "ta" else ("hi" if lang == "hi" else "en")
        cache_file = self._get_cache_path(clean_text, lang_code)

        # Check local cache
        if os.path.exists(cache_file) and os.path.getsize(cache_file) > 0:
            with open(cache_file, "rb") as f:
                return io.BytesIO(f.read())

        # Synthesize via gTTS
        try:
            from gtts import gTTS
            # For Tamil, tld='co.in' or 'com' provides natural Indian accent
            tts = gTTS(text=clean_text, lang=lang_code, tld="co.in" if lang_code in ["ta", "hi"] else "com")
            buffer = io.BytesIO()
            tts.write_to_fp(buffer)
            audio_bytes = buffer.getvalue()

            # Cache to disk for future rapid playback
            try:
                with open(cache_file, "wb") as f:
                    f.write(audio_bytes)
            except Exception as cache_err:
                print(f"[TTS] Warning: Failed to write to cache: {cache_err}")

            return io.BytesIO(audio_bytes)
        except Exception as e:
            print(f"[TTS] Error during synthesis: {e}")
            raise RuntimeError(f"Text-to-speech synthesis failed: {str(e)}")

tts_service = TTSService()
