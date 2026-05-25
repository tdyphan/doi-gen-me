# PLAN DOIGenMe v1.2 (high level)

## §G Goal
Production‑ready local SPA UX + useful offline features, project/history, improved PDF handling and accessibility.

## §C Scope
UI polish, PDF download UX, bulk/queue control, projects & recent-extractions, accessibility, tests & QA.

## §I Deliverables
12 tasks (T11–T22). Each task = small PR/change in repo.

## §V Assumptions
Stay zero‑config (no server). Use Unpaywall public API (email placeholder). Keep modular JS files.

## §T Timeline
Small incremental commits; prefer order T11→T12→T13→T14→T15, then T16→T22.

---

## Tasks (short bullets, ACs)

### Task 11 — PDF UX & Safe Downloading (high)
- **Description:** Improve Download PDF / Download PDF All behavior to avoid popup spam and handle CORS.
- **ACs:**
  - AC-11.1: Single‑click Download opens PDF in new tab (if cross‑origin allows) else prompts to fetch blob and download.
  - AC-11.2: Download All queues downloads (max 3 concurrent), shows progress modal, never open >10 tabs.
  - AC-11.3: If fetch fails due to CORS, fall back to show direct link + copy button.

### Task 12 — PDF metadata enrichment & license badge (high)
- **Description:** From Unpaywall add OA type (gold/green/hybrid/bronze/closed) + license (CC‑BY etc).
- **ACs:**
  - AC-12.1: Each WorkMeta has `{pdfUrl, oaStatus, license}`.
  - AC-12.2: Show badge color per OA type in citation row.

### Task 13 — Bulk Queue & Rate Control UI (high)
- **Description:** Allow user to queue large DOI lists; show ETA, pause/resume/cancel.
- **ACs:**
  - AC-13.1: Queue UI with current/queued/failed counts.
  - AC-13.2: Pause/resume works; respects API concurrency and retry logic.

### Task 14 — Projects & Recent Extractions (medium)
- **Description:** Persist sessions as "projects" in localStorage with name, timestamp, DOI list, results.
- **ACs:**
  - AC-14.1: Create/save/load/delete project.
  - AC-14.2: Recent extractions list shows 10 latest with quick load.

### Task 15 — Export Enhancements (medium)
- **Description:** Add XLSX export (client side), include pdf_url, oa_status, license; improved CSV sanitization.
- **ACs:**
  - AC-15.1: Export XLSX via SheetJS (bundled via UMD) without build.
  - AC-15.2: CSV already includes pdf_url column and BOM.

### Task 16 — Accessibility & i18n basics (medium)
- **Description:** A11y improvements + basic i18n structure (vi/en) minimal.
- **ACs:**
  - AC-16.1: All buttons keyboard accessible, aria-labels for icons.
  - AC-16.2: Color contrast >=4.5 for text; dark mode tested.
  - AC-16.3: Provide string bundle for vi + en and toggle.

### Task 17 — UI polish & responsive tweaks (low→medium)
- **Description:** Sidebar responsive behavior, mobile collapsible panels, smaller font options in settings.
- **ACs:**
  - AC-17.1: Mobile UI shows condensed controls, extract button sticky.
  - AC-17.2: Citation cards adapt to narrow screens (stack buttons).

### Task 18 — Error reporting & retry telemetry (medium)
- **Description:** Improve error messages, add download/fetch failure reasons and allow manual retry per item.
- **ACs:**
  - AC-18.1: Show human readable error with retry button.
  - AC-18.2: Maintain failure count per DOI and expose list.

### Task 19 — Tests & QA checklist (medium)
- **Description:** Create checklist script + manual test matrix and run smoke tests local.
- **ACs:**
  - AC-19.1: checklist.md with steps (extract, export, pdf download, project save/load).
  - AC-19.2: Small smoke test script (node) to validate CSV generation logic (optional).

### Task 20 — Privacy & offline mode note (low)
- **Description:** Add Settings entry describing that Unpaywall calls are made client‑side and email used; allow user to set own email or disable OA checks.
- **ACs:**
  - AC-20.1: Settings toggle "Check OA PDFs (Unpaywall)" on/off.
  - AC-20.2: Input for contact email stored locally.

### Task 21 — Packaging & modularization (low)
- **Description:** Implement file split (js/, css/) from implementation_plan.md and update index.html script includes.
- **ACs:**
  - AC-21.1: Move code into 00_model..03_main JS files and separate CSS.
  - AC-21.2: index.html loads via relative paths and runs with double‑click.

### Task 22 — Opt: Optional background worker for heavy queues (low)
- **Description:** Use Web Worker to offload fetching/transform for very large lists, keep main UI responsive.
- **ACs:**
  - AC-22.1: Worker performs fetch+normalize, posts results to main thread.
  - AC-22.2: Fallback when Worker not supported.
