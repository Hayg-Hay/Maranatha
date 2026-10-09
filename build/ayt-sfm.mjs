// Ordered SFM reader: preserve annotation text and compare base words with the
// publisher's independent verse-wise JSON export. No Scripture is generated.
export function parseSfm(source) {
  const tokens = [...source.matchAll(/\\([a-z]+\d*\*?)[ \t]?/g)].map((m, i, all) => ({
    marker: m[1], value: source.slice(m.index + m[0].length, all[i + 1]?.index ?? source.length),
  }));
  const verses = [], headings = [], notes = [], metadata = {};
  let chapter = 0, active = null, pendingHeadings = [];
  const clean = text => text.replace(/\r?\n/g, ' ');
  const finish = () => {
    if (active) { active.text = active.parts.join('').trim(); delete active.parts; verses.push(active); active = null; }
    pendingHeadings = [];
  };
  const append = value => {
    if (active) {
      if (value.trim()) {
        for (const heading of pendingHeadings) heading.withinVerse = active.verse;
        pendingHeadings = [];
      }
      active.parts.push(clean(value));
    }
    else if (value.trim()) throw new Error(`SFM text outside verse: ${value.trim().slice(0, 50)}`);
  };
  const inline = new Set(['sc', 'sc*', 'bk', 'bk*', 'tl', 'tl*', 'qs', 'qs*', 'add', 'add*']);
  const paragraphs = new Set(['p', 'b', 'q1', 'q2', 'li', 'm', 'pi', 'mi', 'nb', 'pc', 'tr', 'tc1', 'tcr2']);
  for (let i = 0; i < tokens.length; i++) {
    const { marker, value } = tokens[i];
    if (['id', 'ide', 'rem', 'h', 'toc1', 'toc2', 'toc3', 'mt1', 'mt2'].includes(marker)) {
      metadata[marker] = value.trim(); continue;
    }
    if (marker === 'c') {
      finish(); const c = Number(value.trim());
      if (c !== chapter + 1) throw new Error('Noncontiguous SFM chapter'); chapter = c; continue;
    }
    if (marker === 'v') {
      finish(); const match = value.match(/^([1-9]\d*)\s+([\s\S]*)$/);
      if (!chapter || !match) throw new Error('Invalid SFM verse label');
      active = { chapter, verse: Number(match[1]), formats: [], parts: [clean(match[2])] }; continue;
    }
    if (['s', 's2', 'ms', 'mr', 'd', 'r'].includes(marker)) {
      const heading = { chapter, afterVerse: active?.verse || 0, marker, text: value.trim() };
      headings.push(heading); if (active) pendingHeadings.push(heading); continue;
    }
    if (['f', 'x', 'rq'].includes(marker)) {
      if (!active && !headings.length) throw new Error('Unattached SFM annotation');
      const parts = [{ marker, value }];
      while (++i < tokens.length && tokens[i].marker !== marker + '*') parts.push(tokens[i]);
      if (i === tokens.length) throw new Error('Unclosed SFM annotation');
      const allowed = marker === 'f' ? ['f', 'fr', 'fk', 'ft', 'fv', 'tr', 'tc1', 'tcr2', ...inline]
        : marker === 'x' ? ['x', 'xo', 'xq', 'xt'] : ['rq'];
      for (const p of parts) if (!allowed.includes(p.marker)) throw new Error(`Unsupported annotation marker ${p.marker}`);
      const references = parts.filter(p => ['fr', 'xo'].includes(p.marker)).map(p => p.value.trim());
      const text = parts.filter(p => !['f', 'x', 'fr', 'xo'].includes(p.marker)).map(p => clean(p.value)).join('').replace(/\s+/g, ' ').trim();
      notes.push({ chapter, verse: active?.verse || 0, type: marker === 'f' ? 'footnote' : 'cross-reference', reference: references.join('; '), text, sourceFields: parts.map(p => ({ marker: p.marker, text: p.value.trim() })) });
      if (active) append(tokens[i].value);
      else headings[headings.length - 1].text += clean(tokens[i].value).trimEnd();
      continue;
    }
    if (active && ['qs', 'tr', 'tc1', 'tcr2'].includes(marker)) active.formats.push(marker);
    if (inline.has(marker)) { append(value); continue; }
    if (paragraphs.has(marker)) { append(' ' + value); continue; }
    throw new Error(`Unsupported SFM marker ${marker}`);
  }
  finish();
  return { metadata, verses, headings, notes };
}
