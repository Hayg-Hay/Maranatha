// Research scaffolding: records evidence and unknowns; never repairs Scripture.
import fs from 'node:fs';
const report=JSON.parse(fs.readFileSync('build/reviews/armwestern-raw-pilot.json','utf8'));
const chapters=new Map(), runs=[];
for(const m of report.mismatches){
  const [book,c,v]=m.ref.split('.'),chapter=Number(c),verse=Number(v),previous=runs.at(-1);
  if(previous&&previous.book===book&&previous.chapter===chapter&&previous.end+1===verse){previous.end=verse;previous.count++;}
  else runs.push({book,chapter,start:verse,end:verse,count:1});
}
for(const run of runs){const key=`${run.book}.${run.chapter}`;if(!chapters.has(key))chapters.set(key,[]);chapters.get(key).push(run);}
const witnesses={
  'JHN.6':{pages:[989,990],printedPages:[101,102],observations:'1884 witness splits 51/52 and ends at 72. Module has 71 slots; cache normalizes to 71 conventional references. Native labels must not be defined by English extent.'},
  'MRK.8':{pages:[932,933],printedPages:[44,45],observations:'1884 print separates 8:38 and 9:1. Module merges their material into 8:38; exact wording witness still unresolved.'},
  'MRK.9':{pages:[933],printedPages:[45],observations:'1884 print puts kingdom saying at 9:1 and transfiguration at 9:2; module 9:1 is transfiguration. Tail print check still pending.'},
  '2CO.2':{pages:[1076],printedPages:[188],observations:'1884 print contains numbered 2:1; raw module slot has zero byte length. Different wording prevents filling from this witness.'},
  '2CO.6':{pages:[1080],printedPages:[192],observations:'1884 print contains numbered 6:1; raw module slot has zero byte length. Different wording prevents filling from this witness.'},
};
const entries=[...chapters].map(([key,chapterRuns])=>{
  const witness=witnesses[key];
  const refs=[...new Set(chapterRuns.flatMap(r=>[Math.max(1,r.start-1),r.start,r.end]))].map(v=>`${key}.${v}`);
  return {chapter:key,runs:chapterRuns,reviewRefs:refs,witness:witness?'bibleinmodernarm00cons, Constantinople 1884; comparison only, not matched edition':null,witnessPdfPages:witness?.pages||[],witnessPrintedNtPages:witness?.printedPages||[],nativeLabels:[],moduleSlots:refs,cacheRefs:refs,class:null,allowedClasses:['native difference','upstream merge','upstream empty','extraction'],observations:witness?.observations||null,verdict:'Pending exact wording witness and boundary/tail verification; no repair decision.'};
});
const empties={
  shiftedTail:['MAT.17.27','MRK.9.50','ACT.14.28','1TH.4.18'],
  noPrecedingShift:['ACT.7.60','ACT.19.41','2CO.13.14','HEB.13.25'],
  chapterStart:['2CO.2.1','2CO.6.1'],
};
fs.writeFileSync('build/reviews/armwestern-mismatch-runs.json',JSON.stringify({status:'160 differing slots; grouped differences, not a defect count.',chapters:chapters.size,runCount:runs.length,runs,empties},null,2)+'\n');
fs.writeFileSync('build/reviews/armwestern-evidence-ledger.json',JSON.stringify({status:'20 chapter-level review records. Empty witness/class fields are unresolved, never fabricated evidence.',moduleArchiveSha256:report.manifest.files[0].sha256,cacheSha256:report.cacheSha256,empties,entries},null,2)+'\n');
console.log(`Prepared ${chapters.size} chapter records, ${runs.length} contiguous runs, three empty-slot groups.`);
