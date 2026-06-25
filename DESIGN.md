# Spotlight — Project Website Design

> Design specification for the ECCV 2026 project page for
> **Spotlight: Identifying and Localizing Video Generation Errors Using VLMs**.
> Built with Jekyll, deployed via GitHub Pages at `https://spotlight-video.github.io`.

This document is the plan we agree on **before** implementation. It covers the
visual strategy (modeled on [urbi.ae](https://www.urbi.ae)), the design system,
a section-by-section content map, the interactive chart spec, and the asset
pipeline. Colors/spacing are tokenized so they can be re-themed later by editing
a single file.

---

## 1. Goals & constraints

- **Audience:** ML researchers skimming for the contribution, then arXiv/data/code links.
- **Feel:** premium, modern, editorial — like urbi.ae — but warm and academic, using the paper's own palette.
- **Deploy:** GitHub Pages (Jekyll, no plugins beyond GitHub's allowlist). User/org page → serves at root, **no `baseurl`** needed.
- **Hard limits:** GitHub blocks files >100 MB. The hero `.mov` is 150 MB / 3024×1698 / 120fps → **must be transcoded** (see §7).
- **No build server:** all "interactivity" is client-side JS (charts, gallery, scroll reveals). No Node build step required for Pages.

---

## 2. What we're borrowing from urbi.ae

urbi.ae's design language, distilled into reusable patterns:

| urbi pattern | How we adapt it for Spotlight |
|---|---|
| Persistent slim top nav, logo left, anchor links + a primary CTA right | Sticky nav: `Spotlight` wordmark, anchors (Overview · Taxonomy · Method · Results · Examples · Cite), primary button → **arXiv** |
| Big, confident hero headline + sub + dual CTAs | Paper title + one-line headline, author row, buttons: arXiv / Data / Code |
| Alternating full-width sections with generous whitespace | Each paper section is a full-width band; alternate cream ↔ white(ish) backgrounds to create rhythm |
| Large rounded cards with soft shadows | Taxonomy categories, baseline strategies, stat tiles all use the same rounded-card component |
| Animated stat counters ("65M users") | Headline numbers (600 videos, 1,600+ annotations, 6 categories, 3 levels, 2× human gap) count up on scroll |
| Scroll-reveal (fade/translate up) on section entry | `IntersectionObserver`-driven `.reveal` utility, respects `prefers-reduced-motion` |
| Hover states with arrow affordance on links | Text links gain an animated `→`; cards lift slightly on hover |
| Data-forward imagery (charts, maps) | Our charts ARE the imagery — interactive Chart.js panels instead of static plots |
| Mixed light/dark sections for contrast | One dark "spotlight" band (deep warm charcoal) for the key result / call-to-action, rest light |

**Net:** clean modular vertical scroll, lots of air, rounded cards, soft shadows, a single bold accent, restrained motion. We are copying *structure and polish*, not content or exact colors.

---

## 3. Tech stack

- **Jekyll** (GitHub Pages default). Content in front-matter + Markdown/HTML includes.
- **No CSS framework.** Hand-written CSS with custom properties (design tokens) → easy re-theming. Keeps it light and avoids fighting Bootstrap/Tailwind defaults.
- **Charts:** [Chart.js v4](https://www.chartjs.org/) via CDN — lightweight, dependency-free, good defaults, easy theming, accessible-enough. (D3 considered but overkill for these chart types.)
- **Fonts:** Google Fonts.
  - Display/headings: **Space Grotesk** (geometric, modern, urbi-adjacent).
  - Body/UI: **Inter**.
  - Mono (metrics, BibTeX, code-ish labels): **JetBrains Mono** or system mono.
- **Icons:** inline SVG (no icon-font dependency).
- **JS:** vanilla, in `assets/js/` — no bundler. Modules: `reveal.js`, `counters.js`, `charts.js`, `gallery.js`, `nav.js`.

### Proposed file structure

```
/
├── _config.yml                 # site metadata, paper links, author list
├── index.html                  # single long-scroll page (front-matter + section includes)
├── _data/
│   ├── authors.yml             # name, affiliation, url
│   ├── results.yml             # chart data (S+P, %GT, difficulty, error breakdown)
│   └── taxonomy.yml            # 6 categories: name, group, desc, example
├── _includes/
│   ├── head.html  nav.html  hero.html
│   ├── section-overview.html   taxonomy.html  method.html
│   ├── results.html  examples.html  citation.html  footer.html
├── _layouts/
│   └── default.html
├── assets/
│   ├── css/main.css            # tokens + components
│   ├── js/                     # reveal, counters, charts, gallery, nav
│   ├── img/                    # figures exported from PDFs (PNG/SVG/WebP)
│   └── video/                  # transcoded hero mp4/webm + poster
└── DESIGN.md  PAPER.md  README.md
```

---

## 4. Design system (tokens)

All defined as CSS custom properties in `:root` so re-theming = edit one block.
Palette sampled directly from the paper figures; **mustard/gold leads** (per decision), sage + coral support.

```css
:root{
  /* Warm neutrals / backgrounds */
  --bg:        #F6F3EC;   /* page cream */
  --bg-alt:    #FBFAF6;   /* lighter band for alternating sections */
  --surface:   #FFFFFF;   /* card surface */
  --ink:       #221F1B;   /* warm near-black text */
  --ink-soft:  #5C564E;   /* secondary text */
  --line:      #E4DDD0;   /* hairline borders */

  /* Accents (lead → support) */
  --gold:      #D89B2C;   /* PRIMARY accent — buttons, highlights, key chart series */
  --gold-deep: #A9761A;   /* accessible text/hover on light bg */
  --sage:      #8FA9A6;   /* secondary — from #acc1c0, deepened */
  --coral:     #CE8A80;   /* secondary — from #d6aca6, deepened */
  --taupe:     #C9B8AC;   /* tertiary fills */

  /* Dark "spotlight" band */
  --dark:      #211C16;   /* warm charcoal */
  --dark-soft: #2E2820;

  /* Effects */
  --radius:    18px;
  --shadow:    0 8px 30px rgba(40,33,20,.08);
  --shadow-lg: 0 20px 60px rgba(40,33,20,.12);
  --maxw:      1180px;     /* content max width */
}
```

**Semantic color roles for charts** (consistent everywhere):
`Human → --gold` (the hero/best), `Gemini 2.5 Pro → --sage`,
`Qwen3-8B → --taupe`, `Qwen3-8B MultiAgent → --coral`.
This makes "Human is gold = the bar to beat" read instantly.

**Typography scale:** display 3.5rem / h2 2.25rem / h3 1.4rem / body 1.0625rem,
line-height 1.6 body, generous section padding (`6rem` block on desktop, `3.5rem` mobile).

**Motion:** 200–600ms ease-out, translate-up + fade reveals, counter tween. All gated behind `@media (prefers-reduced-motion: reduce)`.

---

## 5. Page structure & content map

Single long-scroll `index.html`. Sections in order:

### 5.1 Nav (sticky)
Wordmark **Spotlight** • anchors: Overview · Taxonomy · Method · Results · Examples · Cite • primary button **arXiv ↗**. Shrinks/gains shadow on scroll. Mobile: hamburger → slide-down.

### 5.2 Hero
- Eyebrow: `ECCV 2026`.
- Title: **Spotlight: Identifying and Localizing Video Generation Errors Using VLMs**.
- Headline sub (from PAPER.md): a benchmark for evaluating VLMs on **precisely localizing and explaining errors in AI-generated videos** — 1,600+ fine-grained, temporally localized error annotations across 6 categories and 3 difficulty levels.
- Author row: Aditya Chinchure, Sahithya Ravi, Pushkar Shukla, Vered Shwartz, Leonid Sigal (affiliation footnote/markers). Links to author pages from `_data/authors.yml`.
- CTAs: **arXiv** (primary, gold) · **Data (HF)** (outline) · **Code — coming soon** (disabled/muted).
- **Hero video = framed inline player** (decision): rounded, soft-shadowed `<video>` with poster + controls, transcoded teaser. Sits directly under CTAs as the centerpiece (like urbi's hero visual but a deliberate player, not autoplay).

### 5.3 Overview / Abstract + key stats
- Two-column on desktop: left = condensed abstract (full abstract in a "read more" or kept full but tight); right = **stat tiles** that count up on scroll:
  - **600** videos (Veo3 · Seedance · LTX-2)
  - **1,600+** error localizations
  - **6** error categories
  - **3** difficulty levels
  - **~2×** human-over-best-model gap
- Below: the **teaser figure** (`steaser.pdf`) as a wide rounded image — the kangaroo example showing localized errors. Caption explains the local-error annotation idea + the comparison table (Spotlight has Local Errors + Time Segments where others don't).

### 5.4 Taxonomy
- Section intro: "Six error types across three dimensions."
- **Three group headers** (Physics · Semantics · Anatomical), each containing category cards from `_data/taxonomy.yml`:
  1. Physical Violations · 2. Appearance/Disappearance · 3. Motion Artifacts (Physics)
  4. Prompt Adherence · 5. Logical Errors (Semantics)
  6. Body Pose & Anatomy (Anatomical)
- Each card: number badge, title, one-line definition, a small example chip (e.g. *"The white sheet of paper appears out of thin air"*).
- Option to also show the original `taxonomy.pdf` figure beneath as an exportable reference image.

### 5.5 Method / Metric
- **The matching metric** (`DataMetrics.pdf` b): explain pairwise scoring → threshold τ → bipartite matching → M(E,Ê) and M%(E,Ê). Rendered as the figure image + a short stepper (Compute pairwise scores → Apply τ=0.7 → Max bipartite matching) styled as 3 cards with arrows.
- **Baseline strategies** (`baselines.pdf`): three cards — (a) Window-Based, (b) Sequential, (c) Multi-Agent — each with a mini diagram (export panels from the PDF) and a one-line description.
- Dataset composition mini-chart (`DataMetrics.pdf` a): stacked bar of videos by difficulty × model (Veo3/Seedance/LTX-2) — **interactive** (see §6).

### 5.6 Results (the centerpiece — dark "spotlight" band)
Dark warm-charcoal background to make this pop (the one dark section).
- **Headline:** "Humans still outperform the best VLMs by nearly 2×."
- **Interactive grouped bar chart** with a toggle between the two metrics:
  - **Score (S+P) — M(E,Ê):** Qwen3-8B 0.148 · Gemini 2.5 Pro 0.25 · Qwen3-8B MultiAgent 0.254 · **Human 0.508**
  - **%GT (S+P) — M%(E,Ê):** Qwen3-8B 0.08 · Gemini 2.5 Pro 0.126 · Qwen3-8B MultiAgent 0.133 · **Human 0.268**
- Annotated "2× jump" callouts: base→Gemini and MultiAgent→Human (drawn as bracket/arrow overlays or annotated dataset labels).
- **Difficulty trend chart** (`difficulty_errors.pdf` a): line chart, methods over Hard→Med→Easy, for both metrics (toggle). Takeaway caption: "More obvious errors are easier for everyone."

### 5.7 Error analysis
- **Failure-mode breakdown** (from `difficulty_errors.pdf` b + PAPER table) as an **interactive donut/pie**:
  Perception 29% · Hallucination 29% · World Understanding 19% · Subtle Mistakes 14% · Language Prior 6% · Other 5% (Gemini 2.5 Pro). Hover → segment detail.
- Three short "diagnosis" callout cards (from PAPER.md):
  - *Faulty perception* — can't compare frames, misses what's visibly there.
  - *Wrong world knowledge* — bad intuition for physical plausibility.
  - *Localization failure* — open-source models flag the whole clip.

### 5.8 Qualitative examples + interactive gallery (placeholder)
- The qualitative figure (`quali.pdf`) shown as a rounded wide image with caption.
- **Interactive "Browse examples" gallery** (decision: scaffold with placeholders): a filmstrip/grid of clip thumbnails; clicking opens a lightbox with the video + its error annotations on a timeline (error chips colored by category, with timestamps like `2.5s–5.0s`). Data shape designed now in `_data/examples.yml`; we ship placeholder entries you fill in later. Built to gracefully show "examples coming soon" if empty.

### 5.9 Citation
- BibTeX block in a mono card with a **Copy** button.
- Links restated: arXiv · Data (HF `UBC-ViL`) · Code (coming soon).

### 5.10 Footer
Authors' institution(s), ECCV 2026, contact, repo link, copyright. Subtle.

---

## 6. Interactive charts spec (Chart.js)

All chart data lives in `_data/results.yml` → injected into a JS config block, so updating numbers never touches JS. Shared theme (fonts, gold/sage/coral/taupe series colors, grid color, tooltip styling) defined once in `charts.js`.

1. **Main results — grouped bars w/ metric toggle.** Two datasets (M and M%); a segmented toggle swaps the active dataset with an animated transition. Human bar uses `--gold`; annotation plugin draws the "≈2×" brackets. Tooltips show exact values.
2. **Difficulty trend — multi-line.** x = Hard/Med/Easy, one line per method, metric toggle shared with (1). Markers + soft area under Human line.
3. **Dataset composition — stacked bars.** Videos by difficulty, stacked by model; legend toggles series.
4. **Failure modes — donut.** 6 segments, center label shows hovered category + %. Click filters/links to the matching diagnosis card.
- **Accessibility:** every chart has a visually-hidden data table fallback + `aria-label`; colors paired with patterns/labels so they're not the only signal. Charts re-render on theme change (future-proofing re-theming).
- **Mobile:** charts go full-width, legends wrap, toggles become full-width segmented controls.

---

## 7. Asset pipeline

**Figures (PDF → web):** export each figure to PNG (and WebP for size) at ~2× for retina; keep an SVG where vector matters (taxonomy/baselines diagrams) if export is clean. Store in `assets/img/`. Originals stay in `assets/` (or move to `assets/pdf/`). Per-panel crops needed for: baseline strategies (3 panels) and the metric figure (b).

**Hero video (required transcode):** `SpotlightVideo.mov` (3024×1698, 120fps, 150 MB) → web deliverables:
```
ffmpeg -i SpotlightVideo.mov -vf "scale=1920:-2,fps=30" -c:v libx264 \
  -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 128k assets/video/spotlight.mp4
# optional smaller VP9/webm + a poster frame:
ffmpeg -i SpotlightVideo.mov -ss 1 -vframes 1 -vf "scale=1920:-2" assets/video/poster.jpg
```
Target ~8–20 MB mp4 (well under 100 MB, committable). `+faststart` enables progressive playback. Provide `poster.jpg`. **Keep the 150 MB `.mov` out of git** — add to `.gitignore`; it's the master, not a web asset.

**`.gitignore`:** `.DS_Store`, `assets/SpotlightVideo.mov`, `_site/`, `.jekyll-cache/`.

---

## 8. Responsive & a11y

- Breakpoints: ≥1024 (desktop multi-col), 640–1024 (tablet, 2-col → 1-col), <640 (mobile single column).
- Semantic landmarks (`header/nav/main/section/footer`), one `h1` (paper title), logical heading order.
- Color contrast: body text on cream ≥ AA; gold used for fills + paired with `--gold-deep` for text.
- Keyboard: nav, toggles, gallery lightbox all focusable + ESC-to-close; visible focus rings.
- `prefers-reduced-motion` disables reveals/counters/chart animation.
- `<video>` muted-by-default, captions if available later.

---

## 9. Build order (after this doc is approved)

1. Scaffold Jekyll: `_config.yml`, layout, `main.css` tokens, nav + hero shell.
2. Transcode video; export figures to `assets/img/`.
3. Populate `_data/*.yml` (authors, taxonomy, results, examples placeholders).
4. Build sections top→bottom (hero → overview/stats → taxonomy → method → results → analysis → examples → citation → footer).
5. Wire JS: reveal, counters, charts, gallery, nav, copy-bibtex.
6. Responsive pass + a11y pass + reduced-motion.
7. `README.md` with local run (`bundle exec jekyll serve`) + deploy notes; enable Pages on `main`.

---

## 10. Open items / things to confirm

- **BibTeX:** need the exact citation (arXiv gives a placeholder; we'll use the arXiv 2511.18102 entry until the ECCV proceedings entry exists).
- **Author links & affiliations:** confirm per-author URLs and affiliation markers for the author row.
- **Gallery content:** placeholders now; you'll later supply clip files + per-clip error annotations (category, start/end timestamps, text).
- **Code link:** "coming soon" until the repo is public.
- **Favicon / social preview (OG image):** suggest generating a branded card (title + teaser frame) for nice link unfurls — confirm if wanted.
