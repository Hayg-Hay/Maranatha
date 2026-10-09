// Ordered USFM reader for the supplied ASD package. Structural source content
// has its own context; no footnote/heading can become numbered Scripture.
export function readAsdUsfm(source) {
  if (source.includes('\uFFFD') || source.includes('\0')) throw new Error('Invalid ASD source Unicode');
  const tokens = [...source.matchAll(/\\(\+?[a-z]+\d*\*?)[ \t]?/g)].map((m, i, matches) => ({ marker: m[1], value: source.slice(m.index + m[0].length, matches[i + 1]?.index ?? source.length) }));
  const metadata = {}, records = [], headings = [], notes = [], chapterLabels = {}, annotationMarkers = [];
  let chapter = 0, active = null, context = null, pendingHeadings = [];
  const text = value => value.replace(/\r\n/g, '\n').replace(/\n+$/, '');
  const flattened = parts => parts.join('').trim();
  function append(value) {
    if (!context) { if (value.trim()) throw new Error(`ASD text outside a source context: ${value.trim().slice(0, 100)}`); return; }
    if (context === active && value.trim()) {
      for (const heading of pendingHeadings) heading.withinVerse = active.verse;
      pendingHeadings = [];
    }
    context.parts.push(text(value));
  }
  function finishVerse() {
    if (active) {
      active.text = flattened(active.parts); delete active.parts; records.push(active);
      if (context === active) context = null;
      active = null;
    }
    pendingHeadings = [];
  }
  const headerMarkers = new Set(['id', 'rem', 'h', 'toc1', 'toc2', 'toc3', 'mt', 'mt1', 'mt2', 'mt3']);
  const headingMarkers = new Set(['s1', 's2', 's3', 'ms', 'ms1', 'mr', 'r', 'd', 'qa', 'sp']);
  const paragraphs = new Set(['p', 'b', 'q1', 'q2', 'q3', 'qr', 'qc', 'qm1', 'qm2', 'm', 'mi', 'pm', 'po', 'pmo', 'pmc', 'pc', 'pr', 'pi1', 'nb', 'li1', 'li2', 'li3', 'lf', 'lh']);
  const inline = new Set(['litl', 'litl*', 'wj', 'wj*', '+wj', '+wj*', '+tl', '+tl*', 'sc', 'sc*', 'it', 'it*', 'nd', 'nd*', '+nd', '+nd*', 'tl', 'tl*']);
  const noteMarkers = new Set(['fr', 'fl', 'ft', 'fqa', 'fq', 'fv', 'fv*', 'xt', 'xt*', '+fr', '+ft', '+fq', 'ref', 'ref*', ...inline]);
  for (let i = 0; i < tokens.length; i++) {
    const { marker, value } = tokens[i];
    if (marker === 'ie') { if (value.trim()) throw new Error('Text after ASD ie marker'); context = null; continue; }
    if (headerMarkers.has(marker)) {
      context = { parts: [text(value)] }; metadata[marker] = context; continue;
    }
    if (marker === 'c') {
      finishVerse(); const c = Number(value.trim());
      if (!Number.isInteger(c) || c !== chapter + 1) throw new Error('Noncontiguous ASD chapter');
      chapter = c; context = null; continue;
    }
    if (marker === 'cl') { context = { parts: [text(value)] }; chapterLabels[chapter] = context; continue; }
    if (marker === 'v') {
      finishVerse(); const match = value.match(/^([1-9]\d*(?:-[1-9]\d*)?)(?:\s+([\s\S]*))?$/);
      if (!chapter || !match) throw new Error('Invalid ASD verse label');
      const [start, end = start] = match[1].split('-').map(Number);
      if (end < start) throw new Error('Backwards ASD range');
      active = { chapter, verse: start, end, label: match[1], parts: [text(match[2] || '')] };
      context = active; continue;
    }
    if (headingMarkers.has(marker)) {
      context = { chapter, afterVerse: active?.verse || 0, marker, parts: [text(value)] };
      headings.push(context); if (active) pendingHeadings.push(context); continue;
    }
    if (marker === 'iex') {
      context = { chapter, verse: active?.verse || 0, type: 'editorial', reference: '', parts: [text(value)] };
      notes.push(context); continue;
    }
    if (marker === 'f' || marker === 'fm') {
      const originalContext = context, fields = [{ marker, text: value }];
      while (++i < tokens.length && tokens[i].marker !== marker + '*') {
        if (tokens[i].marker === 'cat') {
          fields.push({ marker: 'cat', text: tokens[i].value });
          if (tokens[++i]?.marker !== 'cat*') throw new Error('Unclosed ASD note category');
          if (tokens[i].value.trim()) throw new Error('Text after ASD category');
          continue;
        }
        if (!noteMarkers.has(tokens[i].marker)) throw new Error(`Unsupported ASD note marker ${tokens[i].marker}`);
        fields.push({ marker: tokens[i].marker, text: tokens[i].value });
      }
      if (i === tokens.length) throw new Error('Unclosed ASD note');
      if (marker === 'fm') annotationMarkers.push({ chapter, verse: active?.verse || 0, marker: 'fm', text: value.trim() });
      else {
        const refs = fields.filter(f => f.marker === 'fr' || f.marker === '+fr').map(f => f.text.trim());
        const parts = fields.filter(f => !['f', 'fr', '+fr', 'cat'].includes(f.marker)).map(f => f.marker === 'ref' ? f.text.split('|')[0] : f.text);
        notes.push({ chapter, verse: active?.verse || 0, type: 'footnote', reference: refs.join('; '), text: flattened(parts).replace(/\r?\n/g, ' '), caller: value.trim(), sourceFields: fields });
      }
      context = originalContext; append(tokens[i].value); continue;
    }
    if (marker === 'ref') { append(value.split('|')[0]); continue; }
    if ((marker === 'xt' || marker === 'xt*') && context && context !== active) { append(value); continue; }
    if (marker === 'ref*' || inline.has(marker)) { append(value); continue; }
    if (paragraphs.has(marker)) {
      context = active;
      if (!context && value.trim()) {
        context = { chapter, verse: 0, type: 'unnumbered-source', reference: '', parts: [] };
        notes.push(context);
      }
      // Paragraph boundaries become line breaks; source zero-width spaces,
      // punctuation and every word within the paragraph remain unchanged.
      if (context?.parts.join('').trim()) context.parts.push('\n');
      append(value); continue;
    }
    throw new Error(`Unsupported ASD marker ${marker}`);
  }
  finishVerse();
  for (const [marker, entry] of Object.entries(metadata)) metadata[marker] = flattened(entry.parts);
  for (const [c, entry] of Object.entries(chapterLabels)) chapterLabels[c] = flattened(entry.parts);
  for (const heading of headings) { heading.text = flattened(heading.parts); delete heading.parts; }
  for (const note of notes) if (note.parts) { note.text = flattened(note.parts); delete note.parts; }
  return { metadata, records, headings, notes, chapterLabels, annotationMarkers };
}
