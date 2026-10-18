// Research comparison only. Never changes Scripture or certifies print identity.
import fs from 'node:fs';
import crypto from 'node:crypto';
const root='build/cache/armenian-catalogues';
const file=`${root}/western-1853-labelled-ebook.txt`;
const bytes=fs.readFileSync(file), text=bytes.toString('utf8');
const map=Object.fromEntries('Mth:MAT Mrk:MRK Lke:LUK Jhn:JHN Aca:ACT Rmn:ROM 1Cr:1CO 2Cr:2CO Glt:GAL Eph:EPH Phl:PHP Cls:COL 1Th:1TH 2Th:2TH 1Tm:1TI 2Tm:2TI Tts:TIT Phm:PHM Hbr:HEB Jms:JAS 1Pt:1PE 2Pt:2PE 1Jh:1JN 2Jh:2JN 3Jh:3JN Jde:JUD Rvl:REV'.split(' ').map(x=>x.split(':')));
const rows=[], byRef=new Map();
for(const [i,line]of text.replace(/\r\n?/g,'\n').split('\n').entries()){
  const m=line.match(/^(\w{3})\t(\d+)\t(\d+)\t(.*)$/);if(!m)continue;
  if(!map[m[1]])throw Error('Unknown ebook code '+m[1]);
  const ref=`${map[m[1]]}.${Number(m[2])}.${Number(m[3])}`,record={line:i+1,ref,text:m[4]};
  rows.push(record);if(!byRef.has(ref))byRef.set(ref,[]);byRef.get(ref).push(record);
}
const duplicateRefs=[...byRef].filter(([ref,r])=>r.length>1).map(([ref,records])=>({ref,records}));
const gaps=[...byRef].filter(([ref,r])=>!r.some(x=>x.text.trim())).map(([ref])=>ref);
const normalize=s=>s.normalize('NFC').toLowerCase().replaceAll('և','եւ').replace(/\s+/g,' ').trim();
const quoteFold=s=>normalize(s).replace(/[«»“”„]/g,'"');
const anchors=JSON.parse(fs.readFileSync('build/reviews/armwestern-fingerprint-sample.json','utf8')).anchors;
const comparisons=anchors.map(a=>{
  const records=byRef.get(a.moduleSlot)||[], ebook=records.map(r=>r.text).join(' ');
  return {ref:a.moduleSlot,module:a.raw,ebook,lines:records.map(r=>r.line),exactNfcWhitespace:normalize(a.raw)===normalize(ebook),quoteFoldMatch:quoteFold(a.raw)===quoteFold(ebook),warning:'Quote folding used only as a diagnostic, never Scripture normalization.'};
});
const pilot=JSON.parse(fs.readFileSync('build/reviews/armwestern-raw-pilot.json','utf8'));
const pilotComparison=pilot.pilot.map(p=>({ref:p.ref,module:p.raw,cache:p.cache,ebookRecords:byRef.get(p.ref)||[]}));
const kjv=JSON.parse(fs.readFileSync('data/kjv.json','utf8')).books, extents={};
for(const r of rows){const [book,c,v]=r.ref.split('.');extents[book]||={};extents[book][c]=Math.max(extents[book][c]||0,Number(v));}
const extentDifferences=[];
for(const [book,cs]of Object.entries(extents))for(const [c,extent]of Object.entries(cs))if(extent!==kjv[book][Number(c)-1].length)extentDifferences.push({book,chapter:Number(c),ebook:extent,kjv:kjv[book][Number(c)-1].length});
const report={status:'Same-family electronic wording comparison; not an independent print witness or rights clearance.',source:'https://archive.org/details/TheHolyBibleInArmenianWestern1853NT',textSha256:crypto.createHash('sha256').update(bytes).digest('hex'),pdfSha256:crypto.createHash('sha256').update(fs.readFileSync(`${root}/western-1853-labelled-ebook.pdf`)).digest('hex'),rows:rows.length,uniqueRefs:byRef.size,duplicateRefs,gaps,extents,extentDifferences,anchorSummary:{total:comparisons.length,exactNfcWhitespace:comparisons.filter(c=>c.exactNfcWhitespace).length,quoteFoldMatches:comparisons.filter(c=>c.quoteFoldMatch).length},comparisons,pilotComparison};
fs.writeFileSync('build/reviews/armwestern-ebook-comparison.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({rows:report.rows,uniqueRefs:report.uniqueRefs,duplicateRefs:duplicateRefs.map(x=>({ref:x.ref,records:x.records.length})),gaps,anchors:report.anchorSummary},null,2));
