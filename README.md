# AI Editorial Workspace – This Week in AI

> **Research smarter. Write better. Publish with confidence.**  
> An AI-powered editorial platform that transforms multiple information sources into evidence-backed research and polished newsletter content.

![Version](https://img.shields.io/badge/version-2.0.0-indigo)
![Node](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-v19-blue)
![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-emerald)
![AI](https://img.shields.io/badge/AI%20Provider-Google%20Gemini-violet)

---

## 📖 Table of Contents
- [1. Overview & Core Modules](#1-overview--core-modules)
- [2. System Architecture](#2-system-architecture)
- [3. Tech Stack](#3-tech-stack)
- [4. Quickstart & Installation](#4-quickstart--installation)
- [5. Environment Variables](#5-environment-variables)
- [6. Application Workflows](#6-application-workflows)
- [7. API Reference](#7-api-reference)
- [8. Documentation Deliverables](#8-documentation-deliverables)
- [9. Testing & Verification](#9-testing--verification)

---

## 1. Overview & Core Modules

The **AI Editorial Workspace** connects the end-to-end editorial pipeline for newsletter writers and editors across three tightly integrated modules:

| Module | Core Purpose | Key Capabilities |
| :--- | :--- | :--- |
| **Module A: Research Assistant** | Turn multiple sources into an evidence-backed brief | Ingests 3+ URLs or manual text, runs SSRF-safe content extraction with Mozilla Readability, separates verified facts from analysis and speculation, and generates strategic newsletter angles. |
| **Module B: Writing Assistant** | Analyze and polish editorial drafts | Hemingway-inspired writing editor with 5 quality checks (long sentences, passive voice, jargon, filler words, repetition), deterministic readability metrics, and sovereign Accept/Reject controls. |
| **Module C: Newsletter Workspace** | Generate and export 300–500 word articles | Converts research angles into structured newsletters tailored for founders and operators, enforces length targets, exports to Markdown, and seamlessly bridges to the Writing Assistant. |

---

## 2. System Architecture

```
                   USER / BROWSER
                         │
                         ▼
             REACT FRONTEND (Vite + Tailwind)
                         │  Axios HTTP / JSON
                         ▼
             EXPRESS REST API (Node.js)
            (Helmet, CORS, Rate Limiting)
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
     Research         Writing        Newsletter
    Controller      Controller       Controller
         │               │               │
         └───────────────┼───────────────┘
                         ▼
                   SERVICES LAYER
                   /            \
                  ▼              ▼
          ARTICLE SERVICE    AI SERVICE
          (Readability &     (Google Gemini
          Cheerio + SSRF)      API Engine)
                  │              │
                  └──────┬───────┘
                         ▼
                   MONGOOSE ODM
                         │
                         ▼
                   MONGODB ATLAS
```

---

## 3. Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 4, Lucide React, Axios, React Router 7
- **Backend:** Node.js, Express.js 4, Mongoose 8, Helmet, Express-Rate-Limit
- **Database:** MongoDB Atlas (Persistent collections: `researchSessions`, `sources`, `writingDrafts`, `newsletters`)
- **AI Provider:** Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`)
- **Extraction Engine:** Mozilla Readability, JSDOM, Cheerio

---

## 4. Quickstart & Installation

### Prerequisites
- **Node.js:** v18 or higher (`node -v`)
- **npm:** v9 or higher (`npm -v`)
- **MongoDB:** MongoDB Atlas connection string (or local MongoDB running on `mongodb://127.0.0.1:27017`)
- **Google Gemini API Key:** [Get an API Key](https://aistudio.google.com/app/apikey)

---

### Step 1: Clone Repository & Configure Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
```

Open `backend/.env` and insert your credentials:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai_editorial_workspace
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend server:
```bash
npm run dev
# Or for standard execution:
npm start
```
The backend starts at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).

---

### Step 2: Configure & Start Frontend
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser and navigate to **`http://localhost:5173`**.

---

## 5. Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port the Express server listens on | `5000` |
| `NODE_ENV` | Runtime environment | `development` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |
| `MONGO_URI` | MongoDB Atlas cluster connection string | `mongodb+srv://.../ai_editorial_workspace` |
| `GEMINI_API_KEY`| Google Gemini API key | `AIzaSy...` |

### Frontend (`frontend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base endpoint for the backend REST API | `http://localhost:5000/api` |

---

## 6. Application Workflows

### 6.1 Research Assistant (Module A)
1. Navigate to **Research Assistant**.
2. Enter a research topic (e.g., *"Small Reasoning Models in 2026"*).
3. Submit at least **three source URLs** or toggle to **Paste Content** for paywalled/internal memos.
4. Click **Generate Research Brief**.
5. The backend validates URLs, extracts clean article text with Readability/Cheerio, and prompts Gemini for a multi-source collective synthesis.
6. The brief renders 8 distinct sections:
   - Overview & Executive Summary
   - What Happened? (Announcements, organizations, technical shifts)
   - Why Does It Matter? (Industry impact & commercial implications)
   - Who Should Care? (Takeaways for Founders, Engineers, Operators)
   - Supporting Evidence (Verifiable claims linked to source excerpts)
   - Facts vs. Analysis vs. Speculation
   - Newsletter Opportunities (Angles with target audience and hooks)
   - Source References

### 6.2 Writing Assistant (Module B)
1. Navigate to **Writing Assistant** (or push content directly from a newsletter draft).
2. Write or paste editorial content in the editor.
3. Click **Analyze Draft**.
4. The engine executes 5 editorial checks:
   - **Long / Complex Sentences** (>25 words or dense clauses)
   - **Passive Voice** constructions
   - **Unexplained Technical Jargon**
   - **Filler Words & Padding**
   - **Repetition & Redundant Phrasing**
5. Review suggestions in the right-hand panel. Click **Accept** to apply an individual rewrite to the revised draft, or **Reject** to dismiss.
6. Switch to the **Compare Versions** tab for side-by-side verification and copy the polished draft.

### 6.3 Newsletter Workspace (Module C)
1. Select a completed research session and choose an editorial angle.
2. Click **Generate Newsletter Draft**.
3. Gemini writes a 300–500 word article adhering to the editorial rubric.
4. Edit the headline or body directly. Check the real-time word counter.
5. Click **Open in Writing Assistant** to review readability and polish tone.
6. Save the final draft in MongoDB, copy to clipboard, or export as `.md`.

---

## 7. API Reference

Base URL: `/api`

### Research Endpoints
- `POST /research` - Create a new research session (`{ "title": "Topic" }`)
- `GET /research` - Retrieve all saved research sessions
- `GET /research/:id` - Retrieve a specific research session with populated sources
- `DELETE /research/:id` - Delete a research session and its sources
- `POST /research/:id/sources` - Add sources (`{ "sources": [...] }`)
- `POST /research/:id/analyze` - Trigger extraction and synthesize research brief
- `POST /research/extract` - Standalone SSRF-safe article extraction

### Writing Endpoints
- `POST /writing/analyze` - Analyze draft and compute readability metrics
- `GET /writing` - Retrieve all saved drafts
- `GET /writing/:id` - Retrieve a specific draft
- `PUT /writing/:id` - Update revised text or title
- `PATCH /writing/:id/suggestions/:suggestionId` - Accept or reject an individual suggestion (`{ "status": "accepted" }`)
- `GET /writing/:id/compare` - Retrieve original vs. revised comparison
- `DELETE /writing/:id` - Delete a draft

### Newsletter Endpoints
- `POST /newsletter/generate` - Generate newsletter from research session (`{ "researchSessionId", "selectedAngle" }`)
- `GET /newsletter` - Retrieve all newsletters
- `GET /newsletter/:id` - Retrieve specific newsletter
- `PUT /newsletter/:id` - Update headline, body, or status
- `PATCH /newsletter/:id/status` - Update status (`draft`, `under_review`, `finalized`)
- `DELETE /newsletter/:id` - Delete newsletter

---

## 8. Documentation Deliverables

Detailed submission documentation is available in the [`docs/`](./docs) directory:
- [**Product Note**](./docs/PRODUCT_NOTE.md) – Editorial product decisions, strategy, personas, and trade-offs.
- [**Engineering Note**](./docs/ENGINEERING_NOTE.md) – Technical architecture, SSRF defense, extraction pipeline, deterministic logic boundaries, and schema design.
- [**Sample Newsletter**](./docs/SAMPLE_NEWSLETTER.md) – Production-ready 398-word article formatted in Markdown with verified links.
- [**Before-and-After Example**](./docs/BEFORE_AFTER_EXAMPLE.md) – Complete side-by-side writing transformation detailing issues, rewrites, and metrics improvement.
- [**AI Disclosure Statement**](./docs/AI_DISCLOSURE.md) – Comprehensive statement of AI tools used and personally validated engineering work.

---

## 9. Testing & Verification

Run the end-to-end verification script:
```bash
cd backend
npm test
```
The test suite validates:
1. SSRF URL rejection (verifying `127.0.0.1`, `localhost`, and private IPs are blocked).
2. Deterministic text metrics calculations (words, sentences, Flesch-Kincaid readability).
3. Creation of research sessions with 3+ sources.
4. Article extraction and collective brief generation.
5. Hemingway writing analysis with suggestion acceptance and revised text updating.
6. Newsletter generation and word count verification.
7. MongoDB schema relationships and persistence.
