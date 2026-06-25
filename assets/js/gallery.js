/* Gallery: opens a lightbox for each example clip, rendering the video (or a
   placeholder) plus a color-coded error timeline and annotation list.
   Clip data comes from the gcard button's data-* attributes (see examples.html). */
(function () {
  const gallery = document.getElementById('gallery');
  const lb = document.getElementById('lightbox');
  if (!gallery || !lb) return;

  const media = document.getElementById('lbMedia');
  const modelEl = document.getElementById('lbModel');
  const promptEl = document.getElementById('lbPrompt');
  const timeline = document.getElementById('lbTimeline');
  const errList = document.getElementById('lbErrors');

  // Map an error category to a taxonomy dimension -> color suffix.
  const CATEGORY_GROUP = {
    'Physical Violations': 'sage',
    'Appearance / Disappearance': 'sage',
    'Motion Artifacts': 'sage',
    'Prompt Adherence': 'gold',
    'Logical Errors': 'gold',
    'Body Pose & Anatomy': 'coral',
  };
  const groupOf = (cat) => CATEGORY_GROUP[cat] || 'gold';

  function open(card) {
    const { prompt, model, video, poster, duration } = card.dataset;
    const dur = parseFloat(duration) || 10;
    let errors = [];
    try { errors = JSON.parse(card.dataset.errors || '[]'); } catch (e) { errors = []; }

    modelEl.textContent = model || '';
    promptEl.textContent = prompt || '';

    // Media: real video if provided, else a labelled placeholder using the poster.
    if (video) {
      media.innerHTML =
        `<video controls autoplay playsinline poster="${poster}"><source src="${video}" type="video/mp4"></video>`;
    } else {
      media.innerHTML =
        `<div class="placeholder" style="background-image:url('${poster}');background-size:cover;background-position:center">` +
        `<span style="background:rgba(0,0,0,.55);padding:.5rem 1rem;border-radius:8px">Clip coming soon</span></div>`;
    }

    // Timeline segments positioned by start/end over the clip duration.
    timeline.innerHTML = errors
      .map((e) => {
        const left = Math.max(0, (e.start / dur) * 100);
        const width = Math.max(2, ((e.end - e.start) / dur) * 100);
        return `<span class="timeline__seg seg-${groupOf(e.category)}" style="left:${left}%;width:${width}%" title="${e.category}"></span>`;
      })
      .join('');

    // Error annotation list.
    errList.innerHTML = errors
      .map((e) => {
        const g = groupOf(e.category);
        return (
          `<li><span class="err__time">${e.start}–${e.end}s</span>` +
          `<div><span class="err__cat cat-${g}">${e.category}</span>` +
          `<p class="err__text">${e.text}</p></div></li>`
        );
      })
      .join('');

    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.hidden = true;
    media.innerHTML = ''; // stop any playing video
    document.body.style.overflow = '';
  }

  gallery.querySelectorAll('.gcard').forEach((card) =>
    card.addEventListener('click', () => open(card))
  );
  lb.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lb.hidden) close();
  });
})();
