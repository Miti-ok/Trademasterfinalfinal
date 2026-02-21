from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.analyze import router as analyze_router
from routes.recalculate import router as recalc_router
from routes.report import router as report_router
from core import state
import json


# -------------------------------------------------
# CREATE FASTAPI APP FIRST
# -------------------------------------------------

app = FastAPI(
    title="AI Global Trade Intelligence Backend",
    version="1.0.0"
)


# -------------------------------------------------
# CORS (Optional but safe)
# -------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------
# REGISTER ROUTERS (AFTER app is defined)
# -------------------------------------------------

app.include_router(analyze_router)
app.include_router(recalc_router)
app.include_router(report_router)


# -------------------------------------------------
# LOAD STATIC DATA
# -------------------------------------------------

def load_json_file(filename):
    with open(f"data/{filename}", "r") as f:
        return json.load(f)


@app.on_event("startup")
async def startup_event():
    state.TARIFFS.update(load_json_file("tariffs.json"))
    state.TRADE_AGREEMENTS.update(load_json_file("trade_agreements.json"))
    state.COUNTRY_RISK.update(load_json_file("country_risk.json"))

    print("✅ Static data loaded successfully")
    print(f"📦 Tariffs: {len(state.TARIFFS)} entries")
    print(f"🌍 Country Risks: {len(state.COUNTRY_RISK)} entries")


# -------------------------------------------------
# HEALTH CHECK
# -------------------------------------------------

@app.get("/")
def root():
    return {
        "success": True,
        "data": {
            "message": "AI Global Trade Intelligence Backend Running",
            "version": "1.0.0"
        },
        "error": None
    }
