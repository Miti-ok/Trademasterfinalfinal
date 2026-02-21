import json
from pathlib import Path
from typing import Optional
from openai import OpenAI
from dotenv import load_dotenv
from config import (
    GROQ_API_KEY,
    GROQ_BASE_URL,
    AI_MODEL,
    VISION_MODEL,
    VISION_FALLBACK_MODEL,
    USE_REAL_AI
)

load_dotenv()

class AIService:

    def __init__(self):
        if not USE_REAL_AI:
            self.client = None
            self.model = AI_MODEL
            self.vision_model = VISION_MODEL
            self.vision_fallback_model = VISION_FALLBACK_MODEL
            self.supported_hs_codes = self._load_supported_hs_codes()
            return

        self.client = OpenAI(
            api_key=GROQ_API_KEY,
            base_url=GROQ_BASE_URL
        )
        self.model = AI_MODEL
        self.vision_model = VISION_MODEL
        self.vision_fallback_model = VISION_FALLBACK_MODEL
        self.supported_hs_codes = self._load_supported_hs_codes()

    def _load_supported_hs_codes(self):
        data_path = Path(__file__).resolve().parent.parent / "data" / "tariffs.json"
        try:
            with data_path.open("r", encoding="utf-8") as f:
                data = json.load(f)
            return sorted(data.keys())
        except Exception:
            return []

    async def describe_product_image(self, product_name: str, image_base64: str) -> str:
        """
        Uses a vision-capable model to generate a trade-focused description from an image.
        """
        if self.client is None:
            raise RuntimeError("AI client is not configured.")

        if not image_base64:
            raise ValueError("Image data is required for image description.")

        prompt = (
            "Describe this product for customs classification. "
            "Return one concise paragraph including visible materials, intended use, "
            "construction details, and notable components."
        )

        models_to_try = [
            model for model in [self.vision_model, self.vision_fallback_model]
            if model
        ]

        response = None
        last_error = None
        for model_name in models_to_try:
            try:
                response = self.client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": f"Product name hint: {product_name}\n{prompt}"},
                                {
                                    "type": "image_url",
                                    "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
                                }
                            ]
                        }
                    ],
                    temperature=0
                )
                break
            except Exception as err:
                body = getattr(err, "body", None)
                error_code = None
                if isinstance(body, dict):
                    error_code = (body.get("error") or {}).get("code")
                message = str(err).lower()
                if error_code in {"model_decommissioned", "model_not_found"} or "decommissioned" in message:
                    last_error = err
                    continue
                raise

        if response is None:
            raise RuntimeError(
                f"No working vision model available. Tried: {models_to_try}. Last error: {last_error}"
            )

        description = (response.choices[0].message.content or "").strip()
        if not description:
            raise ValueError("Vision model did not return a usable description.")

        return description

    async def classify_product(
        self,
        product_name: str,
        description: Optional[str] = None,
        image_base64: Optional[str] = None
    ):
        """
        Calls LLM to classify product into HS code,
        extract materials, and provide explanation.
        """
        if self.client is None:
            raise RuntimeError("AI client is not configured.")

        resolved_description = description.strip() if description else ""

        if not resolved_description:
            if not image_base64:
                raise ValueError("Either description or image is required for classification.")
            resolved_description = await self.describe_product_image(product_name, image_base64)

        hs_code_guidance = ", ".join(self.supported_hs_codes) if self.supported_hs_codes else "Any valid HS code"

        prompt = f"""
You are a global trade classification expert.

Classify the product below and return STRICTLY valid JSON.

Product Name: {product_name}
Description: {resolved_description}
Supported HS codes for this system: {hs_code_guidance}

Return format:
{{
    "hs_code": "string",
    "confidence": float,
    "explanation": "short reasoning",
    "materials": [
        {{
            "id": "unique-id",
            "name": "material name",
            "percentage": float,
            "origin_country": "ISO2 country code",
            "stage": "raw_material"
        }}
    ]
}}

Important:
- Return ONLY JSON.
- No markdown.
- No backticks.
- No extra commentary.
- Ensure percentages sum to 100.
- Choose an hs_code from the supported list when possible.
"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0  # deterministic
        )

        content = response.choices[0].message.content.strip()

        # 🔒 Safety: remove accidental markdown wrapping
        if content.startswith("```"):
            content = content.replace("```json", "").replace("```", "").strip()

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            raise ValueError("AI returned invalid JSON format.")

        parsed["resolved_description"] = resolved_description
        return parsed
