from fastapi import APIRouter
import uuid

from models.product import ProductRequest
from services.ai_service import AIService
from services.tariff_engine import TariffEngine
from services.risk_engine import RiskEngine
from services.map_flow_service import MapFlowService
from core import state


router = APIRouter(prefix="/analyze", tags=["Analyze"])

ai_service = AIService()
tariff_engine = TariffEngine()
risk_engine = RiskEngine()
map_service = MapFlowService()


@router.post("/")
async def analyze_product(request: ProductRequest):

    try:
        # -------------------------------------------------
        # 1️⃣ AI Classification
        # -------------------------------------------------
        ai_result = await ai_service.classify_product(
            product_name=request.product_name,
            description=request.description,
            image_base64=request.image_base64
        )

        # -------------------------------------------------
        # 2️⃣ Tariff Calculation
        # -------------------------------------------------
        tariff_result = tariff_engine.calculate_tariff(
            hs_code=ai_result["hs_code"],
            manufacturing_country=request.manufacturing_country,
            destination_country=request.destination_country,
            declared_value=request.declared_value
        )

        # -------------------------------------------------
        # 3️⃣ Risk Calculation
        # -------------------------------------------------
        risk_score = risk_engine.calculate_risk(
            manufacturing_country=request.manufacturing_country,
            destination_country=request.destination_country,
            total_duty_percent=tariff_result.total_duty_percent,
            materials=ai_result["materials"]
        )

        # -------------------------------------------------
        # 4️⃣ Generate Map Flow (Globe JSON)
        # -------------------------------------------------
        map_flow = map_service.generate_map_flow(
            hs_code=ai_result["hs_code"],
            manufacturing_country=request.manufacturing_country,
            destination_country=request.destination_country,
            materials=ai_result["materials"]
        )

        map_service.save_globe_file(map_flow)

        # -------------------------------------------------
        # 5️⃣ Store Analysis in Memory
        # -------------------------------------------------
        analysis_id = str(uuid.uuid4())

        state.ANALYSIS_STORE[analysis_id] = {
            "hs_code": ai_result["hs_code"],
            "materials": ai_result["materials"],
            "manufacturing_country": request.manufacturing_country,
            "destination_country": request.destination_country,
            "declared_value": request.declared_value
        }

        # -------------------------------------------------
        # 6️⃣ Return Response
        # -------------------------------------------------
        return {
            "success": True,
            "data": {
                "analysis_id": analysis_id,
                "hs_code": ai_result["hs_code"],
                "confidence": ai_result["confidence"],
                "explanation": ai_result["explanation"],
                "resolved_description": ai_result.get("resolved_description"),
                "manufacturing_country": request.manufacturing_country,
                "destination_country": request.destination_country,
                "declared_value": request.declared_value,
                "materials": ai_result["materials"],
                "tariff_summary": tariff_result.dict(),
                "risk_score": risk_score,
                "map_flow": map_flow
            },
            "error": None
        }

    except Exception as e:
        return {
            "success": False,
            "data": None,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(e)
            }
        }
