// Source research only: never generates application Scripture or assumes
// matching KJV slot counts certify Syriac reference/content correspondence.
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const base='build/sources/peshitta', mod=`${base}/module/modules/texts/ztext/peshitta`;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(sha(fs.readFileSync(`${base}/Peshitta.zip`)),'badce0aa0a9b70a9c81891ed48d5a9e86de1e24d12ad4ad378e060e03cabc7b9','Pinned Peshitta archive changed');
const config=fs.readFileSync(`${base}/module/mods.d/peshitta.conf`,'utf8');
assert(config.includes('Versification=KJV')); assert(config.includes('DistributionLicense=Public Domain'));
const index=fs.readFileSync(`${mod}/nt.bzv`), bi=fs.readFileSync(`${mod}/nt.bzs`), compressed=fs.readFileSync(`${mod}/nt.bzz`),blocks=[];
assert.equal(index.length%10,0);assert.equal(bi.length%12,0);
for(let i=0;i<bi.length;i+=12){const offset=bi.readUInt32LE(i),size=bi.readUInt32LE(i+4),expected=bi.readUInt32LE(i+8);assert(offset+size<=compressed.length);const block=zlib.inflateSync(compressed.subarray(offset,offset+size));assert.equal(block.length,expected);blocks.push(block);}
function entry(slot){const at=slot*10;assert(at+10<=index.length);const block=index.readUInt32LE(at),offset=index.readUInt32LE(at+4),length=index.readUInt16LE(at+8);if(!length)return{slot,block,offset,length,raw:''};assert(block<blocks.length&&offset+length<=blocks[block].length);return{slot,block,offset,length,raw:new TextDecoder('utf-8',{fatal:true}).decode(blocks[block].subarray(offset,offset+length))};}
const canon=JSON.parse(fs.readFileSync('data/kjv.json','utf8')).books;
const ids='MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
const books={},empty=[],tags={},structural=[],samples=[];
let cursor=0,verses=0,marks=0,syriacLetters=0;
for(let i=0;i<2;i++)structural.push(entry(cursor++));
for(const id of ids){structural.push({book:id,...entry(cursor++)});let text=0,total=0;
 for(let c=0;c<canon[id].length;c++){structural.push({book:id,chapter:c+1,...entry(cursor++)});for(let v=0;v<canon[id][c].length;v++){
  const e=entry(cursor++),ref=`${id}.${c+1}.${v+1}`;total++;verses++;if(e.raw)text++;else empty.push(ref);
  for(const m of e.raw.matchAll(/<\/?([\w:-]+)/g))tags[m[1]]=(tags[m[1]]||0)+1;
  marks+=[...e.raw.matchAll(/[\u0730-\u074A]/g)].length;syriacLetters+=[...e.raw.matchAll(/[\u0710-\u072F]/g)].length;
  if(['1CO.12.3','ROM.10.9','1CO.8.6','PHP.2.11','2PE.1.1','2JN.1.1','3JN.1.1','JUD.1.1','REV.1.1','MAT.1.1','JHN.7.53','JHN.8.1','LUK.22.17','LUK.22.18','MRK.8.38','MRK.9.1','MRK.9.2','MRK.9.49','MRK.9.50'].includes(ref))samples.push({ref,...e,containsMarya:e.raw.includes('ܡܪܝܐ')});
 }}books[id]={chapters:canon[id].length,slots:total,nonempty:text};}
assert.equal(cursor*10,index.length);
const otIndex=fs.readFileSync(`${mod}/ot.bzv`);assert.equal(otIndex.length%10,0);let otNonempty=0;for(let i=0;i<otIndex.length;i+=10)if(otIndex.readUInt16LE(i+8))otNonempty++;
const paths=['Peshitta.zip','module/mods.d/peshitta.conf',...['nt','ot'].flatMap(t=>['bzs','bzv','bzz'].map(ext=>`module/modules/texts/ztext/peshitta/${t}.${ext}`))];
const manifest={source:'https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/Peshitta.zip',retrieved:'2026-10-09',files:paths.map(path=>({path,size:fs.statSync(`${base}/${path}`).size,sha256:sha(fs.readFileSync(`${base}/${path}`))}))};
fs.writeFileSync(`${base}/source-files.json`,JSON.stringify(manifest,null,2)+'\n');
fs.mkdirSync('build/reviews',{recursive:true});
const report={status:'Raw KJV-shaped slot inventory only; independent reference/fidelity audit still required.',manifest,config,ntBlocks:blocks.length,indexRecords:cursor,verses,books,empty,tags,marks,syriacLetters,otNonempty,structuralWithText:structural.filter(s=>s.raw),samples};
fs.writeFileSync('build/reviews/peshitta-raw-probe.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({archiveSha256:manifest.files[0].sha256,ntBlocks:blocks.length,verses,booksWithText:Object.keys(books).filter(id=>books[id].nonempty),empty,tags,marks,otNonempty,samples:samples.filter(s=>['1CO.12.3','ROM.10.9'].includes(s.ref))},null,2));
