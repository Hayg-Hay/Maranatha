// A temporary reading presentation: no storage, rerendering or fullscreen API.
(() => {
  'use strict';
  const button = document.querySelector('#reader-focus-toggle');
  const hint = document.querySelector('#reader-focus-hint');
  let active = false;
  function setFocus(value) {
    active = value;
    document.documentElement.classList.toggle('reader-focus', active);
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? 'Exit reader focus' : 'Enter reader focus';
    hint.hidden = !active;
    button.focus({ preventScroll: true });
    button.scrollIntoView({ block: 'nearest' });
  }
  button.disabled = false;
  button.addEventListener('click', () => setFocus(!active));
  document.addEventListener('keydown', event => {
    if (active && event.key === 'Escape' && !event.defaultPrevented && !event.isComposing) {
      event.preventDefault(); setFocus(false);
    }
  });
})();
