// Offline technical conversion of two independently credited NT witnesses.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {readSwordNt,NT_IDS} from './sword-nt-source.mjs';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const pins={peshitta:'1a2dfaaabaeca19e299160f0159953cc395962f65561b76af561a3ff89959d9b',murdock:'ec34bd7d100067058da280a99f50da9757333242489b06ffd26766c042342bbd'};
const later=new Set(['2PE','2JN','3JN','JUD','REV']);
export function verifySource(id){const dir=path.join(ROOT,'build/sources',id),bytes=fs.readFileSync(`${dir}/import-source-files.json`);if(sha(bytes)!==pins[id])throw Error(`Changed ${id} manifest`);const m=JSON.parse(bytes);for(const f of m.files){const target=path.resolve(dir,f.path);if(!target.startsWith(dir+path.sep)||sha(fs.readFileSync(target))!==f.sha256)throw Error(`Changed ${id} source: ${f.path}`);}return m;}
const put=(o,b,c,n)=>{o[b]||={};o[b][c]||=[];o[b][c].push(n);};
export function loadAndBuild(id){
 if(!pins[id])throw Error('Unknown NT source');const manifest=verifySource(id),dir=path.join(ROOT,'build/sources',id,'module/modules/texts/ztext',id);
 const conf=fs.readFileSync(path.join(ROOT,'build/sources',id,'module/mods.d',`${id}.conf`),'utf8');
 if(!conf.includes('DistributionLicense=Public Domain'))throw Error('Missing distribution declaration');
 if(id==='peshitta'&&!conf.includes('Versification=KJV'))throw Error('Unexpected Syriac versification');
 const kjv=JSON.parse(fs.readFileSync(path.join(ROOT,'data/kjv.json'),'utf8')).books;
 const counts=Object.fromEntries(NT_IDS.map(b=>[b,kjv[b].map(c=>c.length)]));
 const source=readSwordNt(dir,counts,id==='murdock'?'latin1':'utf-8');
 const books={},sourceNotes={},bookProvenance={},versification={},conversionLedger=[],verseMetadata={};
 const inventory={books:27,chapters:260,records:0,footnotes:0,emptyRefs:[],recoveredNativeUnits:0};
 for(const b of NT_IDS){books[b]=[];for(let c=0;c<source.books[b].length;c++){
  const chapter=[];books[b].push(chapter);
  for(const row of source.books[b][c]){
   let text=row.raw;
   if(id==='peshitta'){
    text=text.replace(/<(?:chapter|div)\b[^>]*\/>/g,'');
    if(text.includes('<')||text.includes('>'))throw Error(`Unsupported Syriac markup ${b}.${c+1}.${row.verse}`);
   }else{
    text=text.replace(/<RF>([\s\S]*?)<Rf>/g,(_,note)=>{put(sourceNotes,b,c+1,{verse:row.verse,type:'footnote',text:note,sourceMarker:'GBF RF'});inventory.footnotes++;return '';});
    text=text.replace(/<F[Ii]>/g,'');
    if(text.includes('<')||text.includes('>'))throw Error(`Unsupported Murdock markup ${b}.${c+1}.${row.verse}`);
   }
   chapter.push(text.trim());
  }
 }
 if(id==='peshitta'&&later.has(b))bookProvenance[b]={corpus:'later-supplied Syriac book',note:'This book is outside the traditional 22-book Peshitta NT corpus and is included in this 27-book digital compilation. Its precise printed recension has not been independently verified. The BFBS tradition includes later-supplied Syriac editions; this is not labelled an original 22-book Peshitta book.'};
 }
 if(id==='peshitta'){
  const original=books.MRK[8][48];const marker=' 50 ';
  if(books.MRK[8][49]!==''||original.split(marker).length!==2)throw Error('Changed explicit Mark 9:50 source marker');
  const [v49,v50]=original.split(marker);if(!v49.endsWith('܀')||!v50.trim().endsWith('܀'))throw Error('Unexpected Mark boundary');
  books.MRK[8][48]=v49.trim();books.MRK[8][49]=v50.trim();
  conversionLedger.push({sourceSlot:'MRK.9.49',targetRefs:['MRK.9.49','MRK.9.50'],basis:'Literal source verse number 50 within indexed slot 49, also present in the named upstream text. Only the reference marker is separated; all Syriac wording/punctuation remains.'});inventory.recoveredNativeUnits=1;
  if(!books['1CO'][11][2].includes('ܕܡܪܝܐ ܗܘ ܝܫܘܥ'))throw Error('Pinned MarYa passage changed');
 }else{
  const repairs=[['ROM',7,25,26,'Romans 7:26'],['3JN',1,14,15,'III John 1:15'],['REV',12,17,18,'Revelation of John 12:18']];
  for(const [b,c,v,next,label]of repairs){const chapter=books[b][c-1],text=chapter[v-1],delimiter=` [ (${label}) `;
   if(chapter.length!==v||text.split(delimiter).length!==2||!text.endsWith(' ]'))throw Error(`Changed Murdock conversion wrapper ${label}`);
   const [a,z]=text.split(delimiter);chapter[v-1]=a.trim();chapter.push(z.slice(0,-2).trim());inventory.recoveredNativeUnits++;
   conversionLedger.push({sourceSlot:`${b}.${c}.${v}`,targetRefs:[`${b}.${c}.${v}`,`${b}.${c}.${next}`],basis:'Explicit native-reference label in appended text and the original archive errata log. Converter-added outer wrapper/reference text becomes metadata; all English words and authorial punctuation/styles content remain.'});
  }
 }
 const canonContext={window:{}};vm.runInNewContext(fs.readFileSync(path.join(ROOT,'data/canon.js'),'utf8'),canonContext);
 const exception=(b,c,note)=>{versification[b]||={};versification[b][c]={source:books[b][c-1].length,canon:canonContext.window.MARANATHA_CANON.books.find(x=>x.id===b).chapters[c-1],comparisonUnavailable:true,note};};
 exception('ROM',14,'This witness places the doxology at Romans 16:25–27; WEB places it at 14:24–26. Reference/content placement differs.');
 if(id==='murdock'){
  exception('ROM',7,'Murdock retains native verse 26, appended into 25 in the distributed KJV-shaped module. Native source labels are restored from explicit conversion metadata.');
  exception('3JN',1,'Murdock retains native verse 15 separately from 14. Other editions use different verse boundaries.');
  exception('REV',12,'Murdock retains native Revelation 12:18; other editions include this material at 13:1.');
  exception('REV',13,'The Revelation 12:18 / 13:1 placement differs between these witnesses.');
 }
 for(const [b,chs]of Object.entries(books))chs.forEach((chapter,c)=>chapter.forEach((text,v)=>{inventory.records++;if(!text){inventory.emptyRefs.push(`${b}.${c+1}.${v+1}`);verseMetadata[b]||={};verseMetadata[b][c+1]||={};verseMetadata[b][c+1][v+1]={status:'source-gap',note:'The distributed module has no main text in this indexed slot. It has not been filled from another edition; whether this is omission or a boundary residue requires source verification.'};}}));
 if(inventory.records!==(id==='peshitta'?7957:7960)||inventory.footnotes!==(id==='murdock'?19:0))throw Error('Changed NT inventory');
 return{id,short:id==='peshitta'?'PESH':'MUR',label:id==='peshitta'?'Syriac Peshitta (BFBS digital NT)':'James Murdock’s English Syriac NT (1852)',language:id==='peshitta'?'syr':'en',languageName:id==='peshitta'?'Classical Syriac':'English',direction:id==='peshitta'?'rtl':'ltr',scope:'NT',
 sourcePublisher:'CrossWire digital distributor',sourceEdition:id==='peshitta'?'Peshitta 2.0, 2020-02-08; config identifies BFBS 1905 / John Richards':'Murdock 1.2, 2002-01-01; config identifies publication 1852',sourceUrl:manifest.source,sourceManifestSha256:pins[id],sourceArchiveSha256:manifest.archiveSha256,sourceRetrievalDate:manifest.retrieved,license:'Public Domain (as declared by CrossWire)',
 source:id==='peshitta'?'Pinned CrossWire Peshitta module and named John Richards/Roger Pearse upstream witness. Module labels the BFBS text 1905, but its 27-book scope includes later Syriac books; no exact complete print impression is asserted. Original source/markup retained. See data/LICENSE-peshitta.md.':'Pinned CrossWire Murdock module with original appendix/errata and a reproduced 1852 authorial preface. That preface identifies BFBS 1816/1826 with Leusden/Schaaf 1717 and Gutbir consultation; this English work is not a translation of our later Syriac witness. See data/LICENSE-murdock.md.',
 translatedSourceEdition:id==='murdock'?'BFBS Syriac editions London 1816 and 1826; Leusden/Schaaf Leyden 1717 and Gutbir consulted (authorial preface)':undefined,
 conversionNote:id==='peshitta'?'Technical conversion only: chapter/div markup is preserved as raw metadata, not Scripture; explicit verse marker 50 restores the Mark 9:49/50 boundary. Words, punctuation and Unicode stay unchanged. No English substitution or MarYa annotation is added.':'Technical conversion only: GBF footnotes are stored separately; italic styling tags are flattened without removing their words. Three explicitly labelled appended native verse units are restored, with converter framing retained in the ledger/raw source. No English words are replaced or modernized.',
 description:id==='peshitta'?'27-book unpointed Syriac NT, including five later-supplied books identified in edition notes. MarYa remains in the original Syriac. No OT text.':'English Syriac NT translation, with its own earlier textual bases, native verse labels and 19 footnotes. Ten empty indexed slots remain unfilled and need source-boundary verification. Lord/THE LORD wording stays unchanged; no MarYa substitution.',
 nativeVersification:false,nativeReferenceScope:true,collapseSourceAnnotations:true,referenceComparison:'matching published reference identifiers only; not a claim that English was translated from this exact Syriac witness',
 books,sourceNotes,bookProvenance,verseMetadata,versification,conversionLedger,sourceInventory:inventory,sourceStructuralRecords:source.structural.filter(r=>r.raw)};
}
export function serialize(data){return{json:JSON.stringify(data,null,2)+'\n',js:`window.MARANATHA_TRANSLATIONS=window.MARANATHA_TRANSLATIONS||{};\nwindow.MARANATHA_TRANSLATIONS.${data.id}=${JSON.stringify(data,null,2)};\n`};}
function main(){for(const id of ['peshitta','murdock']){const data=loadAndBuild(id);for(const [ext,text]of Object.entries(serialize(data))){const f=path.join(ROOT,`data/${id}.${ext}`);if(process.argv.includes('--check')){if(fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n')!==text)throw Error(`Stale ${id} output`);}else fs.writeFileSync(f,text);}console.log(id,JSON.stringify(data.sourceInventory));}}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main();
