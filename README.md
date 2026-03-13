# DDR Generator — AI-Powered Property Diagnostic Report

An end-to-end system that reads an **Inspection Report** + **Thermal Report** (PDFs) and generates a structured **Detailed Diagnostic Report (DDR)** using Gemini AI.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                 │
│  - Upload Page: drag-drop two PDFs + API config         │
│  - Report Page: collapsible DDR viewer with print/PDF   │
└────────────────────────┬────────────────────────────────┘
                         │  POST /generate-ddr (multipart)
┌────────────────────────▼────────────────────────────────┐
│                  FastAPI Backend                         │
│  - Validates PDFs                                       │
│  - Converts to base64                                   │
│  - Sends both PDFs + system prompt to Gemini 1.5 Flash  │
│  - Parses JSON response                                 │
│  - Returns structured DDR                               │
└────────────────────────┬────────────────────────────────┘
                         │  Multimodal PDF analysis
┌────────────────────────▼────────────────────────────────┐
│                  Gemini 1.5 Flash API                   │
│  - Reads both PDFs natively (multimodal)               │
│  - Cross-references thermal images with inspection data │
│  - Returns structured JSON DDR                          │
└─────────────────────────────────────────────────────────┘
```

---

## Generated DDR Sections

| Section | Description |
|---------|-------------|
| **1. Property Issue Summary** | Overview, property metadata, score |
| **2. Area-wise Observations** | Room-by-room: negative side, positive side, thermal data, photo refs |
| **3. Probable Root Causes** | Evidence-backed causal analysis |
| **4. Severity Assessment** | Critical / High / Moderate / Low with reasoning table |
| **5. Recommended Actions** | Prioritized: Immediate → Short-term → Long-term |
| **6. Additional Notes** | Any extra observations |
| **7. Missing / Unclear Information** | Flags gaps, conflicts between reports |

---

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API key from [Google AI Studio](https://aistudio.google.com)

---

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment variable
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start server
python main.py
# API runs at http://localhost:8000
# Docs at http://localhost:8000/docs
```

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# App runs at http://localhost:3000
```

---

## Usage

1. Open `http://localhost:3000`
2. Drag & drop the **Inspection Report PDF** (left zone)
3. Drag & drop the **Thermal Report PDF** (right zone)
4. Enter your **Gemini API key** (or set it as env variable on the backend)
5. Click **Generate DDR**
6. View the full report — use **Print / PDF** to export

---

## API Reference

### `POST /generate-ddr`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `inspection_report` | File (PDF) | ✅ | Inspection Report PDF |
| `thermal_report` | File (PDF) | ✅ | Thermal Report PDF |
| `api_key` | string | Optional | Gemini API key (overrides env var) |

**Response:**
```json
{
  "success": true,
  "ddr": {
    "property_summary": { ... },
    "area_observations": [ ... ],
    "probable_root_causes": [ ... ],
    "severity_assessment": { ... },
    "recommended_actions": [ ... ],
    "additional_notes": [ ... ],
    "missing_or_unclear_information": [ ... ],
    "conflicts_detected": [ ... ]
  }
}
```

### `GET /health`

Returns `{ "status": "ok", "gemini_configured": true/false }`

---

## DDR AI Rules (System Prompt)

The Gemini system prompt enforces:
- ❌ No invented facts — only documented data is reported
- ⚠️ Conflicts between thermal and inspection are **flagged explicitly**
- 🌡️ Thermal image IDs (e.g., `RB02380X`) are correlated with inspection areas
- 📸 Inspection photo references (e.g., `Photo 1`) placed in relevant sections
- 🔤 Client-friendly language — minimal jargon
- 📋 "Not Available" for missing data — no speculation

---

## Project Structure

```
ddr-system/
├── backend/
│   ├── main.py              # FastAPI app + Gemini integration
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   ├── pages/
    │   │   ├── UploadPage.jsx   # File upload UI
    │   │   ├── UploadPage.css
    │   │   ├── ReportPage.jsx   # DDR viewer
    │   │   └── ReportPage.css
    │   └── components/
    │       ├── SeverityBadge.jsx
    │       └── ThermalCard.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Key Design Decisions

**Why Gemini 1.5 Flash?**  
Natively reads PDF files (including embedded images in thermal reports) without needing a separate PDF parser. The multimodal capability means thermal images and their temperature readings are understood visually.

**Why FastAPI?**  
Async-native, fast, built-in OpenAPI docs (`/docs`), easy multipart file handling.

**Why structured JSON output?**  
The system prompt instructs Gemini to return a strict JSON schema. The frontend maps this schema directly to React components — no fragile text parsing.

**Conflict detection:**  
Gemini is explicitly instructed to compare thermal readings against visual observations and flag discrepancies in a dedicated `conflicts_detected` array.
