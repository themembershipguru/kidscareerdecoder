# KidsCareerDecoder — Final Presentation Outline

**Student:** Neel Kapoor (O23BCA110261)  
**Guide:** Rohit Jha  
**Date:** 22 May 2026  
**Format for Qollabb:** PPT or PDF, max 20 MB (separate from the project report PDF)

**Generated files:** `KidsCareerDecoder_Presentation.pptx` on Desktop and in `docs/`

Use 12–18 slides, ~10–15 minutes. Export as **PDF** or **PPTX** and upload under **Final Presentation** on Qollabb.

---

## Slide 1 — Title
- KidsCareerDecoder — Web-Based Child Aptitude Assessment and Career Insight Platform
- Neel Kapoor, BCA Final Year Sem VI, Chandigarh University
- Under the guidance of Rohit Jha

## Slide 2 — Problem
- Parents lack structured, child-friendly insight into strengths
- Generic quizzes are not traceable or parent-visible
- Need: secure family accounts + quizzes + AI careers with regional context

## Slide 3 — Objectives
- Parent/child/admin roles
- Published quizzes and adaptive sessions
- Six aptitude stripes + AI/fallback careers
- Dashboards and admin console

## Slide 4 — Literature / Existing vs Proposed
- Holland / interest inventories vs six transparent stripes
- Table: survey site vs KidsCareerDecoder (audience, traceability, AI, admin)

## Slide 5 — System Architecture
- React (Vite) → Express API → PostgreSQL (Supabase)
- External: Claude / OpenAI, SMTP, optional IPinfo
- *Use your hand-drawn architecture or DFD Level 0*

## Slide 6 — Database Design
- Core tables: users, quizzes, questions, options, sessions, answers
- *Use your hand-drawn ER diagram*

## Slide 7 — Key Design Diagrams
- DFD Level 1 or use case diagram (hand-drawn)
- Sequence: session complete → AI → save metadata

## Slide 8 — Implementation Highlights
- JWT + bcrypt auth
- `sessionController`: tally → normalize → preprocess → AI
- `CareerResultCard`: child vs parent variant
- Admin AI provider switch

## Slide 9 — Demo Screenshots (Parent)
- Add child (Fig 5.1)
- Parent dashboard (Fig 5.2)

## Slide 10 — Demo Screenshots (Child)
- Quiz picker (Fig 5.3)
- Question + results (Fig 5.4, 7.2)

## Slide 11 — Demo Screenshots (Admin)
- Overview + Insights (Fig 5.5–5.6)
- Sessions with AI provider (Fig 5.8)

## Slide 12 — AI & Preprocessing
- Percentages + age + country → LLM JSON
- Notebook `ai_preprocess_demo.ipynb` for parity
- Fallback when API unavailable

## Slide 13 — Testing Summary
- 27 test cases Pass (Ch. 6)
- Security: 401/403, reset token, SQL parameterization

## Slide 14 — Results
- Objectives met (FR1–FR10)
- Parent report + child AI careers (Fig 7.1, 7.2)
- Limitations: exploratory, not clinical

## Slide 15 — Future Work
- Mobile app, HttpOnly cookies, CI tests, Hindi UI, IRT adaptive

## Slide 16 — Conclusion
- Full-stack BCA capstone delivered
- Thank you / Questions?

---

## Qollabb checklist (from portal)
| Item | Required | Format |
|------|----------|--------|
| Final Project Report | Yes | PDF, ≤ 20 MB |
| Final Presentation | Yes | PPT or PDF, ≤ 20 MB |
| Any other file (video) | No | MP4/AVI/MKV, ≤ 20 MB |
| Link of your work | Yes | GitHub or live demo URL |

## Tips
- Paste screenshots from `docs/assets/screenshots/`
- Keep bullet points short; speak the detail in viva
- Match report title and guide name on slide 1
