# Tweet Threads — Technical & Lay Versions

Two ready-to-adapt threads. Numbers tracked to the paper and the project
site (`public/index.html`). Author affiliations match the paper and the
site (emoji scheme: 🐝 GT · 🔥 MATS · 🕊️ EleutherAI · 🤖 KAIST AI · 🛡️
GT AI Safety Initiative).

## Image assets

The paper figures live in the paper repo (`figures/`), not in this
public site. For each thread below, image paths point to the paper
figure that belongs there. Before posting:

1. Export a PNG (most platforms don't render PDF previews):
   `pdftoppm -png -r 200 <figure>.pdf <out>`.
2. Drop exported PNGs into `public/static/images/` (or your hosting
   location) and attach to the tweet. Don't hotlink paper-repo paths.

Hashtag set (use sparingly — 1–2 per thread):
**Researcher:** `#TDA #InterpML #COLM2026 #OLMo`
**Lay:** `#AI #LLM #MachineLearning #OpenScience`

Character budget assumes the X 280-char ceiling. Trim for Bluesky
(300) or LinkedIn (3,000).

---

## Thread A — Researcher-to-researcher (10 tweets)

### Tweet 1/10 · HOOK + HERO IMAGE

> Where does an open LLM learn social reasoning, and how does that
> region of the pretraining corpus differ from where it learns factual
> knowledge?
>
> New work on OLMo3-7B + Dolma3 — 5.68M docs, 576 bins, one striking
> sign flip. 🧵

**Image:** pipeline overview (`figures/figure_1.drawio.png` or the
project-site hero visual).

---

### Tweet 2/10 · METHOD IN ONE FRAME

> We run gradient-based training-data attribution (TrackStar via
> Bergson) over a 5.68M-document working set, then aggregate
> document-level influence to bins defined by WebOrganizer:
> 24 topics × 24 formats = 576 bins.
>
> Bin-level aggregation is the methodological key.

**Image:** `figures/attribution_figures/fig_influence_signed_2x2.png`
(2×2 heatmaps, diffuse vs. concentrated).

---

### Tweet 3/10 · THE 2×2 DESIGN

> Four benchmarks chosen to cross *domain* with *capability type*:
>
> · SocialIQA → social × reasoning
> · MMLU Social Sciences → social × knowledge
> · ARC-Challenge → STEM × reasoning
> · MMLU STEM → STEM × knowledge
>
> One model, one corpus, four contrasts. Lets us separate "social"
> from "reasoning."

---

### Tweet 4/10 · THE SIGN-FLIP HEADLINE

> Finding 1: One specific bin —
> **Literature × Customer Support** — is the strongest *positive*
> signal for SocialIQA (+13.11) AND a *negative* signal for MMLU Social
> Sciences and MMLU STEM.
>
> Same data region. Opposite effects.

**Image:** `figures/attribution_figures/fig_influence_diff_combined_canonical.png`
or a render of `tables/tab-correctness-extremes.tex`.

---

### Tweet 5/10 · THE GEOMETRY

> SocialIQA influence spreads broadly across the heatmap.
> MMLU SS / ARC-C / MMLU STEM concentrate positive mass in the
> *Documentation* and *Structured Data* columns.
>
> Reasoning is heterogeneous in its data support; knowledge is
> concentrated. Not just a magnitude story — a *geometric* story.

**Image:** `figures/attribution_figures/fig_influence_signed_topic_4panel.png`.

---

### Tweet 6/10 · REASONING > KNOWLEDGE CONTRAST

> Domain matters less than capability type. The social–STEM split is
> sharper for reasoning than for knowledge: influence profiles separate
> more cleanly when you hold capability type and vary domain than the
> other way around.

---

### Tweet 7/10 · LEXICAL MECHANISM

> What linguistically distinguishes a top SocialIQA bin?
>
> Top bins split into two clusters:
> · interpersonal: high first-person pronouns and mental-state verbs
> · technical docs: sparse pronouns, few mental-state terms
>
> Social reasoning needs *both*.

**Image:** a render of `tables/tab-rq4-profiles.tex`.

---

### Tweet 8/10 · CAUSAL VALIDATION VIA UNLEARNING

> Are these influence scores signal or artifact?
>
> We forget the high-influence bins (LoRA unlearning) and re-test.
> Influence-targeted forgetting damages the aligned benchmark more than
> within-bin random baselines — clearest for SocialIQA (+1.60 pp,
> Wilcoxon p ≈ 1e−5). Effects on the comparison tasks are weaker, null,
> or reversed.

**Image:** `figures/unlearning/unlearning_paired_arc.png` (export PNG).

---

### Tweet 9/10 · WHY BIN-LEVEL?

> The methodological thesis:
>
> Document-level influence scores are too noisy for reliable
> capability-provenance claims. Aggregation over a structured
> *a priori* taxonomy is not just smoothing — it's what turns
> attribution into a discovery method.
>
> Recipe generalises to other models / corpora.

---

### Tweet 10/10 · LINK + LIMITS

> Limits: single ecosystem (OLMo3-7B + Dolma3); Bergson uses random
> projection — approximation noise reported. Unlearning validation is
> partial, not exact effect-size identification.
>
> Paper, code, sampling manifests, bin-level influence matrix,
> unlearning checkpoints → [project site link]
>
> Comments welcome.

---

## Thread B — Lay-accessible (9 tweets)

Plain English. No "Δz", no "TDA", no "influence functions." Just the
story.

### Tweet 1/9 · HOOK

> Modern AIs are surprisingly good at reading social situations —
> "if Alex is annoyed, why?" type questions.
>
> Where in the firehose of training data do they learn that?
>
> New work traces it. The answer is weirder than you'd expect. 🧵

**Image:** pipeline overview (`figures/figure_1.drawio.png`).

---

### Tweet 2/9 · SETUP

> The model: OLMo3-7B (open weights).
> The training data: Dolma3 — an open mix of the web, Wikipedia,
> books, code, forums, papers.
>
> We sort it into 576 buckets by *what kind of text* and *what topic*
> (e.g., "fiction × Q&A forum"), then ask: which buckets matter for
> which skills?

---

### Tweet 3/9 · THE FOUR TESTS

> Four tests, picked to separate "social" from "academic" and
> "reasoning" from "memorising facts":
>
> · SocialIQA — read social situations
> · MMLU Social Sciences — recall social-science facts
> · ARC-Challenge — reason about science
> · MMLU STEM — recall STEM facts

---

### Tweet 4/9 · THE WEIRD RESULT

> One single bucket — **fiction written as fake customer-support
> dialogues** (think: fan-forum Q&A, dialogue-rich book content) —
> is the *best* source of training data for social reasoning…
>
> …and works *against* factual recall on the STEM tests.
>
> Same data. Opposite effect.

**Image:** `figures/attribution_figures/fig_influence_diff_combined_canonical.png`
or a render of `tab-correctness-extremes.tex`.

---

### Tweet 5/9 · WHY?

> The data the model uses for social reasoning looks bimodal:
>
> 1) short, dialogue-heavy text full of "I", "you", "she felt", "he
> thought" — perspective-taking language.
> 2) long, technical documentation — for world knowledge.
>
> Social reasoning needs both. Pure fiction isn't enough; pure
> textbook isn't either.

**Image:** a render of `tab-rq4-profiles.tex` (the lexical-profile table).

---

### Tweet 6/9 · CONCENTRATED vs. SPREAD

> Factual knowledge is concentrated: a few "documentation" buckets do
> most of the work.
>
> Social reasoning is spread out: many buckets contribute,
> heterogeneously.
>
> This isn't just a numbers difference — the *shape* of the influence
> map is different.

**Image:** `figures/attribution_figures/fig_influence_signed_2x2.png`.

---

### Tweet 7/9 · SANITY CHECK

> We didn't just trust the influence scores. We *deleted* the
> high-influence buckets from the model's memory (machine unlearning)
> and re-tested.
>
> The scores predicted what would break: influence-targeted forgetting
> damaged social reasoning more than forgetting random data from the
> same buckets.

**Image:** `figures/unlearning/unlearning_paired_arc.png` (export PNG).

---

### Tweet 8/9 · WHY ANYONE SHOULD CARE

> If you're curating training data:
> · "more textbook content" won't make models better at social
> reasoning. They need dialogue-heavy fiction *too*.
> · The same data can help one capability and work against another.
> There's no globally "good" or "bad" web text.
>
> Data choices have *targets*.

---

### Tweet 9/9 · LINK

> Open paper, open code, open data manifests, open influence matrix,
> open unlearning checkpoints. Reuse the recipe on your favourite
> open model.
>
> → [project site link]
>
> Built on OLMo3 (AllenAI) and Bergson (EleutherAI). Thanks to both
> teams.

---

## Posting checklist

- [ ] Numbers match the latest paper / site (re-check the SocialIQA
      sign-flip value and the unlearning pp against `public/index.html`
      before posting).
- [ ] PDF-only assets exported to PNG.
- [ ] Image alt-text written for each attached image (accessibility —
      required by some venues).
- [ ] First tweet pinned with the project-site URL.
- [ ] Posting order coordinated with co-author socials if any will
      quote-repost.
