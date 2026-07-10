/* Capability Provenance animation data module.
   Single runtime copy of scientific values, transcribed from
   docs/research-animations/agent-handoff/data/socialtda_claims.yaml.

   Source-of-truth policy: the latest submission PDF or an explicitly supplied
   artifact supersedes this file. Do NOT edit values here unless a source
   PDF/artifact is added to the repo or a maintainer supplies updated values.
   Scene modules must import values from here, never hard-code them. */

export const SOURCE = {
  file: "docs/research-animations/agent-handoff/data/socialtda_claims.yaml",
  status: "transcribed starter data (no local source PDF in repo yet)",
  setting: "OLMo3-7B / Dolma3, stratified working set"
};

export const PROJECT = {
  title: "Capability Provenance in Language Models: A Case Study in Social Reasoning",
  shortName: "Capability Provenance",
  publicUrl: "eilab.gatech.edu/social-data-attribution"
};

export const TAXONOMY = { topics: 24, formats: 24, bins: 576 };

export const WORKING_SET = {
  documents: 5678621,
  tokensApprox: "10.5B",
  targetDocsPerBin: 10000
};

/* Benchmark order matches the paper's 2x2 contrastive design and the
   selected-bins panel below. `key` indexes the per-bin value maps. */
export const BENCHMARKS = [
  { key: "socialiqa", name: "SocialIQA", short: "SocialIQA", domain: "social", capability: "reasoning" },
  { key: "mmlu_social_sciences", name: "MMLU Social Sciences", short: "MMLU Soc. Sci.", domain: "social", capability: "knowledge" },
  { key: "arc_challenge", name: "ARC-Challenge", short: "ARC-Challenge", domain: "STEM", capability: "reasoning" },
  { key: "mmlu_stem", name: "MMLU STEM", short: "MMLU STEM", domain: "STEM", capability: "knowledge" }
];

export const INFLUENCE_METRIC = {
  name: "signed influence, within-benchmark z-score",
  positive: "supportive: bin gradients align with benchmark query gradients",
  negative: "suppressive / contrasting: bin gradients oppose benchmark query gradients",
  nearZero: "weak or neutral influence under this metric"
};

/* influence_values.selected_bins_panel — signed within-benchmark z-scores. */
export const SELECTED_BINS_PANEL = [
  {
    bin: "Literature × Customer Support",
    values: { socialiqa: 16.0, mmlu_social_sciences: -7.31, arc_challenge: -0.45, mmlu_stem: -5.75 }
  },
  {
    bin: "Social Life × Q&A Forum",
    values: { socialiqa: 1.9, mmlu_social_sciences: -0.06, arc_challenge: -0.78, mmlu_stem: -0.46 }
  },
  {
    bin: "Home & Hobbies × Creative Writing",
    values: { socialiqa: 1.29, mmlu_social_sciences: -0.63, arc_challenge: -0.34, mmlu_stem: -0.12 }
  },
  {
    bin: "Politics × Documentation",
    values: { socialiqa: 0.41, mmlu_social_sciences: 6.86, arc_challenge: 1.59, mmlu_stem: 5.56 }
  }
];

/* SocialIQA's extreme positive bin: +16.0 on SocialIQA, flips negative for
   both MMLU benchmarks, near flat for ARC-Challenge. */
export const SIGNATURE_BIN = SELECTED_BINS_PANEL[0];

/* lexical — SocialIQA's top-influence bins split between interactional and
   expository formats; profile of the signature interactional bin; and the
   interactional-minus-expository contrast (deltas are social − expository). */
export const LEXICAL = {
  socialiqaTop20: {
    bins: 20,
    interactional: 10,
    expository: 10,
    note: "10/10 split between interactional formats (dialogic + personal) and expository/structured formats"
  },
  literatureCustomerSupportProfile: {
    docs: 10000,
    meanWords: 245,
    firstPersonPer1k: 26.89,
    secondPersonPer1k: 33.39,
    thirdPersonPer1k: 9.2,
    mentalStatePer1k: 6.22,
    dialogueZ: 2.38,
    socialZ: 1.82,
    affectZ: 0.13
  },
  socialVsExpositoryContrast: {
    meanWordsPerDocDelta: -1558,
    mentalStatePer1kDelta: 2.82,
    dialogueZDelta: 0.61,
    socialZDelta: 0.7,
    affectZDelta: 0.71
  }
};

/* unlearning.paired_influence_vs_random — paired difference in accuracy
   damage between influence-targeted and random in-topic forget sets:
   d = γ(targeted) − γ(random), where γ = A_baseline − A_unlearned (positive
   γ means accuracy damage; positive d means targeted damages more).
   `wilcoxonPBH` values keep the YAML's own form (string or number).
   `key` indexes BENCHMARKS. */
export const UNLEARNING = {
  gammaDefinition: "γ = A_baseline − A_unlearned; positive values mean accuracy damage",
  pairedInfluenceVsRandom: [
    {
      key: "socialiqa", n: 72, medianD: 0.016, ci: [0.013, 0.022],
      wilcoxonPBH: "1.0e-5", pairedTPBH: 0.022, cohensDzPooled: 0.39,
      verdict: "clean paired result"
    },
    {
      key: "mmlu_stem", n: 72, medianD: 0.002, ci: [-0.0003, 0.0055],
      wilcoxonPBH: 0.028, pairedTPBH: 0.227, cohensDzPooled: 0.23,
      verdict: "weaker evidence; CI crosses zero"
    },
    {
      key: "mmlu_social_sciences", n: 72, medianD: 0.0017, ci: [-0.0018, 0.0042],
      wilcoxonPBH: 0.227,
      verdict: "not significant"
    },
    {
      key: "arc_challenge", n: 72, medianD: -0.0026, ci: [-0.0043, -0.0009],
      wilcoxonPBH: ">0.99",
      verdict: "reversed/noise-floor; influence-targeted slightly less damaging than random"
    }
  ]
};

/* Cross-model comparison. Each model carries the three headline metrics the
   "Results across models" section re-runs against the OLMo3 baseline:
     - socialiqaCorrelation: r-range of SocialIQA's 576-bin profile against the
       three comparison benchmarks (low = outlier signature).
     - signatureBin: signed z-scores of the model's extreme SocialIQA-positive
       bin across the four benchmarks (the sign-flip result).
     - socialiqaUnlearning: paired influence-minus-random damage on SocialIQA,
       in accuracy points (medianD * 100) with the Wilcoxon p_BH.
   Models with status "pending" render an honest placeholder; never fabricate.
   When Comma/DCLM results land, fill their objects and the table re-renders
   with no IA change. Comparison metric set is provisional until results land. */
export const MODELS = [
  {
    key: "olmo3",
    name: "OLMo3-7B",
    corpus: "Dolma3",
    status: "done",
    socialiqaCorrelation: { range: [0.06, 0.22], note: "vs the other three tasks (r = 0.53\u20130.86 among themselves)" },
    signatureBin: {
      label: "Literature \u00d7 Customer Support",
      values: { socialiqa: 16.0, mmlu_social_sciences: -7.31, arc_challenge: -0.45, mmlu_stem: -5.75 }
    },
    socialiqaUnlearning: { pp: 1.60, wilcoxonPBH: "1.0e-5" }
  },
  {
    key: "comma7b",
    name: "Comma 7B",
    corpus: "DCLM-Baseline",
    status: "pending"
  },
  {
    key: "dclm7b",
    name: "DCLM 7B",
    corpus: "DCLM",
    status: "pending"
  }
];
