/* Copy: copies the BibTeX block to the clipboard and confirms briefly. */
(function () {
  const btn = document.getElementById('copyBibtex');
  const pre = document.getElementById('bibtex');
  if (!btn || !pre) return;

  const labelEl = btn.querySelector('span');
  const original = labelEl ? labelEl.textContent : 'Copy';

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pre.innerText);
      if (labelEl) labelEl.textContent = 'Copied!';
      setTimeout(() => { if (labelEl) labelEl.textContent = original; }, 1600);
    } catch (e) {
      // Fallback for older browsers / non-secure contexts.
      const r = document.createRange();
      r.selectNode(pre);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      try { document.execCommand('copy'); } catch (_) {}
      sel.removeAllRanges();
    }
  });
})();
