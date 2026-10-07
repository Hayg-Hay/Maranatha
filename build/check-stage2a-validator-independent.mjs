import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]);
const {validateMapping}=await import(pathToFileURL(path.join(root,'build/validate-verse-mapping.mjs')).href);
const base=JSON.parse(fs.readFileSync(path.join(root,'data/lxx-swete-alignment.json'),'utf8'));
const native=JSON.parse(fs.readFileSync(path.join(root,'data/lxx-swete.json'),'utf8'));
let failures=0;
function check(name,mutate,expect){const m=structuredClone(base);if(mutate)mutate(m);const r=validateMapping(m,{native,root});const okay=r.ok===expect;if(!okay)failures++;console.log(`${okay?'PASS':'FAIL'} ${name}: validator=${r.ok} ${r.errors.slice(0,2).join('; ')}`);}
check('valid-proposal',null,true);
check('verified-top-without-human',m=>m.status='verified',false);
check('verified-group-without-human',m=>m.groups[0].status='verified',false);
check('verified-entry-without-human',m=>m.entries[0].status='verified',false);
check('invented-evidence-row',m=>m.entries[0].provenance.rowId='does-not-exist',false);
check('wrong-bound-text-hashes',m=>Object.keys(m.entries[0].provenance.textHashes).forEach(k=>m.entries[0].provenance.textHashes[k]='0'.repeat(64)),false);
check('unknown-top-status',m=>m.status='bogus',false);
check('overlapping-target-groups',m=>{m.groups[1].targets=structuredClone(m.groups[0].targets);m.entries[1].to=structuredClone(m.groups[0].targets);},false);
console.log('independent-validator-probe: '+failures+' failures');process.exitCode=failures?1:0;
