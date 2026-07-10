# BLUF / TLDR — Three Variants

Bottom-line copy for subject lines, blurbs, talk ledes, and landing-page
text. Numbers tracked to the paper (`manuscript/` in the paper repo) and
the project site (`public/index.html`). Affiliations and author order
match the paper and the website.

---

## Variant A — One-sentence (~30 words)

For email subject lines, talk titles, Slack pings, conference-program
blurbs.

> Where in the pretraining corpus does an open LLM learn social
> reasoning vs. STEM reasoning? We trace it bin by bin, find one data
> region that helps social reasoning *and* suppresses the STEM tasks,
> and validate the attribution by unlearning.

Alternates (pick by channel):

- *Provocative:* "The same training data that helps an LLM reason about
  social situations works against its STEM-factual recall. We can show
  it, and we can confirm it by unlearning."
- *Methodological:* "Bin-level training-data attribution turns noisy
  document-level influence scores into a discovery method for
  capability provenance in OLMo3 on Dolma3."
- *Question-led:* "Where does an open LLM learn social reasoning? It's
  not where you'd guess."

---

## Variant B — Paragraph BLUF (~150 words)

The primary BLUF. Use as the lede on the project page, in the arXiv
comment, in introductory posts, or under the title in talks.

> **Where does an open LLM learn social reasoning, and how does that
> region of the pretraining corpus differ from where it learns STEM
> reasoning?** We answer this for **OLMo3-7B trained on Dolma3** by
> running gradient-based training-data attribution (TrackStar/Bergson)
> over a **5.68M-document working set** sampled across **576 bins**
> (WebOrganizer's 24 topics × 24 formats), then contrasting four
> benchmarks in a 2×2 design that crosses *domain* (social vs. STEM)
> with *capability type* (reasoning vs. knowledge). Two headline
> results: (i) one specific bin — **Literature × Customer Support** —
> is the top-positive signal for both reasoning benchmarks (SocialIQA
> +13.11, ARC-Challenge +6.0) and simultaneously top-negative for both
> knowledge benchmarks (MMLU Social Sciences, MMLU STEM); (ii)
> targeted machine unlearning on influence-ranked bins
> degrades the aligned benchmark more than within-bin random baselines,
> partially validating the attribution as causal.

---

## Variant C — One-page abstract (~400 words)

For program-committee summaries, internal briefings, blog-post ledes,
and expanded landing-page sections.

### The question
Where in the pretraining corpus does an open LLM learn the
*social-cognitive* behaviour that benchmarks like SocialIQA test for,
and how does that corpus region differ from where it learns the
factual knowledge that MMLU tests for? Training-data attribution
methods exist, but document-level influence scores have historically
been too noisy to support claims at this granularity.

### What we do
We use OLMo3-7B (open weights, open data) trained on Dolma3, and run
gradient-based attribution (TrackStar via the Bergson library) over a
working set of **5.68M documents** stratified across the **24 × 24 =
576-bin** WebOrganizer taxonomy (one document type per cell — e.g.,
*Literature × Customer Support*, *Science & Tech × Documentation*). We
aggregate document-level influence to the bin level, then contrast four
benchmarks in a 2×2 design that crosses *domain* (social vs. STEM) with
*capability type* (reasoning vs. knowledge): **SocialIQA, MMLU Social
Sciences, ARC-Challenge, MMLU STEM**.

### What we find
1. **One bin produces opposite signs on reasoning vs. knowledge.**
   *Literature × Customer Support* is the top-positive signal for both
   reasoning benchmarks (SocialIQA Δz = +13.11, ARC-Challenge +6.0) and
   top-negative for both knowledge benchmarks (MMLU Social Sciences
   −2.19, MMLU STEM −2.17). The same data region supports reasoning and
   works against factual recall.
2. **Influence geometry separates reasoning from knowledge.** Social-
   reasoning influence is spread broadly across the heatmap; STEM
   influence concentrates in *Documentation* and *Structured Data*
   columns. The social–STEM split is sharper for reasoning than for
   knowledge.
3. **Targeted unlearning validates the attribution.** Forgetting
   documents from high-influence bins produces measurable,
   capability-specific degradation, clearest for SocialIQA (+1.60 pp
   damage over within-bin random, Wilcoxon p ≈ 1e−5). Effects on the
   comparison tasks are weaker, null, or reversed.

### Why it matters
Bin-level aggregation over a structured taxonomy turns attribution into
a **discovery method** for capability provenance, not a ranking
heuristic. The recipe (taxonomy → bin-level influence → 2×2 contrast →
unlearning validation) is portable beyond this model and corpus.

### What we release
Per the abstract: code, sampling manifests, the bin-level influence
matrix, and unlearning checkpoints. Compute footprint: ~37K
H200-equivalent GPU-hours.

---

## Bylines

**Authors** (paper order, from `manuscript/authors.tex`; affiliations
shown with the same emoji markers used on the project site):

Glenn Matlin 🐝🔥🛡️ (corresponding),
Chandreyi Chakraborty 🐝,
Saehee Eom 🐝,
Mika Okamoto 🐝,
Rayan Castilla 🐝,
Louis Jaburi 🕊️,
Alvin Deng 🕊️,
Taywon Min 🤖🔥,
Lucia Quirke 🕊️,
Stella Biderman 🕊️,
Mark Riedl 🐝.

Affiliation key: 🐝 Georgia Tech · 🔥 MATS · 🕊️ EleutherAI · 🤖 KAIST
AI · 🛡️ Georgia Tech AI Safety Initiative.

Corresponding author: **glenn@gatech.edu**

---

## Citation

See the BibTeX block on the [project site](../public/index.html). Title
and author order there match the paper. If the canonical paper title
diverges (e.g. on arXiv), defer to the paper repo.
