// Generate the Genesis 2-5 proposal ledger from the shipped corpora.
//
//   node build/gen-genesis2-5-ledger.mjs
//
// The correspondence decisions and verse rationales below are the authored
// textual assessment; the exact Greek/comparison strings and their hashes are
// extracted mechanically from the unchanged shipped corpora, never transcribed
// by hand. Every row stays status "proposal" with humanApproval null.
//
// One-source-to-many rows carry explicit per-target comparison evidence
// (target ref + actual corpus string + hash per language). Source Greek keeps
// one actual ref/text/hash.
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

const sourceSegment = (chapter, label) => {
  const ch = GEN.chapters.find((c) => String(c.n) === String(chapter));
  const seg = ch.segments.find((s) => s.kind === 'verse' && String(s.l) === String(label));
  if (!seg) throw new Error(`missing source GEN ${chapter}:${label}`);
  return seg;
};
const targetText = (corpus, t) => {
  const arr = corpus.books.GEN[t.chapter - 1];
  const text = arr && arr[t.verse - 1];
  if (typeof text !== 'string') throw new Error(`missing target GEN ${t.chapter}:${t.verse}`);
  return text;
};
const T = (chapter, verse) => ({ book: 'GEN', chapter, verse });

const A = {
  finish6: 'Greek finishes the work on the sixth day and rests on the seventh; WEB/KJV/OSHB finish the work and rest on the seventh.',
  book: 'Same opening clause ("book of the generations" / "history of the generations").',
  naked: 'Source GEN 3:1 opens with the nakedness/unashamed statement that the English and Hebrew place at 2:25, then the serpent dialogue at 3:1. One source container, two canonical targets; no Greek 2:25 is invented.',
  seed: 'Greek keeping/watching wording versus English "bruise"; pronoun renderings differ. Preserved, not harmonized.',
  zoe: 'Greek names the woman Ζωή (Life); English and Hebrew render Eve/Havvah.',
  extraClause: 'Greek adds Adam being settled opposite (ἀπέναντι) the garden alongside the expulsion, cherubim and flaming sword.',
  fieldInvite: 'Greek and WEB quote Cain\u2019s invitation to go into the field; KJV and OSHB do not include that invitation clause.',
  boundary6: 'Boundary-only extension: source GEN 6:1 opens with Noah at 500 and his three sons (target 5:32) before the multiplication-of-humanity clause (target 6:1). Only this single boundary reference is extended; the rest of chapter 6 stays unresolved.',
  age: (greek, other) => `Genealogy age differs: Greek ${greek} versus WEB/KJV/OSHB ${other}. Source reading preserved; ages are not harmonized.`,
};

// label -> { targets:[[chapter,verse]], reason, differences? , presentation? }
const CHAPTERS = {
  2: [
    ['1', [T(2, 1)], 'Heavens, earth and all their array were completed.'],
    ['2', [T(2, 2)], 'God completed his work and rested on the seventh day.', [A.finish6]],
    ['3', [T(2, 3)], 'God blessed and sanctified the seventh day.'],
    ['4', [T(2, 4)], 'Book/history of the generations of the heavens and the earth.', [A.book]],
    ['5', [T(2, 5)], 'No field plant or herb yet; the LORD God had not sent rain.'],
    ['6', [T(2, 6)], 'A spring/mist watered the whole face of the ground.'],
    ['7', [T(2, 7)], 'The LORD God formed man from dust and breathed the breath of life.'],
    ['8', [T(2, 8)], 'A garden was planted in Eden and the man placed there.'],
    ['9', [T(2, 9)], 'Every pleasant, good tree, including the tree of life, grew from the ground.'],
    ['10', [T(2, 10)], 'A river went out of Eden and divided into four heads.'],
    ['11', [T(2, 11)], 'First river Pishon, encircling the land of Havilah with its gold.'],
    ['12', [T(2, 12)], 'The gold is good; bdellium and onyx are there.'],
    ['13', [T(2, 13)], 'Second river Gihon, encircling the land of Ethiopia/Cush.'],
    ['14', [T(2, 14)], 'Third river Tigris/Hiddekel, and the fourth Euphrates.'],
    ['15', [T(2, 15)], 'The man was placed in the garden to work it and keep it.'],
    ['16', [T(2, 16)], 'Permission to eat freely of every tree of the garden.'],
    ['17', [T(2, 17)], 'Prohibition of the tree of knowledge, with death on the day of eating.'],
    ['18', [T(2, 18)], 'It is not good for the man to be alone; a helper will be made.'],
    ['19', [T(2, 19)], 'The animals and birds were formed and brought to the man.'],
    ['20', [T(2, 20)], 'The man named the livestock, birds and beasts; no helper was found.'],
    ['21', [T(2, 21)], 'Deep sleep; God took one of the ribs and closed the flesh.'],
    ['22', [T(2, 22)], 'God built the rib into a woman and brought her to the man.'],
    ['23', [T(2, 23)], 'Bone of my bones and flesh of my flesh; she shall be called Woman.'],
    ['24', [T(2, 24)], 'A man shall leave his father and mother and cleave to his wife.'],
  ],
  3: [
    ['1', [T(2, 25), T(3, 1)], 'The nakedness/unashamed statement and the serpent\u2019s opening dialogue form one source container spanning 2:25 and 3:1.', [A.naked], { primary: T(3, 1), note: 'Greek 3:1 also carries the end of chapter 2 (the nakedness statement at 2:25); the complete source is shown once.' }],
    ['2', [T(3, 2)], 'The woman answers the serpent about eating from the garden trees.'],
    ['3', [T(3, 3)], 'She recounts the prohibition concerning the tree in the middle of the garden.'],
    ['4', [T(3, 4)], 'The serpent denies that they will die.'],
    ['5', [T(3, 5)], 'The serpent claims opened eyes and likeness to gods, knowing good and evil.'],
    ['6', [T(3, 6)], 'The woman saw the tree was good, took its fruit and gave to her husband.'],
    ['7', [T(3, 7)], 'Eyes opened, they knew they were naked, and sewed fig leaves.'],
    ['8', [T(3, 8)], 'They heard the LORD God walking in the garden and hid.'],
    ['9', [T(3, 9)], 'The LORD God called to the man: Where are you?'],
    ['10', [T(3, 10)], 'The man: I heard your voice, was afraid, and hid.'],
    ['11', [T(3, 11)], 'God asks who told him and whether he ate of the tree.'],
    ['12', [T(3, 12)], 'The man blames the woman given to him.'],
    ['13', [T(3, 13)], 'God questions the woman; she says the serpent deceived her.'],
    ['14', [T(3, 14)], 'The serpent is cursed above all livestock and beasts.'],
    ['15', [T(3, 15)], 'Enmity set between the serpent and the woman, and between their offspring.', [A.seed]],
    ['16', [T(3, 16)], 'The woman\u2019s pains and conception multiplied; desire and rule.'],
    ['17', [T(3, 17)], 'Adam\u2019s sentence because he listened to his wife and ate.'],
    ['18', [T(3, 18)], 'Thorns and thistles; he shall eat the herb of the field.'],
    ['19', [T(3, 19)], 'Bread by the sweat of his face until he returns to the ground.'],
    ['20', [T(3, 20)], 'The man named his wife Zoe/Life, mother of all living.', [A.zoe]],
    ['21', [T(3, 21)], 'God made garments of skins and clothed them.'],
    ['22', [T(3, 22)], 'The man became like one of us; he must not take of the tree of life.'],
    ['23', [T(3, 23)], 'The LORD God sent him out of Eden to till the ground.'],
    ['24', [T(3, 24)], 'Adam driven out; cherubim and the flaming sword placed at Eden.', [A.extraClause]],
  ],
  4: [
    ['1', [T(4, 1)], 'Adam knew Eve; she conceived and bore Cain.'],
    ['2', [T(4, 2)], 'Abel was born; Abel a keeper of sheep, Cain a tiller of the ground.'],
    ['3', [T(4, 3)], 'In time Cain brought an offering from the fruit of the ground.'],
    ['4', [T(4, 4)], 'Abel brought the firstborn and fat; God respected Abel and his offering.'],
    ['5', [T(4, 5)], 'Cain and his offering were not respected; Cain was angry and his face fell.'],
    ['6', [T(4, 6)], 'The LORD asks Cain why he is angry and why his face has fallen.'],
    ['7', [T(4, 7)], 'If you do well, acceptance; if not, sin crouches at the door.'],
    ['8', [T(4, 8)], 'Cain invites Abel into the field and rises against him.', [A.fieldInvite]],
    ['9', [T(4, 9)], 'God asks where Abel is; Cain denies being his keeper.'],
    ['10', [T(4, 10)], 'Abel\u2019s blood cries to God from the ground.'],
    ['11', [T(4, 11)], 'Cain is cursed from the ground that opened to receive the blood.'],
    ['12', [T(4, 12)], 'The ground will not yield its strength; he will be a fugitive and wanderer.'],
    ['13', [T(4, 13)], 'Cain says his punishment is greater than he can bear.'],
    ['14', [T(4, 14)], 'Driven from the face of the ground; he will be hidden and a wanderer.'],
    ['15', [T(4, 15)], 'Sevenfold vengeance for killing Cain; the LORD set a mark on him.'],
    ['16', [T(4, 16)], 'Cain left the LORD\u2019s presence and lived in Nod, east of Eden.'],
    ['17', [T(4, 17)], 'Cain knew his wife; Enoch was born; Cain built and named a city.'],
    ['18', [T(4, 18)], 'Enoch\u2019s line: Irad, Mehujael, Methushael, Lamech.'],
    ['19', [T(4, 19)], 'Lamech took two wives, Adah and Zillah.'],
    ['20', [T(4, 20)], 'Adah bore Jabal, father of those who dwell in tents with livestock.'],
    ['21', [T(4, 21)], 'Jubal, father of all who handle the harp and pipe.'],
    ['22', [T(4, 22)], 'Zillah bore Tubal Cain, forger of bronze and iron; sister Naamah.'],
    ['23', [T(4, 23)], 'Lamech\u2019s speech to his wives Adah and Zillah.'],
    ['24', [T(4, 24)], 'Sevenfold for Cain, seventy-sevenfold for Lamech.'],
    ['25', [T(4, 25)], 'Adam knew Eve again; she bore Seth.'],
    ['26', [T(4, 26)], 'Seth\u2019s son Enosh; then men began to call on the LORD\u2019s name.'],
  ],
  5: [
    ['1', [T(5, 1)], 'Book of the generations of Adam; made in God\u2019s likeness.'],
    ['2', [T(5, 2)], 'Male and female created and blessed; named Adam.'],
    ['3', [T(5, 3)], 'Adam begat a son in his likeness and named him Seth.', [A.age(230, 130)]],
    ['4', [T(5, 4)], 'Adam lived after Seth and begat sons and daughters.', [A.age(700, 800)]],
    ['5', [T(5, 5)], 'All the days of Adam, and he died.'],
    ['6', [T(5, 6)], 'Seth begat Enosh.', [A.age(205, 105)]],
    ['7', [T(5, 7)], 'Seth lived after Enosh and begat sons and daughters.', [A.age(707, 807)]],
    ['8', [T(5, 8)], 'All the days of Seth, and he died.'],
    ['9', [T(5, 9)], 'Enosh begat Kenan.', [A.age(190, 90)]],
    ['10', [T(5, 10)], 'Enosh lived after Kenan and begat sons and daughters.', [A.age(715, 815)]],
    ['11', [T(5, 11)], 'All the days of Enosh, and he died.'],
    ['12', [T(5, 12)], 'Kenan begat Mahalalel.', [A.age(170, 70)]],
    ['13', [T(5, 13)], 'Kenan lived after Mahalalel and begat sons and daughters.', [A.age(740, 840)]],
    ['14', [T(5, 14)], 'All the days of Kenan, and he died.'],
    ['15', [T(5, 15)], 'Mahalalel begat Jared.', [A.age(165, 65)]],
    ['16', [T(5, 16)], 'Mahalalel lived after Jared and begat sons and daughters.', [A.age(730, 830)]],
    ['17', [T(5, 17)], 'All the days of Mahalalel, and he died.'],
    ['18', [T(5, 18)], 'Jared begat Enoch.'],
    ['19', [T(5, 19)], 'Jared lived after Enoch and begat sons and daughters.'],
    ['20', [T(5, 20)], 'All the days of Jared, and he died.'],
    ['21', [T(5, 21)], 'Enoch begat Methuselah.'],
    ['22', [T(5, 22)], 'Enoch walked with God after Methuselah and begat sons and daughters.', [A.age(200, 300)]],
    ['23', [T(5, 23)], 'All the days of Enoch.'],
    ['24', [T(5, 24)], 'Enoch walked with God; he was not found, for God took him.'],
    ['25', [T(5, 25)], 'Methuselah begat Lamech (Greek 187, matching the inspected English/Hebrew verse).', ['Greek 5:25 reads 187 years, matching the inspected WEB/KJV/OSHB verse; the 167 reading of another LXX witness is not imported.']],
    ['26', [T(5, 26)], 'Methuselah lived after Lamech and begat sons and daughters.'],
    ['27', [T(5, 27)], 'All the days of Methuselah, and he died.'],
    ['28', [T(5, 28)], 'Lamech begat a son.', [A.age(188, 182)]],
    ['29', [T(5, 29)], 'He named him Noah, saying he will comfort us.'],
    ['30', [T(5, 30)], 'Lamech lived after Noah and begat sons and daughters.', [A.age(565, 595)]],
    ['31', [T(5, 31)], 'All the days of Lamech, and he died.', [A.age(753, 777)]],
  ],
  6: [
    ['1', [T(5, 32), T(6, 1)], 'Noah at 500 with three sons (target 5:32) and the beginning of the multiplication narrative (target 6:1) form one source container.', [A.boundary6], { primary: T(6, 1), note: 'Greek 6:1 opens with Noah\u2019s age and three sons (5:32) before the multiplication clause (6:1); the complete source is shown once.' }],
  ],
};

const rows = [];
for (const chapter of Object.keys(CHAPTERS).sort((a, b) => Number(a) - Number(b))) {
  for (const [label, targets, reason, differences, presentation] of CHAPTERS[chapter]) {
    const seg = sourceSegment(chapter, label);
    const to = targets.map((t) => ({ book: t.book, chapter: t.chapter, verse: t.verse }));
    const targetEvidence = targets.map((t) => {
      const texts = { web: targetText(web, t), he: targetText(he, t), kjv: targetText(kjv, t) };
      return {
        to: { book: t.book, chapter: t.chapter, verse: t.verse },
        texts,
        textHashes: { web: textHash(texts.web), he: textHash(texts.he), kjv: textHash(texts.kjv) },
      };
    });
    const id = `GEN${chapter}-${label}`;
    rows.push({
      id,
      status: 'proposal',
      groupId: id,
      from: { book: 'GEN', chapter: String(chapter), kind: 'verse', label: String(label) },
      to,
      targets: targetEvidence,
      texts: { greek: seg.t },
      textHashes: { greek: textHash(seg.t) },
      reason,
      differences: differences || [],
      sourceFlags: seg.flags ? seg.flags.slice() : [],
      presentation: presentation || null,
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
  batch: 'genesis2-5',
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

fs.writeFileSync(path.join(root, 'build/reviews/lxx-genesis2-5-evidence.json'), JSON.stringify(ledger, null, 2) + '\n');

// Review table.
const verdict = (r) => (r.differences && r.differences.length ? 'A*' : 'A');
const table = rows.map((r) => {
  const tgt = r.to.map((t) => `${t.chapter}:${t.verse}`).join(', ');
  return `| ${r.from.chapter}:${r.from.label} | ${tgt} | ${verdict(r)} | ${r.reason}${r.differences && r.differences.length ? ` ${r.differences.join(' ')}` : ''} |`;
}).join('\n');
const md = `# Genesis 2-5 correspondence proposals - author review\n\n` +
  `Author: DeepSeek (AI), 2026-10-07. Content assessment against the shipped Greek,\n` +
  `WEB-C, KJV and OSHB strings. This is **AI proposal adjudication, not human or\n` +
  `scholarly verification**; the ledger was not human-edited. Every correspondence\n` +
  `stays \`proposal\` with \`humanApproval = null\`. Verdicts: **A** = agree; **A*** =\n` +
  `agree with a material boundary/age/wording caveat retained in this review table. Doubtful\n` +
  `cases were left unresolved rather than forced.\n\n` +
  `Container facts: source GEN 3:1 spans targets 2:25 and 3:1; source GEN 6:1 is a\n` +
  `boundary-only unit spanning 5:32 and 6:1 (chapter 6 otherwise unresolved). No\n` +
  `Greek 2:25/5:32 is invented, and no text is concatenated or split.\n\n` +
  `| Source (GEN) | Target | Verdict | Rationale |\n| --- | --- | --- | --- |\n` + table + '\n\n' +
  `## Result\n\n` +
  `${rows.length} proposed source units; ${rows.filter((r) => r.differences && r.differences.length).length} carry a material caveat. ` +
  `All remain proposals; human textual adjudication and phone acceptance are separate gates.\n`;
fs.writeFileSync(path.join(root, 'build/reviews/lxx-genesis2-5-review.md'), md);

console.log(`gen-genesis2-5-ledger: wrote ${rows.length} rows, ${new Set(rows.map((r) => r.groupId)).size} groups`);
