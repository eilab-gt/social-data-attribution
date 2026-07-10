# QA note — lexical-bimodality (10_lexical_bimodality)

Date: 2026-07-09
Brief: `docs/research-animations/agent-handoff/briefs/10_lexical_bimodality.md`

## Claim and values shown

**Claim:** SocialIQA's top-20 high-influence bins split 10/10 between
interactional (dialogic + personal) and expository/structured formats, and
the signature interactional bin (Literature × Customer Support) is short,
second-person-heavy, dialogue-rich text — approved headline claim #8 in
`CLAIM_GUARDRAILS.md`.

**This animation claims:** the measured 10/10 split; the measured
interactional-minus-expository contrast; the measured lexical profile of
Literature × Customer Support.

**This animation does NOT claim:** which specific ranked bin belongs to
which island (see data-honesty note below), that all high-influence text is
conversational (the takeaway is exactly that support is *bimodal* — the
brief's guardrail), or anything about raw documents (aggregate statistics
only; icons, never text).

| Value shown | Matches `socialtda_claims.yaml` (`lexical:`) |
|---|---|
| top-20 bins, 10/10 interactional vs expository | ✔ (`socialiqa_top20_bimodal`) |
| interactional − expository: −1,558 words per doc | ✔ (`social_vs_expository_contrast.mean_words_per_doc_delta`) |
| +2.82 mental-state terms per 1k | ✔ (`mental_state_per_1k_delta`) |
| dialogue z +0.61 · social z +0.70 | ✔ (`dialogue_z_delta`, `social_z_delta` = 0.7, rendered to 2 dp) |
| L×CS: 245 mean words | ✔ (`literature_customer_support_profile.mean_words`) |
| L×CS: 33.39 second-person /1k | ✔ (`second_person_per_1k`) |
| L×CS: 6.22 mental-state terms /1k | ✔ (`mental_state_per_1k`) |
| L×CS: dialogue z +2.38 · social z +1.82 | ✔ (`dialogue_z`, `social_z`) |

All values render from the new `LEXICAL` export in `socialtda-data.js`
(full transcription, including fields documented but not drawn: docs 10000,
first/third-person rates, affect z, affect-z delta).

### Data-honesty note (island assignment)

The YAML records the 10/10 **count**, not which ranked bin sits in which
island. The scene therefore:

- shows rank labels (#1–#20) only while the cards form a ranked list;
  the labels fade out during the split, so the two islands claim only the
  counts;
- sends rank #1 to the interactional island — supported, since the top
  SocialIQA bin is Literature × Customer Support (the claims panel's
  extreme positive bin) and its transcribed lexical profile is dialogic;
- assigns the remaining 19 cards by seeded PRNG, stated on screen:
  "Counts are the measured 10/10 split; which unlabeled card sits in which
  island is illustrative."

Source status: transcribed starter data — no local source PDF/artifact yet.

## Storyboard conformance (brief 10)

Beats (`topbins → split → features → signature → takeaway`, 14.35 s, within
the 10–15 s brief window):

1. **Top-20 bins appear** — 20 small cards labeled by rank only (per the
   storyboard: "labeled by rank, not full text").
2. **Cards split into two islands** — 10 left (interactional, speech-bubble
   icon), 10 right (expository/structured, document icon); rank labels fade
   mid-flight.
3. **Feature meters** — per-island feature lines ("dialogic + personal ·
   shorter · mental-state terms" vs "documentation-like · longer · formal")
   plus the measured contrast strip with the four deltas.
4. **Signature card** — ring draws on the interactional island's first
   card; panel names Literature × Customer Support and prints its lexical
   profile. Caption: "Short, dialogue-rich, support-like text."
5. **End card** — SocialIQA chip appears above, links draw to both islands
   (storyboard: "Two islands connected to SocialIQA chip"); takeaway
   "Social reasoning support is bimodal." + caveats.

## Paths checked

- Runtime: `public/static/js/animations/lexical-bimodality-animation.js` +
  shared modules (data with new `LEXICAL`, palettes, svg-utils,
  timeline-utils); `animations.css` unchanged.
- Dev page: `http://localhost:8000/public/animations/dev/lexical-bimodality.html` ✔ works.
- Exports: `public/static/animations/exports/` (below).

## Checklist (EXPORT_AND_QA.md)

- [x] Scientific values match `data/socialtda_claims.yaml` (table above;
      all ten key strings verified in-browser via DOM text).
- [x] Final takeaway accurate, not overclaimed ("Social reasoning support
      is bimodal." — the guardrail's own framing).
- [x] No raw training snippets or document IDs (cards are blank rounded
      rects; icons are speech bubbles / abstract document glyphs).
- [x] Review mode works: `?review=1` omits the footer identifier entirely;
      verified no identifier text remains. Claim/values identical.
- [x] Legend: not needed — no unlabeled color semantics (the only colored
      element is the inline-labeled SocialIQA chip + its matching ring;
      islands and cards are neutral).
- [x] Text readable at 1080 px wide (checked square poster).
- [x] Square crop safe: final-frame content spans x ∈ [318, 962] (central
      square is [280, 1000]); the transient ranked grid spans x ∈ [498, 782].
- [x] `prefers-reduced-motion` gives the static final frame (`.is-static`,
      no timeline, no controls; rank labels verified hidden in static mode).
- [x] Deterministic final frame: `?end=1`, the "final frame" control, and
      `exportFrame("end")` agree on cold load; island assignment uses a
      seeded PRNG (mulberry32); all seeks pass `suppressEvents=false`.
- [x] Poster frame captures the final message (chip + two labeled islands +
      contrast strip + signature profile + takeaway).
- [x] MP4s play in a normal browser (H.264 / yuv420p, faststart).
- [x] No console errors (only the favicon 404 on the dev page).
- [x] Works under `python3 -m http.server 8000`; paths follow repo
      conventions; QA note here.

## Review questions (EXPORT_AND_QA.md)

1. **Single concept taught:** SocialIQA's high-influence corpus support has
   two distinct lexical modes — interactional and expository — not one.
2. **Paper claim supported:** approved headline claim #8.
3. **Exact values displayed:** 20 / 10 / 10; −1,558 words per doc; +2.82
   mental-state terms per 1k; dialogue z +0.61; social z +0.70; and the
   L×CS profile (245, 33.39, 6.22, +2.38, +1.82).
4. **A skeptical reader should not conclude:** that specific unlabeled
   cards are classified (caveat says illustrative), or that all
   high-influence text is conversational (takeaway says bimodal).
5. **Works without narration:** yes — each beat carries a caption.
6. **Static poster frame makes sense:** yes.
7. **Value source:** handoff transcription (`socialtda_claims.yaml`).

## Exports

| File | Spec | Status |
|---|---|---|
| `public/static/animations/exports/lexical-bimodality_poster.png` | 1920×1080 PNG | ✔ captured |
| `public/static/animations/exports/lexical-bimodality_poster_square.png` | 1080×1080 PNG | ✔ captured |
| `public/static/animations/exports/lexical-bimodality_16x9.mp4` | 1920×1080, 30 fps, H.264 | ✔ rendered, ffprobe-verified (yuv420p, 14.4 s, 432 frames); browser playback checked |
| `public/static/animations/exports/lexical-bimodality_square.mp4` | 1080×1080, 30 fps, H.264 | ✔ rendered, ffprobe-verified (yuv420p, 14.4 s, 432 frames); browser playback checked |
| `public/static/animations/exports/lexical-bimodality.gif` | 640 px wide, 15 fps | ✔ produced |

Re-render: identical pipeline to the other animations — posters via headless
Chrome `?bare=1&end=1` (+`&square=1` at 1080×1080), frames via the
checked-in `node docs/research-animations/tools/capture-frames.mjs
lexical-bimodality <16x9|square>`, ffmpeg encode, GIF palettegen. Capture
gotchas are in the script header.

## Independent review

A second-agent review ran read-only against the brief, the claims YAML
(`lexical:` section), CLAIM_GUARDRAILS, and the architecture conventions,
including live headless-Chrome CTM probes across the split/loop/reduced/
review combinations and a dedicated data-honesty assessment. It
independently re-verified every transcribed number (all faithful; no data
errors) and confirmed rank #1 → interactional is supported by the L×CS
dialogic profile and safely framed (the ring lands on an unlabeled card;
"#1 = L×CS" is never printed beside a rank number). Outcome:
**DONE_WITH_CONCERNS — 0 blockers.**

Adjudicated findings:

- **Applied (major):** rank labels previously stayed legible for ~0.2 s
  while cards began flying toward their (illustrative) islands, so a
  frame-grab could read as a per-bin island claim (e.g. "#10 →
  expository"). Labels now fade out *before* any card starts moving; a
  programmatic sweep of the split window (t = 2.6–5.0 s, every 0.05 s)
  confirms **zero** frames show a moving card carrying a visible rank
  label. Motion exports re-rendered after the fix (the final/poster frame
  was unchanged — labels were already hidden there).
- **Applied (minor):** the aria label now derives every sign via
  `spokenSigned`/`spokenSignedInt` instead of hardcoding "plus", and no
  longer calls a delta an "average" — it reads "the interactional minus
  expository contrast: …".
- **Kept as-is (nit):** the expository island's document glyph is small
  but legible; the data-module comment "social − expository" and the
  scene's "interactional − expository" describe the same island contrast.

## Remaining caveats / TODOs

- **No source PDF in repo.** All statistics rest on the transcribed
  `socialtda_claims.yaml`.
- The per-card island assignment (beyond rank #1) is illustrative by
  construction and caveated on screen; if a real top-20 classification list
  is ever added to the repo, wire the assignment to it.
- `first_person_per_1k` (26.89), `third_person_per_1k` (9.2), `affect_z`
  (0.13), `affect_z_delta` (0.71), and `docs` (10000) are transcribed but
  not drawn (kept for future scenes; the brief lists the drawn subset).
- Vertical 1080×1920 variant not built (optional per design system).
- Site integration deferred (dev page first).
