# Website redesign design doc

Status: approved 2026-07-08. Next step: the writing-plans skill produces an
executable implementation plan from this doc.

A comprehensive blueprint for redesigning `public/` on `main`. The stack stays
single-file static HTML + vanilla JS (no Astro, no framework). The animation
suite from the `socialtda-research-animations-de0a5a` worktree merges in as the
media layer.

Scope: information architecture, the three-tier copy system, findings curation,
animation integration, image optimization, the multi-model extension pattern,
and concrete copy rewrites for the headline tier. This doc does **not**
fabricate Comma/DCLM results. It designs the bounded slots they will fill.

## Resolved decisions (from brainstorming)

- **Multi-model structure:** deep-dive + comparison section. OLMo3-7B keeps the
  full deep-dive. Comma 7B and DCLM 7B live in a dedicated "Results across
  models" section that re-runs the headline results against OLMo3 as baseline.
- **Copy direction:** layered voice by tier (headline / explanation / evidence).
- **Animations:** feature the worktree suite prominently.
- **Scope:** comprehensive blueprint.
- **Anonymity:** the paper is **accepted at COLM 2026**. The site is fully
  non-anonymous. No `?review=1` mode is needed; the review-mode concern is
  removed from the plan. The eyebrow and metadata change from "Under review"
  to "Accepted at COLM 2026."
- **Comparison metrics:** defer the exact metric choice. Design the data shape
  and placeholder slots now. Pick the specific metrics when Comma/DCLM results
  land. The three proposed in brainstorming remain the leading candidates.
- **HuggingFace:** a HF Models/Datasets link is planned for the artifact
  release. Keep `huggingface_logo.svg` and design a pending Resources slot.

## 1. Target architecture

New top-to-bottom section order:

1. **Hero** — title, subtitle, authors, affiliations, action links, animated
   Figure 1 teaser. Media unchanged; copy restructured (eyebrow updated to
   "Accepted at COLM 2026").
2. **One-sentence contribution band (NEW)** — the missing TL;DR, result-forward,
   placed immediately under the hero. This is the single biggest copy fix.
3. **Metrics band (revised)** — leads with the headline result, not GPU cost.
4. **Abstract / skimmable overview** — official abstract plus a one-line
   plain-English interpretation.
5. **Method** — pipeline, taxonomy grid, 2×2 contrastive design. Method
   animations live here.
6. **Key findings (three-tier)** — the 4 headline findings, each restructured
   into headline / explanation / evidence tiers.
7. **Results across models (NEW)** — the cross-model comparison section with
   OLMo3 data now and Comma/DCLM columns reserved as pending.
8. **Evidence gallery** — the four static result figures (optimized), plus the
   result animations.
9. **Scope & limitations** — revised to frame multi-model as active work, not
   just an open question.
10. **Resources** — clean up the placeholder artifacts; wire the GitHub link,
    reserve the HF link, mark the rest clearly.
11. **Citation** — BibTeX block, unchanged.
12. **Footer** — unchanged.

## 2. The three-tier voice system

Tiered voice only works if the tiers carry different information. The register
descends from confident-headline to precise-evidence within each finding:

- **Tier 1 — Headline:** the finding in one sentence, with the number.
  Result-forward, minimal hedging. This is what a reader scrolling fast takes
  away.
- **Tier 2 — Explanation:** why it matters and what the method did, in plain
  language for an adjacent researcher (not an attribution specialist). Short
  sentences, no z-scores.
- **Tier 3 — Evidence:** the precise numbers, confidence intervals, p-values,
  sample sizes, and caveats. The conservative, hedged register the current
  site uses everywhere, but confined to this tier.

The headline number currently buried (SocialIQA unlearning +1.60 pp, p≈1e-5)
moves up to Tier 1 of finding 04 and into the metrics band.

## 3. Findings curation

Source of truth: the 11 approved headline claims in
`docs/research-animations/agent-handoff/CLAIM_GUARDRAILS.md` and the values in
`docs/research-animations/agent-handoff/data/socialtda_claims.yaml`. The public
site currently surfaces 4 findings and leaves several strong results off-page.

### Keep as the 4 headline findings (restructured into tiers)

- **01 SocialIQA is the outlier** — correlation r ≤ 0.22 vs 0.53–0.86 among the
  other three tasks. Source: `socialtda_claims.yaml:145-169`.
- **02 The signature bin sign-flips** — Literature × Customer Support: +16.0
  (SocialIQA), −7.31 (MMLU Soc Sci), −0.45 (ARC-C), −5.75 (MMLU STEM). Source:
  `socialtda_claims.yaml:123-129`.
- **03 Reasoning separates more than knowledge** — |Δz| up to 0.91 for the
  reasoning pair (SocialIQA − ARC) vs 0.63 for the knowledge pair. Source:
  `socialtda_claims.yaml:231-263`.
- **04 Unlearning gives selective damage** — SocialIQA median d +0.0160,
  Wilcoxon p_BH ≈ 1e-5; others weaker, null, or reversed. Source:
  `socialtda_claims.yaml:330-374`.

### Promote from off-page to Tier 3 evidence / secondary callouts

- **Lexical bimodality 10/10 split** — already a "living figure"; elevate its
  caption to state the split explicitly. Source: `socialtda_claims.yaml:309-327`.
- **Correctness-differential sign flip** — currently absent from the public
  site. Literature × Customer Support is top-positive for SocialIQA (+13.11)
  and ARC-Challenge (+6.0) but top-negative for MMLU Soc Sci (−2.19) and MMLU
  STEM (−2.17). Source: `socialtda_claims.yaml:264-308`. Add as a Tier 3
  secondary callout near finding 02.
- **Corpus skew / Gini 0.68** — currently in the Data section inline facts.
  Keep there; it is the right tier for that detail.

### Cut / de-emphasize

- The dead `.unlearn-viz` / `.mini-bars` CSS and JS (`public/static/css/socialtda.css`
  around lines 456–547; `public/static/js/main.js` around lines 88–94 and 107).
  These have no matching markup. Remove during implementation.
- The redundant "three labels for one section" problem: nav says "Figures",
  kicker says "Living Figures", H2 says "Three claims, three compact
  animations." Unify to one name.

## 4. Multi-model extension pattern (the contract)

The site is currently hard-wired to one model. To make Comma/DCLM addable
without retrofitting, establish a data pattern now.

- **Adopt the shared JS data module.** The worktree already has
  `public/static/js/animations/socialtda-data.js` as the single JS source of
  truth. Bring it onto `main`. This eliminates the current duplication where
  the same numbers live in both `index.html` bar rows and `figure1.js` data
  objects (manual-sync drift risk flagged in the audit).
- **Define the comparison data shape now.** The comparison section renders from
  a structure like:

  ```js
  models: {
    olmo3:   { status: "done",   /* full data */ },
    comma7b: { status: "pending" },
    dclm7b:  { status: "pending" },
  }
  ```

  When results land, fill the object and the table renders with no IA change.
  The OLMo3 column renders its real numbers immediately (it is done). The
  Comma/DCLM columns render the pending placeholder until their objects are
  filled.
- **Comparison metrics:** deferred. The leading candidates from brainstorming
  are (a) SocialIQA-vs-others profile correlation range, (b) signature-bin
  sign-flip magnitudes, (c) unlearning paired-damage for SocialIQA. Lock the
  specific metrics when Comma/DCLM results land.
- **Comma/DCLM placeholders read honestly.** "In progress" with a one-line
  note. Never a fabricated number. Guardrail: never imply results exist before
  they do.

When the Comma/DCLM results are ready, the work is filling a data object and
regenerating the comparison figures, not redesigning the page.

## 5. Animation integration

Merge the `socialtda-research-animations-de0a5a` suite into `main` as the media
layer. Four finished animations plus the in-page Figure 1 GSAP animation:

- **Figure 1 hero animation** (existing `public/static/js/figure1.js`): stays
  as the hero teaser. Method overview.
- **signature-bin** (sign flip, the most shareable result): features in
  finding 02.
- **aggregation** (documents → 576 bins, the method contribution): features in
  the Method section.
- **benchmark-design** (2×2 contrastive design): features in the Method
  section.
- **targeted-random-unlearning** (validation logic): features in finding 04.
- **lexical-bimodality** (coded, not yet exported): when exported, features in
  the lexical finding.

Integration mechanics:

- Use MP4 as primary format with poster-frame-first loading (lazy,
  `preload="none"` until in view via IntersectionObserver). GIF only as legacy
  fallback. The aggregation GIF alone is 949 KB; the MP4 is smaller and better.
- All animations respect `prefers-reduced-motion` (static poster-frame
  fallback). This pattern already exists for Figure 1.
- Adopt the worktree's shared data module so animation scenes import numbers
  rather than duplicating them.
- No review-mode handling is needed (paper is accepted, fully non-anonymous).

Source assets (worktree-only until merged): `public/static/animations/exports/`
contains MP4 (16:9 and square), GIF, and poster PNG (16:9 and square) for each
of the four finished animations.

## 6. Image optimization

All five figures are unoptimized PNGs. Priority fixes:

- `public/static/images/figures/fig_influence_signed_2x2.png`: 1.68 MB at
  6000×4800. Grossly oversized. Generate WebP and a sensibly-sized display
  copy.
- `public/static/images/figures/fig-overview-revised.png`: 1.15 MB at
  1672×753. WebP variant for the hero fallback.
- All four evidence figures: WebP, keeping the existing `loading="lazy"
  decoding="async"`.
- Keep PNG originals for archival; serve WebP to browsers.
- Run `/Users/glenn/.agents/skills/paper-website/scripts/optimize-media.py`
  for the conversion.

## 7. Concrete issues to fix during implementation

- **Venue status copy:** update "Under review at COLM 2026" to "Accepted at
  COLM 2026" in the eyebrow (`public/index.html:99`). Update any JSON-LD or
  metadata that references review status.
- **Nav/section label mismatch:** unify the figures section to one name across
  nav, kicker, H2.
- **Metrics band order:** lead with the result, not "37K GPU hours." Suggested
  order: 576 bins · 5.68M docs · 4 benchmarks · SocialIQA +1.60 pp (p≈1e-5).
  Move GPU hours to a methods/data detail.
- **TL;DR gap:** add the one-sentence contribution band under the hero. The OG
  description line (which currently never appears on-page) is a strong basis.
- **Resources placeholders:** 3 of 4 entries are non-clickable "coming soon."
  Keep the GitHub link live, reserve the HF link slot, and label the rest
  consistently as pending. Do not leave them looking like broken links.
- **Dead code:** remove the orphaned `.unlearn-viz` / `.mini-bars` CSS and the
  matching JS branch.
- **Number duplication:** adopt the shared data module to eliminate the
  HTML/JS double-source-of-truth.
- **Orphaned asset:** `public/static/images/huggingface_logo.svg` stays; wire a
  pending HF Resources slot.
- **URL consistency:** `og:url`, `canonical`, and `og:image` point to
  `https://eilab.gatech.edu/` but `README.md:5` and the repo path say
  `/social-data-attribution/`. Verify the live URL and set canonical/OG to the
  correct absolute paths; the current `og:image` may 404.

## 8. Concrete copy rewrites (Tier 1 headline tier)

Drafts for the headline tier, so the voice is judged before implementation.
Tier 2 and Tier 3 are drafted during implementation, grounded in the claims
YAML.

- **New TL;DR band (under hero):** "Training-data attribution shows that social
  reasoning and STEM reasoning draw on distinct regions of the pretraining
  corpus. We confirm it by selectively unlearning the regions that matter."
- **Metrics band lead:** move "+1.60 pp (p≈1e-5)" up as the result metric.
- **Finding 01 Tier 1:** "Social reasoning has a different data signature than
  the other three tasks we tested."
- **Finding 02 Tier 1:** "One corpus region, Literature × Customer Support,
  strongly supports social reasoning while suppressing the STEM tasks."
- **Finding 03 Tier 1:** "The social-versus-STEM split is sharper for reasoning
  tasks than for knowledge tasks."
- **Finding 04 Tier 1:** "Unlearning the regions attribution flagged
  selectively damages social reasoning, confirming the pattern causally. The
  effect is clearest for SocialIQA."

These stay within `CLAIM_GUARDRAILS.md`: no "we proved exact documents," no
"generalizes to all models," no "only customer support." All hedging lives in
Tier 3.

## 9. What this design does NOT do

- Does not fabricate Comma 7B or DCLM 7B results. It designs bounded, honestly
  labeled slots.
- Does not change the tech stack (stays single-file static HTML + vanilla JS).
- Does not build a review/anonymity mode (the paper is accepted; the site is
  fully non-anonymous).

## 10. Implementation phasing (guidance for the writing-plans step)

A suggested order, so each phase is independently verifiable:

1. **Foundation:** adopt the shared JS data module on `main`; remove dead code;
  fix the venue-status, TL;DR, metrics-band, and label-mismatch issues. No new
  sections yet.
2. **Three-tier findings:** restructure the existing 4 findings into tiers;
  promote the correctness-differential and lexical-bimodality secondary
  callouts.
3. **Comparison section:** add the "Results across models" section with the
  data shape and pending placeholders.
4. **Media merge:** bring in the animation suite; wire poster-frame-first
  loading; respect reduced-motion.
5. **Optimization and polish:** WebP conversion; URL/canonical/OG fixup;
  Resources slot cleanup; HF slot.

Phasing is a suggestion for the implementation plan, not a hard contract.
