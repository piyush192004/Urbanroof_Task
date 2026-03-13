from fastapi import Form, FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai
import os
import json
import base64
import re
from typing import Optional

app = FastAPI(title="DDR Generation API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

DDR_SYSTEM_PROMPT = """
You are a senior building diagnostic engineer at UrbanRoof Private Limited, India.
You specialize in waterproofing, structural repair, and building health assessments.
You will be given an Inspection Report PDF and a Thermal Report PDF for a property.
Your task is to analyze both documents and generate a structured DDR JSON.

STRICT RULES:
1. Only use facts explicitly present in the documents. Never invent data.
2. Cross-reference every impacted area (negative side) with its source (positive side).
3. Use exact thermal readings (hotspot °C, coldspot °C, emissivity, timestamp) from thermal report.
4. Use specific Indian waterproofing product names: Dr. Fixit URP, Dr. Fixit Pidicrete URP, Dr. Fixit Lw+, Dr. Fixit HB, RTM Grout, PMM.
5. Write treatment steps with exact measurements and ratios (e.g. 1:4 CM, 12-15mm thick, 24-48hr cure).
6. Thermal interpretation: cooler zones (blue/green) in walls/ceilings = moisture accumulation. State delta (hotspot - coldspot) and significance.
7. For delayed action consequences, describe realistic escalation: capillary rise, rebar corrosion, plaster delamination, mold, structural weakening.
8. Write in third-person technical language. Be specific, not generic.
9. Return ONLY valid JSON. No markdown, no explanation text outside JSON.

{
  "property_summary": {
    "property_address": "",
    "inspection_date": "",
    "inspected_by": "",
    "report_date": "",
    "structure_type": "",
    "floors": "",
    "year_of_construction": "",
    "age_of_building_years": "",
    "previous_repairs": "",
    "previous_audit_done": "",
    "overall_health_score_percent": "",
    "brief_of_enquiry": ""
  },

  "area_observations": [
    {
      "point_no": "4.4.1",
      "impacted_area_negative_side": {
        "location": "Exact location e.g. Ceiling of Hall, Ground Floor",
        "observation": "Detailed technical description: type of damage (dampness/efflorescence/spalling/seepage), extent, visual signs observed",
        "leakage_type": "Dampness / Seepage / Mild Leakage / Live Leakage",
        "leakage_season": "All time / Monsoon / Not sure",
        "thermal_image_ref": "Timestamp or image ID from thermal report e.g. 03.01.2023 17:11:41",
        "thermal_hotspot_temp_c": "27.3",
        "thermal_coldspot_temp_c": "22.3",
        "thermal_delta_c": "5.0",
        "thermal_interpretation": "The X°C differential with cool zones (blue-green) concentrated at [location] confirms active moisture accumulation in the substrate. Dampness is migrating through the [slab/wall] from the source above/adjacent.",
        "emissivity": "0.94"
      },
      "exposed_area_positive_side": {
        "point_no": "4.5.1",
        "location": "Exact source location e.g. Master Bedroom Bathroom Tile Joints, 1st Floor",
        "observation": "Detailed description of defect: gaps in tile joints, hollowness by hammer test, cracks, plumbing issues",
        "defect_type": "Tile joint gaps / Surface cracks / Hollow surface / Plumbing leak / External wall cracks",
        "water_travel_mechanism": "Water penetrates through [specific defect] at [source location] and travels via [capillary action / gravity / hydrostatic pressure] through the [RCC slab / plaster / masonry] causing [dampness/efflorescence/spalling] at [impacted location]."
      }
    }
  ],

  "probable_root_causes": [
    {
      "cause_id": 1,
      "title": "Short descriptive title e.g. Deteriorated Tile Grout in Bathrooms and Balcony",
      "detailed_explanation": "Full technical explanation. Include: what the defect is, how water travels, which areas are affected, why it happens (age, use, construction quality), and the consequence chain.",
      "affected_negative_zones": ["Hall Ceiling", "Bedroom Skirting Level"],
      "affected_positive_zones": ["MB Bathroom 1st Floor", "Common Bathroom"],
      "classification": "Primary / Contributing / Secondary"
    }
  ],

  "severity_assessment": {
    "overall_severity": "High / Medium / Low",
    "severity_items": [
      {
        "area": "Specific location",
        "severity_level": "Immediate Action Required / Necessary Repairs Needed / Monitor Only",
        "rationale": "Why this severity level was assigned based on observed damage and thermal evidence"
      }
    ]
  },

  "recommended_actions": [
    {
      "action_id": 1,
      "title": "e.g. Bathroom and Balcony Tile Joint Grouting Treatment",
      "applicable_areas": ["All 3 Bathrooms", "Open Balcony"],
      "priority": "Immediate / Short-term (within 3 months) / Long-term (within 6 months)",
      "detailed_treatment_steps": [
        "1. Clean all tile surfaces thoroughly, removing loose grout, organic growth, and dust.",
        "2. Using an electric cutter, open all existing tile joints into a V-shape to expose sub-tile cracks and allow mortar penetration.",
        "3. Fill joints using Polymer Modified Mortar (PMM) made with Dr. Fixit Pidicrete URP mixed at 1:1 ratio with cement, ensuring material reaches cracks developed below tiles.",
        "4. After initial set of the PMM, clean surface with a damp cloth.",
        "5. Fill RTM Grout into tile joints and patch flush with tile surface.",
        "6. Seal all drain outlets (Nahani traps) and corner junctions with PMM made of Dr. Fixit URP.",
        "7. Allow entire system to air-cure for minimum 24-48 hours before any water exposure."
      ],
      "materials_required": ["Dr. Fixit Pidicrete URP", "RTM Grout", "Dr. Fixit URP", "Electric cutter", "Clean cloth"],
      "estimated_cure_time": "24-48 hours"
    },
    {
      "action_id": 2,
      "title": "External Wall Crack Treatment and Waterproof Coating",
      "applicable_areas": ["All External Walls", "Parapet Wall"],
      "priority": "Immediate",
      "detailed_treatment_steps": [
        "1. Clean and chip off all loose plaster, algae, moss, and damaged paint from external surfaces.",
        "2. Open all cracks wider than 0.5mm into V-shape groove using electric cutter.",
        "3. Fill V-grooved cracks with heavy-duty polymer mortar (Dr. Fixit HB) and allow to cure.",
        "4. Moisten the surface and apply bonding coat using Dr. Fixit Pidicrete URP at 1:1 ratio with cement.",
        "5. While bond coat is tacky, apply first coat of sand-faced cement plaster 12-15mm thick in 1:4 CM ratio, with Dr. Fixit Lw+ 200ml per bag of cement added as integral waterproofing compound.",
        "6. Apply second coat 8-10mm thick in 1:4 CM ratio with Dr. Fixit Lw+ in same proportion.",
        "7. Finish in proper line and level. Allow full curing before paint application.",
        "8. Apply premium waterproof acrylic emulsion as final finish coat."
      ],
      "materials_required": ["Dr. Fixit HB", "Dr. Fixit Pidicrete URP", "Dr. Fixit Lw+", "Sand-faced cement plaster", "Premium waterproof acrylic emulsion"],
      "estimated_cure_time": "7 days before paint"
    },
    {
      "action_id": 3,
      "title": "Terrace Waterproofing Treatment",
      "applicable_areas": ["Roof Terrace", "Parapet wall junction"],
      "priority": "Immediate",
      "detailed_treatment_steps": [
        "1. Remove all vegetation growth and debris from terrace surface.",
        "2. Identify and mark all hollow areas using nylon hammer tap test.",
        "3. Break and remove all hollow/delaminated screed portions.",
        "4. Clean surface and remove all loose material.",
        "5. Treat all surface cracks by opening into V-groove and filling with Dr. Fixit HB mortar.",
        "6. Repair watta/fillet at parapet wall-terrace junction and seal all cracks with polymer sealant.",
        "7. Apply new waterproofing system as per scope: either liquid-applied membrane or new brick bat coba with adequate slope (1:80 minimum).",
        "8. Ensure proper slope toward rain water outlets. Check and clear all drain outlets.",
        "9. Allow full curing before traffic."
      ],
      "materials_required": ["Dr. Fixit HB", "Polymer sealant", "Waterproofing membrane or brick bat coba materials"],
      "estimated_cure_time": "72 hours minimum"
    },
    {
      "action_id": 4,
      "title": "Plumbing Repairs",
      "applicable_areas": ["All Bathrooms with concealed plumbing issues"],
      "priority": "Immediate",
      "detailed_treatment_steps": [
        "1. Identify and locate all damaged concealed plumbing using pressure testing if required.",
        "2. Repair or replace all damaged pipe joints and fittings.",
        "3. Repair existing damaged Nahani trap outlets and install new outlets where required.",
        "4. Pressure-test all repaired lines before closing.",
        "5. Seal all pipe penetrations through slabs with non-shrink grout."
      ],
      "materials_required": ["CPVC/UPVC pipes and fittings", "Non-shrink grout", "Nahani trap units"],
      "estimated_cure_time": "As per plumber assessment"
    }
  ],

  "further_possibilities_if_delayed": [
    {
      "area": "Bathrooms and Skirting Areas",
      "timeline": "3-6 months if untreated",
      "consequence": "Continued moisture ingress through tile joint gaps will cause progressive delamination of floor and wall plaster. Sustained dampness will promote mold and fungal growth on interior surfaces posing health risks. Efflorescence will worsen, causing complete paint failure. Capillary rise will extend higher up the walls."
    },
    {
      "area": "External Wall Cracks",
      "timeline": "1 monsoon season if untreated",
      "consequence": "Rainwater infiltration through hairline and structural cracks will saturate the wall substrate, accelerating carbonation of concrete cover and initiating corrosion of embedded reinforcement steel. Corroding rebar expands volumetrically causing further cracking and spalling of concrete cover, significantly reducing structural life of RCC members."
    },
    {
      "area": "Terrace",
      "timeline": "Next monsoon if untreated",
      "consequence": "Water ponding due to slope disturbance will result in hydrostatic pressure buildup on the RCC slab. This will cause active seepage at the ceiling below, damage to electrical fittings, and progressive deterioration of the slab. Vegetation root penetration will widen existing cracks. Hollow screed areas will completely delaminate."
    }
  ],

  "summary_table": [
    {
      "point_no_negative": "4.4.1",
      "impacted_area_negative": "One-line description of damage and location",
      "point_no_positive": "4.5.1",
      "exposed_area_positive": "One-line description of source defect and location"
    }
  ],

  "tools_used": [],

  "additional_notes": "Any important observations not captured above",

  "missing_or_unclear_information": [
    "List any data present in documents that was unclear, missing, or contradictory"
  ],

  "conflicts_detected": [
    "List any contradictions between inspection report and thermal report findings"
  ]
}
"""


def encode_pdf_to_base64(pdf_bytes: bytes) -> str:
    return base64.b64encode(pdf_bytes).decode("utf-8")


@app.get("/health")
async def health_check():
    return {"status": "ok", "gemini_configured": bool(GEMINI_API_KEY)}


@app.post("/generate-ddr")
async def generate_ddr(
    inspection_report: UploadFile = File(..., description="Inspection Report PDF"),
    thermal_report: UploadFile = File(..., description="Thermal Report PDF"),
    api_key: Optional[str] = Form(None),
):
    key = api_key or GEMINI_API_KEY
    if not key:
        raise HTTPException(
            status_code=400,
            detail="Gemini API key required. Pass api_key parameter or set GEMINI_API_KEY env variable.",
        )

    if not inspection_report.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Inspection report must be a PDF file")
    if not thermal_report.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Thermal report must be a PDF file")

    inspection_bytes = await inspection_report.read()
    thermal_bytes = await thermal_report.read()

    inspection_b64 = encode_pdf_to_base64(inspection_bytes)
    thermal_b64 = encode_pdf_to_base64(thermal_bytes)

    try:
        genai.configure(api_key=key)
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash-lite",
            system_instruction=DDR_SYSTEM_PROMPT,
        )

        response = model.generate_content(
            [
                {
                    "role": "user",
                    "parts": [
                        {
                            "inline_data": {
                                "mime_type": "application/pdf",
                                "data": inspection_b64,
                            }
                        },
                        {
                            "inline_data": {
                                "mime_type": "application/pdf",
                                "data": thermal_b64,
                            }
                        },
                        {
                            "text": (
                                "Please analyze both the Inspection Report (first PDF) and "
                                "Thermal Report (second PDF) and generate a comprehensive DDR "
                                "in the exact JSON format specified. Cross-reference thermal "
                                "image data with inspection findings. Return ONLY the JSON, "
                                "no markdown fences, no preamble."
                            )
                        },
                    ],
                }
            ],
            generation_config=genai.GenerationConfig(
                temperature=0.1,
                max_output_tokens=8192,
            ),
        )

        raw_text = response.text.strip()
        # Strip markdown code fences if present
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)

        ddr_data = json.loads(raw_text)
        return JSONResponse(content={"success": True, "ddr": ddr_data})

    except json.JSONDecodeError as e:
        return JSONResponse(
            content={
                "success": False,
                "error": "Failed to parse AI response as JSON",
                "raw_response": raw_text[:2000],
                "detail": str(e),
            },
            status_code=500,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)