/* Keep character lettering outside the catalog's scrolling clip. */
(() => {
  'use strict';
  const app = document.querySelector('#app');
  const labels = new Map();
  let pending = false;
  const resize = new ResizeObserver(schedule);
  resize.observe(app);

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(update);
  }

  function update() {
    pending = false;
    for (const [button, layer] of labels) {
      if (!button.isConnected) {
        resize.unobserve(button);
        layer.remove();
        labels.delete(button);
      }
    }
    for (const button of app.querySelectorAll('.orbit-button')) {
      if (labels.has(button)) continue;
      const label = button.querySelector('.orbit-label');
      if (!label) continue;
      const layer = document.createElement('div');
      layer.className = 'orbit-label-layer';
      layer.setAttribute('aria-hidden', 'true');
      layer.append(label);
      document.body.append(layer);
      labels.set(button, layer);
      resize.observe(button);
    }
    for (const [button, layer] of labels) {
      const box = button.getBoundingClientRect();
      const list = button.closest('.list').getBoundingClientRect();
      // A partly visible circle keeps its entire name; fully scrolled-out
      // circles must not leave stray lettering floating over the page.
      layer.hidden = box.bottom <= Math.max(0, list.top) ||
        box.top >= Math.min(innerHeight, list.bottom) ||
        box.right <= Math.max(0, list.left) ||
        box.left >= Math.min(innerWidth, list.right);
      Object.assign(layer.style, {
        left: `${box.left}px`, top: `${box.top}px`,
        width: `${box.width}px`, height: `${box.height}px`,
        color: getComputedStyle(button).color
      });
      layer.dataset.playing = button.dataset.playing;
      layer.dataset.hover = String(button.matches(':hover'));
    }
  }

  new MutationObserver(schedule).observe(app, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ['data-playing']
  });
  new MutationObserver(schedule).observe(document.documentElement, {
    attributes: true, attributeFilter: ['style']
  });
  document.addEventListener('scroll', schedule, {capture: true, passive: true});
  document.addEventListener('pointerover', schedule, {passive: true});
  document.addEventListener('pointerout', schedule, {passive: true});
  window.addEventListener('resize', schedule, {passive: true});
  window.visualViewport?.addEventListener('resize', schedule, {passive: true});
  window.visualViewport?.addEventListener('scroll', schedule, {passive: true});
  document.fonts.ready.then(schedule);
  schedule();
})();
