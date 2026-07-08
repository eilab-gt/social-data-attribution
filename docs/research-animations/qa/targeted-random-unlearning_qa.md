# QA note — targeted-random-unlearning (12_targeted_vs_random_unlearning)

Date: 2026-07-08
Brief: `docs/research-animations/agent-handoff/briefs/12_targeted_vs_random_unlearning.md`

## Claim and values shown

**Claim:** for SocialIQA, influence-targeted forget sets damage the intended
benchmark more than random in-topic controls under the same unlearning
procedure; the comparison benchmarks are weaker, not significant, or
reversed — approved headline claims #9 and #10 in `CLAIM_GUARDRAILS.md`.
(Caveat on-screen: "icons and selection are illustrative — no raw documents
shown", covering both the stylized document glyphs and the PRNG-driven
influence shading/selection in the lanes.)

**This animation claims:** a positive median paired difference in accuracy
damage for SocialIQA (d = +0.016, CI entirely above zero) and mixed results
for the other three benchmarks, framed throughout as *partial validation*.

**This animation does NOT claim:** that unlearning validates all benchmarks
(the mixed rows are always visible, never hidden — brief guardrail), that
the result is proof of mechanism, or that the stylized lane documents are
real corpus items. Caveats: "Partial validation — strongest for SocialIQA;
weaker, null, or reversed for the comparison benchmarks." and "stylized
document icons — no raw documents shown."

| Benchmark | median d | 95% CI | pBH (Wilcoxon) | Verdict shown | Matches YAML `unlearning.paired_influence_vs_random` |
|---|---:|---|---|---|---|
| SocialIQA | +0.016 | [+0.013, +0.022] | ≈ 1.0e−5 | clean paired result | ✔ |
| MMLU STEM | +0.002 | [−0.0003, +0.0055] | 0.028 | weaker — CI crosses zero | ✔ |
| MMLU Social Sciences | +0.0017 | [−0.0018, +0.0042] | 0.227 | not significant | ✔ |
| ARC-Challenge | −0.0026 | [−0.0043, −0.0009] | >0.99 | reversed / noise floor | ✔ |

All values render from the new `UNLEARNING` export in
`public/static/js/animations/socialtda-data.js` (full transcription
including `paired_t_p_bh` and `cohens_dz_pooled` where the YAML has them;
those two fields are documented here rather than drawn). n = 72 pairs is
taken from the data (same for all four). The on-screen badge texts are
faithful compressions of the YAML verdict strings; the full verdicts are
spoken verbatim in the aria label.

Printed-decimal policy: values print exactly as transcribed (e.g. +0.016,
+0.0017), matching the YAML rather than padding to a fixed width.

γ definition shown on-panel: d = γ(targeted) − γ(random), γ = A_baseline −
A_unlearned (from `UNLEARNING.gammaDefinition`); positive d → targeted
damages that benchmark more.

Source status: transcribed starter data — no local source PDF/artifact yet.

## Storyboard conformance (brief 12)

Beats (`lanes → select → unlearn → results → takeaway`, 14.2 s, within the
10–15 s brief window):

1. **Same topic, two lanes** — a "same corpus topic" card splits into
   *random in-topic* and *influence-targeted* lanes, each with 24 stylized
   document icons (`createDocumentGlyph`; seeded PRNG for the illustrative
   influence tints).
2. **Forget sets selected** — the random lane rings 8 evenly-spread
   documents (slate); the targeted lane rings its 8 highest-tint documents
   (influence blue). Caption: "Same topic — different documents."
3. **Unlearning module** — both selections fly into one shared box
   ("unlearning — same procedure"); the box pulses.
4. **Paired results** — the transient stage fades; a paired-difference
   forest plot reveals: SocialIQA as the emphasized hero row (larger dot,
   printed median, n/pBH stats, dark badge), the three comparison rows
   smaller with pBH text and verdict badges (the brief's "paired-dot …
   small rows with verdict badges"). Dashed zero line = no difference;
   axis annotations "targeted damages more →" / "← random more".
5. **End card** — takeaway "Attribution identifies load-bearing documents
   most clearly for SocialIQA." (storyboard's bounded conclusion) + two
   caveat lines.

## Paths checked

- Runtime: `public/static/js/animations/targeted-random-unlearning-animation.js`
  + shared modules (data with new `UNLEARNING`, palettes, svg-utils,
  timeline-utils); `animations.css` unchanged.
- Dev page: `http://localhost:8000/public/animations/dev/targeted-random-unlearning.html` ✔ works.
- Exports: `public/static/animations/exports/` (below).

## Checklist (EXPORT_AND_QA.md)

- [x] Scientific values match `data/socialtda_claims.yaml` (all four
      medians, CIs, pBH values verified in-browser via DOM text).
- [x] Final takeaway accurate, not overclaimed; unlearning framed as
      partial validation, never proof; mixed/reversed rows always shown.
- [x] No raw training snippets or document IDs (document icons are abstract
      glyph cards; caveat marks them stylized).
- [x] Review mode works: `?review=1` omits the footer identifier entirely;
      verified no identifier text remains. Claim/values identical.
- [x] Legend/key present: "dot = median paired difference (n = 72) ·
      whiskers = 95% CI · pBH = BH-corrected Wilcoxon p"; benchmark colors
      are labeled inline by each row's name; lane-selection colors are
      explained by the lane headers and caption.
- [x] Text readable at 1080 px wide (checked square poster).
- [x] Square crop safe: final-frame content spans x ∈ [333, 950]; transient
      stage spans x ∈ [360, 920] (central square is [280, 1000]).
- [x] `prefers-reduced-motion` gives the static final frame (`.is-static`,
      no timeline, no controls) — same frame as the poster by construction.
- [x] Deterministic final frame: `?end=1`, the "final frame" control, and
      `exportFrame("end")` agree on cold load; seeded PRNG only
      (mulberry32); all seeks pass `suppressEvents=false`.
- [x] Poster frame captures the final message (the forest plot + bounded
      takeaway stands alone).
- [x] MP4s play in a normal browser (H.264 / yuv420p, faststart).
- [x] No console errors (only the favicon 404 on the dev page).
- [x] Works under `python3 -m http.server 8000`; paths follow repo
      conventions; QA note here.

## Review questions (EXPORT_AND_QA.md)

1. **Single concept taught:** influence-targeted forgetting is compared
   against a matched random control under an identical procedure, and the
   paired difference is clearly positive only for SocialIQA.
2. **Paper claim supported:** approved headline claims #9 and #10.
3. **Exact values displayed:** the four median d values, four CIs (as
   whiskers), four pBH values, n = 72.
4. **A skeptical reader should not conclude:** that unlearning validates
   all benchmarks (three mixed rows say otherwise on-screen), or that this
   is exact causal tracing (caveats + "partial validation").
5. **Works without narration:** yes — each beat carries a caption.
6. **Static poster frame makes sense:** yes — headline + forest plot +
   bounded takeaway.
7. **Value source:** handoff transcription (`socialtda_claims.yaml`).

## Exports

| File | Spec | Status |
|---|---|---|
| `public/static/animations/exports/targeted-random-unlearning_poster.png` | 1920×1080 PNG | ✔ captured |
| `public/static/animations/exports/targeted-random-unlearning_poster_square.png` | 1080×1080 PNG | ✔ captured |
| `public/static/animations/exports/targeted-random-unlearning_16x9.mp4` | 1920×1080, 30 fps, H.264 | ✔ rendered, ffprobe-verified (yuv420p, 14.23 s, 427 frames, ~605 KB); browser playback checked (readyState 4) |
| `public/static/animations/exports/targeted-random-unlearning_square.mp4` | 1080×1080, 30 fps, H.264 | ✔ rendered, ffprobe-verified (yuv420p, 14.23 s, 427 frames, ~641 KB); browser playback checked |
| `public/static/animations/exports/targeted-random-unlearning.gif` | 640 px wide, 15 fps | ✔ produced (~586 KB) |

Re-render: identical pipeline to the other animations — posters via headless
Chrome `?bare=1&end=1` (+`&square=1` at 1080×1080), frames via the
checked-in `node docs/research-animations/tools/capture-frames.mjs
targeted-random-unlearning <16x9|square>`, ffmpeg encode, GIF palettegen.
Capture gotchas are in the script header.

## Independent review

A second-agent review ran read-only against the brief, the claims YAML
(`unlearning:` section), CLAIM_GUARDRAILS, and DESIGN_SYSTEM. It re-verified
every transcribed statistic against the YAML, hand-recomputed all
forest-plot x positions (zero line, four median dots, eight CI endpoints)
and matched them against the live DOM to the decimal, confirmed the
reversed ARC-Challenge result renders entirely left of the zero line, and
probed the end/loop/stage/reduced/review combinations in headless Chrome.
Outcome: **DONE — 0 blockers, 0 majors.**

Adjudicated findings:

- **Applied (minor):** the caveat now says "icons and selection are
  illustrative" — explicitly covering the PRNG-driven lane shading and
  top-8 selection, not just the absence of raw documents.
- **Applied (nit):** the plot axis moved from y = 460 to y = 470 so the
  ARC-Challenge verdict badge no longer paints over it; tick labels and
  direction annotations moved with it. Exports re-rendered after both
  fixes.
- **Kept as-is (nit):** `dDecimals()` is tuned to the transcribed dataset
  (it prints every current value exactly); revisit only if new values with
  trailing-zero decimals are added.
- **Kept as-is (nit):** `pairedTPBH` / `cohensDzPooled` remain transcribed
  but undrawn (documented above; the brief specifies the Wilcoxon pBH).

## Remaining caveats / TODOs

- **No source PDF in repo.** All statistics rest on the transcribed
  `socialtda_claims.yaml`.
- `paired_t_p_bh` (0.022 SocialIQA, 0.227 MMLU STEM) and `cohens_dz_pooled`
  (0.39, 0.23) are transcribed in the data module but not drawn; the panel
  shows the Wilcoxon pBH per the brief.
- The `cross_method_selectivity_verdict` YAML block (bin-level vs faithful
  per-document constructions) is out of scope for this clip; candidate for
  brief 13 (claim boundary).
- Vertical 1080×1920 variant not built (optional per design system).
- Site integration deferred (dev page first).
