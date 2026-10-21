// Emit a local, dependency-free browser measurement page from real app cards.
import fs from 'node:fs';
import path from 'node:path';

// Set the equal-width baseline before reading ANY comparison geometry: changing
// a flex sibling's width can move the chip card horizontally or onto a new row.
export function measureGrammarChipCard(baseline, chipCard, readStyle = getComputedStyle) {
  baseline.style.width = chipCard.getBoundingClientRect().width + 'px';
  const c = chipCard.getBoundingClientRect();
  const b = baseline.getBoundingClientRect();
  const chip = chipCard.querySelector('.iw-case-chip');
  const caret = chipCard.querySelector('.iw-grammar-footer .iw-caret, .iw-grammar-caret');
  const x = chip.getBoundingClientRect(), y = caret.getBoundingClientRect();
  const style = readStyle(chipCard);
  const left = c.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
  const right = c.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
  const issues = [];
  if (x.left < left - 1 || x.right > right + 1) issues.push('chip outside card content');
  if (y.left < left - 1 || y.right > right + 1) issues.push('caret outside card content');
  if (x.right > y.left + 1) issues.push('chip and caret overlap');
  if (!(x.top < y.bottom && y.top < x.bottom)) issues.push('chip and caret on different rows');
  if (chip.scrollWidth > chip.clientWidth + 1) issues.push('chip text clipped');
  const round = n => Math.round(n * 100) / 100;
  return {width:round(c.width), baselineHeight:round(b.height), chipHeight:round(c.height), heightDelta:round(c.height-b.height), fits:issues.length === 0, issues};
}

export function writeGrammarChipFixture(output, samples) {
  const data = JSON.stringify(samples).replaceAll('<', '\\u003c');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Grammar chip layout measurements</title><link rel="stylesheet" href="../../style.css">
<style>
main { margin: 16px; max-width: 1100px; }
.fixture-pair { display:flex; flex-wrap:wrap; align-items:flex-start; gap:8px; margin:10px 0 18px; }
.fixture-host { display:flex; flex-direction:column; align-items:flex-start; gap:4px; }
.fixture-host > small { font-size:11px; }
.fixture-host > .iw { width:4.5rem; }
.fixture-summary { overflow-x:auto; }
table { border-collapse:collapse; font-size:13px; } td,th { border:1px solid var(--line); padding:4px 6px; text-align:left; }
pre { white-space:pre-wrap; font-size:12px; }
</style></head><body><main>
<h1>Compact grammar chips: minimum-width check</h1>
<p>These are captured real cards from both Greek interlinears and both modes.
Each card is requested at 4.5rem width; two-case cards reserve 6.5rem and
three-case cards 8rem. The baseline removes only the supplemental UI and uses
the same width as its chip card to avoid changes caused by gloss wrapping.
Measurements compare collapsed cards, in CSS pixels. They are calculated by
your browser, not by jsdom. This static fixture does not test expandable-button interaction.</p>
<label>Text size <select id="size"><option value="16">16px</option><option value="18">18px</option><option value="20">20px</option><option value="23">23px</option></select></label>
<p>Resize to a narrow/mobile window, try each text size, and copy the report below.
A positive height delta means the chip makes that card taller than its baseline.</p>
<p id="status" role="status">Waiting for fonts and browser measurements…</p>
<small>Checker revision 2: positions are read after equalizing baseline widths.</small>
<div class="fixture-summary"><table><thead><tr><th>Card</th><th>Width</th><th>Baseline height</th><th>Chip height</th><th>Δ height</th><th>Fits</th></tr></thead><tbody id="measurements"></tbody></table></div>
<pre id="report"></pre><div id="samples"></div>
</main><script>
const samples = ${data};
const pairs = [];
function uniqueIds(card, suffix) {
  const mapping = new Map();
  for (const el of [card, ...card.querySelectorAll('[id]')]) if (el.id) { mapping.set(el.id, el.id + suffix); el.id += suffix; }
  for (const el of [card, ...card.querySelectorAll('[aria-describedby]')]) {
    const id = el.getAttribute('aria-describedby'); if (id && mapping.has(id)) el.setAttribute('aria-describedby', mapping.get(id));
  }
}
samples.forEach((sample, i) => {
  const template = document.createElement('template'); template.innerHTML = sample.html;
  const chipCard = template.content.firstElementChild;
  const baseline = chipCard.cloneNode(true);
  const caret = baseline.querySelector('.iw-grammar-footer .iw-caret');
  if (caret) baseline.appendChild(caret);
  baseline.querySelector('.iw-grammar-footer')?.remove();
  baseline.querySelector('.iw-grammar-disclosure')?.remove();
  baseline.querySelector('[id$="grammar-description"]')?.remove();
  baseline.removeAttribute('aria-describedby');
  baseline.removeAttribute('aria-controls'); chipCard.removeAttribute('aria-controls');
  baseline.classList.remove('iw-has-case-chip', 'iw-case-count-1', 'iw-case-count-2', 'iw-case-count-3');
  uniqueIds(baseline, '-baseline-' + i); uniqueIds(chipCard, '-chip-' + i);
  const heading = document.createElement('h2'); heading.textContent = sample.label;
  const pair = document.createElement('div'); pair.className = 'fixture-pair';
  for (const [label, card] of [['Without supplemental UI', baseline], ['Compact chip', chipCard]]) {
    const host = document.createElement('div'); host.className = 'fixture-host';
    const caption = document.createElement('small'); caption.textContent = label;
    host.append(caption, card); pair.appendChild(host);
  }
  document.getElementById('samples').append(heading, pair);
  pairs.push({label:sample.label, baseline, chipCard});
});
${measureGrammarChipCard.toString()}
function measure() {
  const rows = pairs.map(({label, baseline, chipCard}) => ({label,...measureGrammarChipCard(baseline,chipCard)}));
  const tbody = document.getElementById('measurements'); tbody.replaceChildren();
  for (const row of rows) { const tr = document.createElement('tr'); for (const value of [row.label,row.width,row.baselineHeight,row.chipHeight,row.heightDelta,row.fits?'PASS':'FAIL']) { const td = document.createElement('td'); td.textContent = value; tr.appendChild(td); } tbody.appendChild(tr); }
  document.getElementById('status').textContent = rows.every(r => r.fits) ? 'All chips and carets fit at their minimum card widths.' : 'Overflow or overlap detected; see FAIL rows.';
  document.getElementById('report').textContent = JSON.stringify({viewport:innerWidth,rootFont:getComputedStyle(document.documentElement).fontSize,rows},null,2);
}
document.getElementById('size').addEventListener('change', e => { document.documentElement.style.setProperty('--font-size-base',e.target.value+'px'); requestAnimationFrame(measure); });
addEventListener('resize',measure);
document.fonts.ready.then(() => requestAnimationFrame(measure));
</script></body></html>\n`);
}
