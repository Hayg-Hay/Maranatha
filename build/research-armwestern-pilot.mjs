// Research-only direct byte/index probe; never writes application Scripture.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
const base = 'build/sources/armwestern';
const digest = b => crypto.createHash('sha256').update(b).digest('hex');
assert.equal(digest(fs.readFileSync(`${base}/ArmWestern.zip`)), 'bc273232f6b822b9d957fb318396b7863aa5bba9cae3e8e90c108808dd9916f2', 'Pinned module archive changed');
const moduleDir = `${base}/module/modules/texts/ztext/armwestern`;
const index = fs.readFileSync(`${moduleDir}/nt.bzv`), blockIndex = fs.readFileSync(`${moduleDir}/nt.bzs`), compressed = fs.readFileSync(`${moduleDir}/nt.bzz`);
assert.equal(index.length % 10, 0); assert.equal(blockIndex.length % 12, 0);
const blocks = [];
for (let i=0;i<blockIndex.length;i+=12) {
  const offset=blockIndex.readUInt32LE(i), size=blockIndex.readUInt32LE(i+4), length=blockIndex.readUInt32LE(i+8);
  assert(offset+size<=compressed.length);
  const block=zlib.inflateSync(compressed.subarray(offset,offset+size)); assert.equal(block.length,length); blocks.push(block);
}
function entry(slot) {
  const at=slot*10; assert(at+10<=index.length);
  const block=index.readUInt32LE(at), offset=index.readUInt32LE(at+4), length=index.readUInt16LE(at+8);
  if (!length)return {slot,block,offset,length,raw:''};
  assert(block<blocks.length&&offset+length<=blocks[block].length);
  return {slot,block,offset,length,raw:new TextDecoder('utf-8',{fatal:true}).decode(blocks[block].subarray(offset,offset+length))};
}
const canon=JSON.parse(fs.readFileSync('data/kjv.json','utf8')).books;
const ids='MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
const cache=JSON.parse(fs.readFileSync(`${base}/armwestern.source.json`,'utf8'));
const swordNames='Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet 2Pet 1John 2John 3John Jude Rev'.split(' ');
const cachedBooks=Object.fromEntries(ids.map((id,i)=>[id,cache.books[swordNames[i]]]));
const compact = s => s.replace(/\s+/g,' ').trim();
const raw={}, empty=[], mismatches=[], structural=[];
let slot=0;
structural.push(entry(slot++),entry(slot++));
for (const id of ids) {
  structural.push({book:id,...entry(slot++)}); raw[id]=[];
  for (let c=0;c<canon[id].length;c++) {
    structural.push({book:id,chapter:c+1,...entry(slot++)}); raw[id][c]=[];
    for (let v=0;v<canon[id][c].length;v++) {
      const record=entry(slot++); raw[id][c].push(record);
      const ref=`${id}.${c+1}.${v+1}`, old=cachedBooks[id][c]?.[v] ?? '';
      if(!record.raw)empty.push(ref);
      if(compact(record.raw)!==compact(old))mismatches.push({ref,cache:old,module:record.raw,index:record});
    }
  }
}
assert.equal(slot*10,index.length);
// Word-identification anchors only; neither matching cache text nor an absent
// mismatch proves a source verse's reference correct. Candidate print columns
// stay empty until they have been read from an identified witness.
const differences=new Set(mismatches.map(m=>m.ref));
const anchors=[];
function anchor(id,c,preferred) {
  for(let v=preferred;v<=raw[id][c-1].length;v++) {
    const ref=`${id}.${c}.${v}`, record=raw[id][c-1][v-1];
    if(record.raw&&!differences.has(ref)&&!anchors.some(a=>a.moduleSlot===ref)) {
      anchors.push({moduleSlot:ref,raw:record.raw,comparisonForm:record.raw.normalize('NFC').toLowerCase().replaceAll('և','եւ').replace(/\s+/g,' ').trim(),normalization:'NFC, lowercase, Armenian ligature և -> եւ, whitespace only; no vowel/spelling substitution',witness:null,witnessPage:null,witnessText:null,differences:null,verdict:'Candidate wording anchor; reference not independently certified.'}); return;
    }
  }
  throw Error(`No candidate fingerprint anchor ${id}.${c}`);
}
for(const id of ids)anchor(id,1,3);
for(const id of ids.slice(0,13))anchor(id,Math.ceil(raw[id].length/2),5);
assert.equal(anchors.length,40);
fs.mkdirSync('build/reviews',{recursive:true});
fs.writeFileSync('build/reviews/armwestern-fingerprint-sample.json',JSON.stringify({status:'40 module wording anchors prepared; print comparisons pending. Never modify Scripture with comparison normalization.',anchors},null,2)+'\n');
const selected={JHN:{6:[50,51,52,53,69,70,71]},MRK:{8:[37,38],9:[1,2,48,49,50]},'2CO':{2:[1,2],6:[1,2]}};
const pilot=[];
for(const [id,chapters]of Object.entries(selected))for(const [c,verses]of Object.entries(chapters))for(const v of verses)pilot.push({ref:`${id}.${c}.${v}`,cache:cachedBooks[id][Number(c)-1][v-1],...raw[id][Number(c)-1][v-1]});
const paths=['ArmWestern.zip','module/mods.d/armwestern.conf','module/modules/texts/ztext/armwestern/nt.bzs','module/modules/texts/ztext/armwestern/nt.bzv','module/modules/texts/ztext/armwestern/nt.bzz'];
const manifest={source:'https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/ArmWestern.zip',retrieved:'2026-10-09',files:paths.map(p=>({path:p,size:fs.statSync(path.join(base,p)).size,sha256:digest(fs.readFileSync(path.join(base,p)))}))};
fs.writeFileSync(`${base}/pilot-source-files.json`,JSON.stringify(manifest,null,2)+'\n');
fs.mkdirSync('build/reviews',{recursive:true});
fs.writeFileSync('build/reviews/armwestern-raw-pilot.json',JSON.stringify({status:'Raw comparison only; exact print witness not established. Cache includes committed repairs; differences are not automatically defects.',cacheSha256:digest(fs.readFileSync(`${base}/armwestern.source.json`)),manifest,blocks:blocks.length,indexRecords:slot,empty,mismatchCount:mismatches.length,mismatches,pilot,structuralWithText:structural.filter(r=>r.raw)},null,2)+'\n');
console.log(JSON.stringify({blocks:blocks.length,indexRecords:slot,archiveSha256:manifest.files[0].sha256,empty,mismatchCount:mismatches.length,pilot},null,2));
