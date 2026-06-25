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

  const pct = (x) => (x <= 1 ? Math.round(x * 1000) / 10 + '' : x + '');

  // ========================================================================
  // 1. MAIN RESULTS — bar chart with metric toggle
  // ========================================================================
  const mainCanvas = document.getElementById('chartMain');
  let mainChart;
  function metricById(id) {
    return D.main_results.metrics.find((m) => m.id === id) || D.main_results.metrics[0];
  }
  function buildMain(metricId) {
    const metric = metricById(metricId);
    const labels = methodOrder.map((k) => methodLabel[k]);
    const data = methodOrder.map((k) => metric.values[k]);
    const colors = methodOrder.map((k) => colorFor(k));
    return { metric, labels, data, colors };
  }
  if (mainCanvas) {
    const { metric, labels, data, colors } = buildMain('sp');
    mainChart = new Chart(mainCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: metric.label, data, backgroundColor: colors,
          borderRadius: 8, maxBarThickness: 90 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${c.formattedValue}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor(mainCanvas) } },
          y: { beginAtZero: true, grid: { color: gridColor(mainCanvas) },
               ticks: { color: textColor(mainCanvas) } },
        },
      },
    });
  }

  // ========================================================================
  // 2. DIFFICULTY — multi-line chart with metric toggle
  // ========================================================================
  const diffCanvas = document.getElementById('chartDifficulty');
  let diffChart;
  function buildDiffDatasets(metricId) {
    const series = D.difficulty.series[metricId];
    return methodOrder.map((k) => ({
      label: methodLabel[k],
      data: series[k],
      borderColor: colorFor(k),
      backgroundColor: colorFor(k),
      borderWidth: k === 'human' ? 3 : 2,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false,
    }));
  }
  if (diffCanvas) {
    diffChart = new Chart(diffCanvas, {
      type: 'line',
      data: { labels: D.difficulty.levels, datasets: buildDiffDatasets('sp') },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor(diffCanvas), usePointStyle: true, pointStyle: 'circle' } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor(diffCanvas) } },
          y: { beginAtZero: true, grid: { color: gridColor(diffCanvas) }, ticks: { color: textColor(diffCanvas) } },
        },
      },
    });
  }

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

  // ========================================================================
  // Metric toggles — buttons with [data-target=main|diff] and [data-metric]
  // ========================================================================
  document.querySelectorAll('.toggle__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const metricId = btn.dataset.metric;

      // active state within this toggle group
      btn.parentElement.querySelectorAll('.toggle__btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      if (target === 'main' && mainChart) {
        const { metric, data, colors } = buildMain(metricId);
        mainChart.data.datasets[0].data = data;
        mainChart.data.datasets[0].backgroundColor = colors;
        mainChart.data.datasets[0].label = metric.label;
        mainChart.update();
        const f = document.getElementById('mainFormula');
        if (f) f.textContent = metric.formula;
      }
      if (target === 'diff' && diffChart) {
        const next = buildDiffDatasets(metricId);
        diffChart.data.datasets.forEach((ds, i) => { ds.data = next[i].data; });
        diffChart.update();
      }
    });
  });
})();
