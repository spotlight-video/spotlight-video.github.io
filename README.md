# Spotlight — project website

Project page for **Spotlight: Identifying and Localizing Video Generation Errors
Using VLMs** (ECCV 2026). Static [Jekyll](https://jekyllrb.com/) site, deployed on
GitHub Pages at <https://spotlight-video.github.io>.

The site is intentionally lightweight: no CSS framework and no JS bundler. The
only runtime dependency is **Chart.js** (loaded from a CDN) for the interactive
charts. Everything else is hand-written HTML/CSS/vanilla JS.

---

## Editing content (no code needed)

Most changes are data edits — you rarely need to touch HTML/CSS/JS:

| To change… | Edit |
|---|---|
| Title, tagline, conference, links (arXiv/data/code), SEO | [`_config.yml`](_config.yml) |
| Authors & affiliations (byline) | [`_data/authors.yml`](_data/authors.yml) |
| Chart numbers, stat tiles | [`_data/results.yml`](_data/results.yml) |
| Taxonomy categories & examples | [`_data/taxonomy.yml`](_data/taxonomy.yml) |
| Example gallery clips & annotations | [`_data/examples.yml`](_data/examples.yml) |
| BibTeX | [`_includes/citation.html`](_includes/citation.html) |

> A link set to `""` in `_config.yml` (e.g. `code:`) automatically renders as a
> disabled **"coming soon"** button.

### Section text / order
Each page section is its own file in [`_includes/`](_includes/). To reorder or
remove sections, edit the include list in [`index.html`](index.html).

---

## Project structure

```
_config.yml            Site metadata + external links (edit me first)
index.html             Section order (one include per section)
_layouts/default.html  Page shell; loads CSS, Chart.js, and site JS
_data/                 All editable content/data (authors, results, taxonomy, examples)
_includes/             One file per section + head/nav/footer/icon
assets/
  css/main.css         Design system. Tokens at the top (:root) — change colors here
  js/                  nav · reveal · counters · charts · gallery · copy (vanilla)
  img/                 Figures exported from the paper PDFs
  video/               Web-optimized hero video + poster
  pdf/                 Source figure PDFs (paper PDF is git-ignored)
```

### Theming / colors
All colors, spacing, radii, shadows, and fonts are CSS custom properties in the
`:root` block at the top of [`assets/css/main.css`](assets/css/main.css). Change
them there and the whole site — **including the charts** — updates, because
`charts.js` reads the palette from these variables at runtime. Mustard/gold is
the lead accent; sage and coral are the supporting colors (sampled from the
paper figures).

Chart series have fixed semantic colors: **Human = gold** (the bar to beat),
Gemini = sage, Qwen3-8B = taupe, Qwen3-8B MultiAgent = coral.

---

## Assets pipeline

Figures and the hero video are generated from the originals in `assets/`.
Re-run these if the source files change (requires `poppler` and `ffmpeg`,
e.g. `brew install poppler ffmpeg`):

```bash
# Figures: PDF -> PNG
for f in steaser taxonomy DataMetrics baselines quali difficulty_errors; do
  pdftoppm -png -r 160 -f 1 -l 1 "assets/pdf/$f.pdf" "assets/img/$f"
  mv "assets/img/$f-1.png" "assets/img/$f.png"
done

# Hero video: 1080p / 30fps / faststart mp4 (+ poster frame)
ffmpeg -i assets/SpotlightVideo.mov -vf "scale=1920:-2,fps=30" -c:v libx264 \
  -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart -an \
  assets/video/spotlight.mp4
ffmpeg -ss 2 -i assets/SpotlightVideo.mov -vframes 1 -vf "scale=1920:-2" \
  assets/video/poster.jpg
```

> The 150 MB source `SpotlightVideo.mov` and the full paper PDF are **git-ignored**
> (over GitHub's file limits / not needed on the web). Keep them locally as masters.

---

## Run locally

```bash
bundle install
bundle exec jekyll serve --livereload
# open http://localhost:4000
```

## Deploy (GitHub Pages)

The repo is named `spotlight-video.github.io`, so GitHub Pages serves it at the
root automatically. To enable: **Settings → Pages → Build and deployment →
Source: Deploy from a branch → `main` / `(root)`**. Pushing to `main` rebuilds
and publishes within ~1 minute.

---

## Adding real example clips

In [`_data/examples.yml`](_data/examples.yml), per clip set `video:` to a file in
`assets/video/` (web-optimized mp4, same ffmpeg recipe as above) and `poster:` to
a thumbnail in `assets/img/`. Each error needs `start`, `end`, `category` (one of
the six taxonomy titles), and `text`. The category drives the timeline/chip color.
