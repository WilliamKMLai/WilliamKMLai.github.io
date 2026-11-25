# Lai Lab Website — University at Buffalo

Official website for **The Lai Lab** (Principal Investigator: **William KM Lai, PhD**), Department of Biochemistry, Jacobs School of Medicine and Biomedical Sciences, **University at Buffalo (SUNY)**.

Live site: [https://williamkmlai.github.io/](https://williamkmlai.github.io/)

## Architecture & Data Files

Built with [Jekyll](https://jekyllrb.com/) (`jekyll-sitemap`), modular SCSS (`_sass/`), and structured YAML data catalogs (`_data/`) for single-source maintenance:

- `_config.yml` — Lab metadata, UB contact details, ORCID, Google Scholar, and GitHub organization links
- `_data/navigation.yml` — Primary top-level navigation links
- `_data/publications.yml` — Complete bibliography powering `publications.html`, `index.html`, `research.html`, and `software.html`
- `_data/research_thrusts.yml` — Research thrusts, vector diagrams, and highlighted publications for `research.html`
- `_data/software.yml` — Open-source tools, containers, and FAIR science gateways for `software.html` and `index.html`
- `_layouts/default.html`, `_includes/`, `_sass/` — Accessible responsive layout, header/footer landmarks, and system-aware UB Blue light/dark theme

## Local Development

1. Install Ruby and Bundler dependencies:
   ```bash
   bundle install
   ```
2. Build and preview locally:
   ```bash
   bundle exec jekyll serve
   ```
   Then open `http://localhost:4000/` in your browser.

## Deployment

Pushes or merges to the `main` branch automatically build and publish to GitHub Pages at `https://williamkmlai.github.io/`.
