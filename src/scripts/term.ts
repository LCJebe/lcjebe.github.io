// Mounts every <span class="term" data-phrases data-prompt> on the page:
// types each phrase, holds, deletes, advances. Single shared engine.

const TYPE_MS   = 70;    // per char while typing
const DELETE_MS = 38;    // per char while deleting
const HOLD_MS   = 1500;  // pause when phrase is fully typed
const EMPTY_MS  = 320;   // pause between phrases

export function mountTerminals(root: ParentNode = document) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.querySelectorAll<HTMLElement>('.term[data-phrases]').forEach((el) => {
    let phrases: string[] = [];
    try { phrases = JSON.parse(el.dataset.phrases || '[]'); } catch { return; }
    if (!phrases.length) return;

    const prompt = el.dataset.prompt ?? '';
    el.innerHTML = '';

    if (prompt) {
      const p = document.createElement('span');
      p.className = 'prompt';
      p.textContent = prompt;
      el.appendChild(p);
    }
    const text = document.createElement('span');
    text.className = 'text';
    el.appendChild(text);
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    el.appendChild(cursor);

    if (reduced) {
      text.textContent = phrases[0];
      return;
    }

    let pi = 0;
    let ci = 0;
    let mode: 'typing' | 'holding' | 'deleting' | 'empty' = 'typing';

    function step() {
      const phrase = phrases[pi];
      if (mode === 'typing') {
        ci++;
        text.textContent = phrase.slice(0, ci);
        if (ci >= phrase.length) { mode = 'holding'; setTimeout(step, HOLD_MS); }
        else setTimeout(step, TYPE_MS);
      } else if (mode === 'holding') {
        mode = 'deleting'; setTimeout(step, DELETE_MS);
      } else if (mode === 'deleting') {
        ci--;
        text.textContent = phrase.slice(0, ci);
        if (ci <= 0) { mode = 'empty'; setTimeout(step, EMPTY_MS); }
        else setTimeout(step, DELETE_MS);
      } else {
        pi = (pi + 1) % phrases.length;
        ci = 0; mode = 'typing'; setTimeout(step, TYPE_MS);
      }
    }
    setTimeout(step, 400);
  });
}
