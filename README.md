# Capability Provenance in Language Models

Project website for **"Capability Provenance in Language Models: A Case Study in Social Reasoning"**.

- Website: <https://eilab.gatech.edu/social-data-attribution/>
- Paper: <https://arxiv.org/abs/2606.19625>
- PDF: <https://arxiv.org/pdf/2606.19625>

This repository currently contains the public project page only. Audited code and artifacts will be added after the public release review.

## Run locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Structure

- `public/` - the single-page project site (`index.html`, CSS, JS, figures).
- `press/` - outreach copy: BLUF/TLDR and tweet-thread drafts.
- `docs/` - design notes and context for the site build.
- `.github/workflows/pages.yml` - GitHub Pages deployment workflow.

Website adapted from the FLaME project-page template and licensed under CC BY-SA 4.0; see `LICENSE-website.md`.
