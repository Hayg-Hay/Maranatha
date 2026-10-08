// Independent source inventory: no writes, transformations, or network access.
import fs from 'node:fs';
import { XMLParser } from 'fast-xml-parser';
const source = fs.readFileSync(new URL('./sources/vulgata-clementina/extracted/latVUC_usfx.xml', import.meta.url), 'utf8');
const parsed = new XMLParser({ preserveOrder: true, ignoreAttributes: false, trimValues: false, parseTagValue: false }).parse(source);
const tags = {}, books = [];
function walk(nodes, state) {
  for (const node of nodes) {
    const tag = Object.keys(node).find(k => k !== ':@');
    if (tag === '#text') continue;
    tags[tag] = (tags[tag] || 0) + 1;
    if (tag === 'book') {
      state = { id: node[':@']['@_id'], chapters: [], verses: 0, labels: new Set(), notes: 0 };
      books.push(state);
    }
    if (tag === 'c') state.chapters.push({ id: node[':@']['@_id'], labels: [] });
    if (tag === 'v') {
      const label = node[':@']['@_id'];
      state.chapters.at(-1).labels.push(label);
      state.labels.add(label); state.verses++;
    }
    if (tag === 'f' || tag === 'x') { state.notes++; continue; }
    if (Array.isArray(node[tag])) walk(node[tag], state);
  }
}
walk(parsed);
console.log(JSON.stringify({ tags, books: books.map(b => ({ id: b.id, chapters: b.chapters.length, verses: b.verses, notes: b.notes, nonIntegerLabels: [...b.labels].filter(l => !/^[1-9]\d*$/.test(l)), gaps: b.chapters.flatMap(c => { const labels = c.labels.map(Number); return labels.filter((v,i) => v !== i+1).length ? [{chapter: c.id, labels: c.labels}] : []; }) })), totals: { books: books.length, chapters: books.reduce((n,b) => n+b.chapters.length,0), verses: books.reduce((n,b) => n+b.verses,0), notes: books.reduce((n,b) => n+b.notes,0) } }, null, 2));
