# Engineering Note: AI Editorial Workspace (Version 2.0)

**Project:** AI Editorial Workspace – *This Week in AI*  
**Document Type:** Architectural & Technical Implementation Reference  
**Backend:** Node.js (v26) + Express.js + Mongoose  
**Frontend:** React.js (v19) + Vite (v6) + Tailwind CSS (v4)  
**Database:** MongoDB Atlas  
**AI Engine:** Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`)  

---

## 1. System Architecture

```
                    ┌──────────────────────────┐
                    │      React Frontend      │
                    │   (Vite + Tailwind CSS)  │
                    └────────────┬─────────────┘
                                 │ REST APIs / JSON
                                 ▼
                    ┌──────────────────────────┐
                    │     Express REST API     │
                    │ (Helmet, CORS, RateLimit)│
                    └────────────┬─────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Research Service │   │ Writing Service  │   │Newsletter Service│
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
         ├──────────────────────┼──────────────────────┤
         ▼                      ▼                      ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Article Ingestion│   │    AI Service    │   │  Text Metrics    │
│(SSRF, Readability│   │ (Google Gemini)  │   │  (Deterministic) │
│ & Cheerio parser)│   └──────────────────┘   └──────────────────┘
└──────────────────┘
         │                      │
         ▼                      ▼
┌────────────────────────────────────────────────────────┐
│                   Mongoose ODM                         │
│   (ResearchSession, Source, WritingDraft, Newsletter)  │
└───────────────────────────────┬────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────┐
│                   MongoDB Atlas                        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Security Architecture & SSRF Prevention

Allowing users to input arbitrary URLs for server-side fetching exposes applications to **Server-Side Request Forgery (SSRF)**. Malicious payloads could attempt to probe internal cloud metadata services (`169.254.169.254`), local administrative daemons (`localhost`, `127.0.0.1`), or private subnets.

Our `urlValidator.js` implements a multi-layer defense:
1. **Protocol Whitelisting:** Strict restriction to `http:` and `https:`.
2. **IP Range Filtering:** Detects and denies:
   - Loopback (`127.0.0.0/8`, `::1`)
   - Link-local and cloud metadata (`169.254.0.0/16`, `fe80::/10`)
   - RFC 1918 Private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
   - Carrier-grade NAT (`100.64.0.0/10`)
3. **DNS Resolution Verification:** Resolves hostnames to their underlying IP addresses using `dns.lookup` before any HTTP socket connection is established. If any resolved IP belongs to a private subnet, the request is rejected immediately with code 422.
4. **Fetch Boundaries:** Ingestion requests enforce a 10-second socket timeout and an 8MB maximum content length to safeguard against denial-of-service and memory exhaustion attacks.

---

## 3. Article Extraction Pipeline

To handle diverse publishing systems without brittle site-specific scrapers:
1. **Mozilla Readability with JSDOM:** Strips boilerplates, sidebars, navigation trees, and advertisements, isolating the semantic article body.
2. **Cheerio Fallback:** If Mozilla Readability fails or extracts fewer than 150 characters, Cheerio removes `<script>`, `<style>`, `<nav>`, `<aside>`, and social banners, extracting content from `<article>`, `<main>`, or sequential `<p>` tags.
3. **Manual Content Ingestion:** If a website enforces dynamic bot blocking or login paywalls, the editor can paste raw article text directly. The system assigns a `manual_input` status and hashes the content with SHA-256 for duplicate detection.

---

## 4. Deterministic Logic vs. LLM Responsibilities

In alignment with **Senior Developer Decision Ladder**, deterministic computations are performed directly in standard JavaScript:

| Operation | Implementation | Rationale |
| :--- | :--- | :--- |
| **Word & Sentence Count** | Regex word boundary matching (`\b[\w'-]+\b`) | Instant, 100% exact, eliminates LLM hallucinations. |
| **Reading Time** | Standard 200 wpm baseline calculation | Predictable and consistent across screens. |
| **Readability Score** | Flesch-Kincaid Reading Ease formula | Standard mathematical equation based on sentence lengths and syllable counts. |
| **Suggestion Replacement** | String target search and replacement | LLMs re-generating entire drafts introduce subtle hallucinations and unintended mutations. Targeted substring replacement guarantees user sovereignty and preserves exact indices. |
| **AI Responsibilities** | Google Gemini API (`@google/generative-ai`) | Reserved strictly for semantic tasks: synthesizing diverse sources, classifying facts vs. analysis vs. speculation, identifying writing issues, and generating structured JSON briefs. |

---

## 5. Database Schema & Indexing

The application uses MongoDB Atlas with four distinct collections referenced via Mongoose `ObjectId`s:

1. **`researchSessions`:** Stores session title, source references, status, and the 8-section `researchBrief`. Indexed on `{ createdAt: -1 }`.
2. **`sources`:** Stores submitted URLs, publishers, extracted content, SHA-256 content hashes, and extraction status (`pending`, `processing`, `completed`, `failed`, `manual_input`). Indexed on `{ researchSessionId: 1, url: 1 }`.
3. **`writingDrafts`:** Stores original text, revised text, suggestion statuses (`pending`, `accepted`, `rejected`), and deterministic metrics. Indexed on `{ updatedAt: -1 }`.
4. **`newsletters`:** Stores headlines, markdown bodies, selected angle, source links, status (`draft`, `under_review`, `finalized`), and word counts. Indexed on `{ researchSessionId: 1, createdAt: -1 }`.

---

## 6. Fault Tolerance & Fallback Capabilities

- **Zero-Crash Server Boot:** If `MONGO_URI` is not configured at startup, the server still boots cleanly, serves `/api/health`, and returns clean HTTP 503 responses for database endpoints, preventing container crash-loops.
- **AI Quota & Offline Resilience:** If `GEMINI_API_KEY` is omitted or throttled, `AIService` includes deterministic editorial fallbacks that generate realistic briefs, writing reviews, and newsletter drafts so developers and reviewers can test all UX workflows without API barriers.
- **Overlapping Suggestion Protection:** If an accepted edit modifies the draft, subsequent replacements safely verify that target substrings still exist in `revisedText` before executing substitutions.

