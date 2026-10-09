// Strict raw zText reader for the pinned NT modules. This exposes source
// records/structural markup; each importer separately interprets boundaries.
import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
export const NT_IDS='MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');
export function readSwordNt(directory,counts,encoding='utf-8') {
 const bi=fs.readFileSync(`${directory}/nt.bzs`),ix=fs.readFileSync(`${directory}/nt.bzv`),zz=fs.readFileSync(`${directory}/nt.bzz`),blocks=[];
 assert.equal(bi.length%12,0);assert.equal(ix.length%10,0);
 for(let i=0;i<bi.length;i+=12){const start=bi.readUInt32LE(i),size=bi.readUInt32LE(i+4),expected=bi.readUInt32LE(i+8);assert(start+size<=zz.length);const b=zlib.inflateSync(zz.subarray(start,start+size));assert.equal(b.length,expected);blocks.push(b);}
 function entry(slot){const at=slot*10;assert(at+10<=ix.length);const block=ix.readUInt32LE(at),offset=ix.readUInt32LE(at+4),length=ix.readUInt16LE(at+8);if(!length)return{slot,block,offset,length,raw:''};assert(block<blocks.length&&offset+length<=blocks[block].length);const bytes=blocks[block].subarray(offset,offset+length);return{slot,block,offset,length,raw:encoding==='latin1'?bytes.toString('latin1'):new TextDecoder(encoding,{fatal:true}).decode(bytes)};}
 const books={},structural=[];let cursor=0;
 structural.push(entry(cursor++),entry(cursor++));
 for(const id of NT_IDS){structural.push({book:id,...entry(cursor++)});books[id]=[];for(let c=0;c<counts[id].length;c++){structural.push({book:id,chapter:c+1,...entry(cursor++)});const rows=[];for(let v=0;v<counts[id][c];v++)rows.push({book:id,chapter:c+1,verse:v+1,...entry(cursor++)});books[id].push(rows);}}
 assert.equal(cursor*10,ix.length,'Unexpected NT index extent');return{books,structural,blocks:blocks.length,indexRecords:cursor};
}
