// Generate the Genesis 6-15 proposal ledger from the shipped corpora.
//
//   node build/gen-genesis6-15-ledger.mjs
//
// Correspondence decisions and the material-difference notes are the authored
// textual assessment; the exact Greek/comparison strings and their hashes are
// extracted mechanically from the unchanged shipped corpora. Every row stays
// status "proposal" with humanApproval null. Source GEN 6:1 is NOT repeated
// (it lives in the immutable Genesis 2-5 ledger); this batch starts at 6:2.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const lf = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n');
const canonicalHash = (rel) => crypto.createHash('sha256').update(lf(rel), 'utf8').digest('hex');
const textHash = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

const native = readJson('data/lxx-swete.json');
const web = readJson('data/web.json');
const kjv = readJson('data/kjv.json');
const he = readJson('data/he.json');
const GEN = native.books.find((b) => b.id === 'GEN');

const sourceChapter = (ch) => GEN.chapters.find((c) => String(c.n) === String(ch));
const sourceSegment = (ch, label) => {
  const seg = sourceChapter(ch).segments.find((s) => s.kind === 'verse' && String(s.l) === String(label));
  if (!seg) throw new Error(`missing source GEN ${ch}:${label}`);
  return seg;
};
const targetText = (corpus, t) => {
  const arr = corpus.books.GEN[t.chapter - 1];
  const text = arr && arr[t.verse - 1];
  if (typeof text !== 'string') throw new Error(`missing target GEN ${t.chapter}:${t.verse}`);
  return text;
};
const T = (chapter, verse) => ({ book: 'GEN', chapter, verse });
const clause = (t) => {
  const clean = String(t).replace(/^[\s“"'‘’(]+/, '').trim();
  const first = clean.split(/[.;:!?]/)[0];
  return (first.length > 108 ? first.slice(0, 105) + '\u2026' : first).trim();
};

// Explicit material-difference / source-condition notes for inspected cases.
const DIFF = {
  '7:11': 'Greek names the twenty-seventh day and omits the month name ("second"); WEB/KJV/OSHB read the second month, the seventeenth day. The source ending ("the windows of heaven") also lacks the verb "were opened".',
  '7:12': 'Greek contains a damaged token ("κοντα") in the forty-days/nights clause.',
  '7:17': 'Greek reads "days and forty nights" where the comparison reads "forty days"; same flood-covering event.',
  '8:22': 'Source ends with the incomplete/damaged token "οὐ κατα- IX"; the closing "shall not cease" is not present in this transcription and is not reconstructed.',
  '9:1': 'Source begins with the damaged token "IXκαὶ" and lacks the opening "God blessed Noah and his sons" clause found in WEB/KJV/OSHB.',
  '9:14': 'Greek has a damaged/abridged conditional ("ἐν τῷ συνς"); same rainbow-in-the-cloud statement.',
  '9:20': 'Greek contains a hyphenated split token ("ἄνθρω- πος").',
  '9:28': 'Genealogy age differs: Greek 300 years after the flood versus WEB/KJV/OSHB 350. Source reading preserved.',
  '10:1': 'Source is incomplete/damaged ("Σῆμ’, Χάμ, ’σαν") where the comparison carries the three sons and the begetting statement; not reconstructed.',
  '10:24': 'Source already includes the extra Cainan generation (Arphaxad → Cainan → Shelah); WEB/KJV/OSHB have Arpachshad → Shelah only.',
  '11:12': 'Source reads 135 years and begets Cainan; WEB/KJV/OSHB read Arpachshad 35 and Shelah. Extra Cainan generation present; ages differ.',
  '11:13': 'Source reads Arphaxad lived on after begetting Cainan; the comparison reads 403 years after Shelah. Extra generation; ages differ.',
  '11:14': 'Genealogy age differs: Greek 130 versus WEB/KJV/OSHB 30.',
  '11:15': 'Genealogy age differs: Greek ~330 versus WEB/KJV/OSHB 403; also a damaged numeral token.',
  '11:16': 'Genealogy age differs: Greek 134 versus WEB/KJV/OSHB 34.',
  '11:17': 'Genealogy age differs: Greek ~370 versus WEB/KJV/OSHB 430; damaged numeral.',
  '11:18': 'Genealogy age differs: Greek ~130 versus WEB/KJV/OSHB 30; damaged numeral tokens.',
  '11:20': 'Genealogy age differs: Greek 132 versus WEB/KJV/OSHB 32.',
  '11:22': 'Genealogy age differs: Greek 130 versus WEB/KJV/OSHB 30.',
  '11:24': 'Genealogy age differs: Greek 79 versus WEB/KJV/OSHB 29.',
  '11:25': 'Genealogy age differs: Greek ~129 versus WEB/KJV/OSHB 119.',
  '12:9': 'Greek reads "and Abram departed and encamped in the wilderness"; the comparison reads "still going on toward the South". Same journey stage, different wording.',
  '12:14': 'Source contains mixed-script tokens (e.g. "Μrπτον"); preserved, not repaired.',
  '12:15': 'Source contains mixed-script tokens; preserved, not repaired.',
  '12:16': 'Source contains mixed-script tokens; preserved, not repaired.',
  '13:11': 'Greek contains a hyphenated split token ("ἐξελἐ- ξατο").',
  '13:13': 'Greek contains a doubled token ("οἱ δὲ δὲ") and a transposed phrase.',
  '13:14': 'Greek contains a doubled article ("τὸν Τὸν") and damaged forms.',
  '14:4': 'Greek contains a doubled token ("τῷ τῷ") and omits the king\'s name before thirteen years.',
  '14:18': 'Greek contains a damaged token ("ἐξήνεγκεω"); Melchizedek scene corresponds.',
  '14:22': 'Greek reads "to Sodom" where the comparison reads "to the king of Sodom"; same speech.',
  '15:18': 'Source GEN 15:18 carries the covenant land grant and the whole peoples list (targets 18–21), including a literal "§20" and an extra "Hivites" (Εὑοίους) absent from WEB; one source container, shown once.',
};

// Manual reason overrides for the inspected focus cases.
const REASON = {
  '7:11': 'The opening of the flood (fountains of the deep and windows of heaven) corresponds, with a day/month and incomplete-wording caveat.',
  '8:22': 'The post-flood promise that the seasons continue corresponds, with an incomplete source ending.',
  '9:1': 'God speaks to Noah and his sons; the source lacks the opening blessing clause.',
  '10:1': 'The generations of the sons of Noah open the table of nations, with an incomplete source phrase.',
  '10:24': 'The Shem genealogy step corresponds, with an extra Cainan generation in the source.',
  '11:12': 'Arphaxad\u2019s begetting step corresponds; the source inserts Cainan where the comparison has Shelah.',
  '11:13': 'Arphaxad\u2019s later years correspond, with the extra Cainan generation and different ages.',
  '15:18': 'The covenant land grant and the peoples list form one source container spanning 15:18–21.',
};

const rows = [];
const chapters = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
for (const ch of chapters) {
  const segs = sourceChapter(ch).segments.filter((s) => s.kind === 'verse');
  for (const seg of segs) {
    const label = String(seg.l);
    if (ch === 6 && label === '1') continue; // immutable Genesis 2-5 ledger row
    let targets;
    if (ch === 15 && label === '18') targets = [T(15, 18), T(15, 19), T(15, 20), T(15, 21)];
    else targets = [T(ch, Number(label))];

    const key = `${ch}:${label}`;
    const webFirst = targetText(web, targets[0]);
    const reason = REASON[key] || `Same passage/event as target ${ch}:${targets[0].verse}: ${clause(webFirst)}.`;
    const differences = DIFF[key] ? [DIFF[key]] : [];
    // Any source transcription flag gets an honest source-condition notice.
    if (seg.flags && seg.flags.length) {
      const notes = seg.flags.map((f) => f.note).filter(Boolean).join(' ');
      if (notes) differences.push(`Source transcription flag: ${notes}`);
    }

    const targetEvidence = targets.map((t) => {
      const texts = { web: targetText(web, t), he: targetText(he, t), kjv: targetText(kjv, t) };
      return {
        to: { book: t.book, chapter: t.chapter, verse: t.verse },
        texts,
        textHashes: { web: textHash(texts.web), he: textHash(texts.he), kjv: textHash(texts.kjv) },
      };
    });

    const id = `GEN${ch}-${label}`;
    rows.push({
      id,
      status: 'proposal',
      groupId: id,
      from: { book: 'GEN', chapter: String(ch), kind: 'verse', label },
      to: targets.map((t) => ({ book: t.book, chapter: t.chapter, verse: t.verse })),
      targets: targetEvidence,
      texts: { greek: seg.t },
      textHashes: { greek: textHash(seg.t) },
      reason,
      differences,
      sourceFlags: seg.flags ? seg.flags.slice() : [],
      presentation: (ch === 15 && label === '18')
        ? { primary: T(15, 18), note: 'Greek 15:18 carries the covenant land grant and the peoples list (targets 18\u201321); the complete source is shown once.' }
        : null,
    });
  }
}

const corpusBindings = {
  lxx: { path: 'data/lxx-swete.json' },
  web: { path: 'data/web.json' },
  he: { path: 'data/he.json' },
  kjv: { path: 'data/kjv.json' },
  canon: { path: 'data/canon.js' },
};
for (const b of Object.values(corpusBindings)) b.sha256 = canonicalHash(b.path);

const ledger = {
  version: 1,
  batch: 'genesis6-15',
  status: 'proposal',
  review: {
    humanApproval: null,
    reviewers: [{ id: 'deepseek', kind: 'ai', role: 'implementer and textual proposal author' }],
    requirement: 'Human adjudication before correspondences are described as verified.',
  },
  license: {
    id: 'CC-BY-SA-4.0',
    attribution: 'Greek: First1KGreek / Swete, CC BY-SA 4.0; Hebrew: Open Scriptures Hebrew Bible, CC BY 4.0; WEB Catholic Edition and imported KJV: source declarations in shipped datasets.',
    changes: 'Editorial correspondence proposals only; no Scripture text changed.',
  },
  bindings: corpusBindings,
  rows,
};

fs.writeFileSync(path.join(root, 'build/reviews/lxx-genesis6-15-evidence.json'), JSON.stringify(ledger, null, 2) + '\n');

const verdict = (r) => (r.differences && r.differences.length ? 'A*' : 'A');
const table = rows.map((r) => {
  const tgt = r.to.map((t) => `${t.chapter}:${t.verse}`).join(', ');
  return `| ${r.from.chapter}:${r.from.label} | ${tgt} | ${verdict(r)} | ${r.reason}${r.differences && r.differences.length ? ` ${r.differences.join(' ')}` : ''} |`;
}).join('\n');
const md = `# Genesis 6-15 correspondence proposals - author review\n\n` +
  `Author: DeepSeek (AI), 2026-10-07. Content assessment against the shipped Greek,\n` +
  `WEB-C, KJV and OSHB strings. This is **AI proposal adjudication, not human or\n` +
  `scholarly verification**. Every correspondence stays \`proposal\` with\n` +
  `\`humanApproval = null\`. Verdicts: **A** = agree; **A*** = agree with a material\n` +
  `source-condition/age/wording caveat that stays visible. Doubtful or damaged\n` +
  `readings were not forced into full-equivalence claims.\n\n` +
  `Source GEN 6:1 is reused intact from the immutable Genesis 2-5 ledger (it also\n` +
  `carries target 5:32) and is not repeated here. Source GEN 15:18 is one container\n` +
  `spanning targets 18-21; it is rendered once with continuation notes.\n\n` +
  `| Source (GEN) | Target | Verdict | Rationale |\n| --- | --- | --- | --- |\n` + table + '\n\n' +
  `## Result\n\n` +
  `${rows.length} proposed source units; ${rows.filter((r) => r.differences && r.differences.length).length} carry a material caveat ` +
  `(mostly source-condition/damaged-text and genealogy-age differences). All remain proposals; human textual adjudication and phone acceptance are separate gates.\n`;
fs.writeFileSync(path.join(root, 'build/reviews/lxx-genesis6-15-review.md'), md);

console.log(`gen-genesis6-15-ledger: wrote ${rows.length} rows, ${new Set(rows.map((r) => r.groupId)).size} groups, ${rows.filter((r) => r.differences.length).length} with caveats`);
