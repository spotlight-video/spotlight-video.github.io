/* Charts: builds all four interactive charts from window.SPOTLIGHT_DATA
   (injected from _data/results.yml). Colors are read from CSS custom
   properties so re-theming the site re-themes the charts automatically.

   Charts: #chartMain (bars, metric toggle), #chartDifficulty (lines, metric
   toggle), #chartComposition (stacked bars), #chartFailures (donut). */
(function () {
  if (typeof Chart === 'undefined' || !window.SPOTLIGHT_DATA) return;
  const D = window.SPOTLIGHT_DATA;

  // --- Theme: pull palette from CSS so it stays in sync with main.css -------
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();
  const PALETTE = {
    qwen: v('--taupe'),
    gemini: v('--sage'),
    qwen_ma: v('--coral'),
    human: v('--gold'),
  };
  const INK = v('--ink');
  const ON_DARK = v('--on-dark');
  const GRID_LIGHT = 'rgba(40,33,20,.08)';
  const GRID_DARK = 'rgba(255,255,255,.10)';
  const FONT = "Inter, system-ui, sans-serif";

  Chart.defaults.font.family = FONT;
  Chart.defaults.font.size = 13;

  const methodOrder = D.methods.map((m) => m.key);
  const methodLabel = Object.fromEntries(D.methods.map((m) => [m.key, m.label]));
  const colorFor = (key) => PALETTE[key] || v('--taupe');

  // Helper: is this canvas on a dark surface?
  const isDark = (canvas) => !!canvas.closest('.chart-card--dark, .section--dark');
  const textColor = (canvas) => (isDark(canvas) ? ON_DARK : INK);
  const gridColor = (canvas) => (isDark(canvas) ? GRID_DARK : GRID_LIGHT);

  // ========================================================================
  // 1. KEY RESULTS — two bar charts (Score and %GT), shown side by side
  // ========================================================================
  function metricById(id) {
    return D.main_results.metrics.find((m) => m.id === id) || D.main_results.metrics[0];
  }
  function makeResultBar(canvasId, metricId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const metric = metricById(metricId);
    const labels = methodOrder.map((k) => methodLabel[k]);
    const data = methodOrder.map((k) => metric.values[k]);
    const colors = methodOrder.map((k) => colorFor(k));
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: metric.label, data, backgroundColor: colors,
          borderRadius: 8, maxBarThickness: 70 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${c.formattedValue}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor(canvas), maxRotation: 0, autoSkip: false, font: { size: 11 } } },
          y: { beginAtZero: true, grid: { color: gridColor(canvas) }, ticks: { color: textColor(canvas) } },
        },
      },
    });
  }
  makeResultBar('chartScore', 'sp');
  makeResultBar('chartGT', 'gt');

  // ========================================================================
  // 3. COMPOSITION — stacked bars (videos by difficulty, stacked by model)
  // ========================================================================
  const compCanvas = document.getElementById('chartComposition');
  if (compCanvas) {
    const levels = D.composition.levels.map((l) => l.level);
    const modelColors = [v('--sage'), v('--gold'), v('--coral')];
    const datasets = D.composition.models.map((model, i) => ({
      label: model,
      data: D.composition.split[model],
      backgroundColor: modelColors[i % modelColors.length],
      borderRadius: 6,
      maxBarThickness: 110,
    }));
    new Chart(compCanvas, {
      type: 'bar',
      data: { labels: levels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor(compCanvas), usePointStyle: true, pointStyle: 'rectRounded' } } },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { color: textColor(compCanvas) } },
          y: { stacked: true, beginAtZero: true, grid: { color: gridColor(compCanvas) }, ticks: { color: textColor(compCanvas) } },
        },
      },
    });
  }

  // ========================================================================
  // 4. FAILURE MODES — donut
  // ========================================================================
  const failCanvas = document.getElementById('chartFailures');
  if (failCanvas) {
    const fm = D.failure_modes;
    const donutColors = [v('--sage'), v('--coral'), v('--gold'), v('--taupe'), '#9aa86f', '#c2b59b'];
    new Chart(failCanvas, {
      type: 'doughnut',
      data: {
        labels: fm.map((f) => f.label),
        datasets: [{ data: fm.map((f) => f.pct), backgroundColor: donutColors, borderColor: v('--bg-alt'), borderWidth: 3 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '58%',
        plugins: {
          legend: { position: 'right', labels: { color: textColor(failCanvas), usePointStyle: true, pointStyle: 'circle', padding: 12 } },
          tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.parsed}%` } },
        },
      },
    });
  }
})();
