import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]);
const mapping=JSON.parse(fs.readFileSync(path.join(root,'data/lxx-swete-alignment.json'),'utf8'));
const native=JSON.parse(fs.readFileSync(path.join(root,'data/lxx-swete.json'),'utf8'));
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'verse-mapping.js'),'utf8'),ctx);
let failures=0;
function check(name,mutate,state){try{const m=structuredClone(mapping);if(mutate)mutate(m);const r=ctx.window.MARANATHA_VERSE_MAPPING.createResolver(m,{native});assert.equal(r.resolveTarget('GEN',1,1).state,state);console.log('PASS '+name);}catch(e){failures++;console.log('FAIL '+name+': '+e.message.slice(0,140).split('\n')[0]);}}
check('control-valid-proposal',null,'correspondence');
check('duplicate-source-fails-closed-in-target-view',m=>m.entries.push(structuredClone(m.entries[0])),'ambiguous-metadata');
check('duplicate-group-id-with-conflicting-source',m=>{const g=structuredClone(m.groups[0]);g.sources=structuredClone(m.groups[1].sources);m.groups.push(g);},'ambiguous-metadata');
check('mapped-and-negatively-asserted-target',m=>m.negativeAssertions.push({target:{book:'GEN',chapter:1,verse:1},attestation:'Synthetic conflict fixture only',provenance:{source:'synthetic fixture only'}}),'ambiguous-metadata');
check('conflicting-negative-target-claims',m=>{m.groups=m.groups.filter(g=>g.id!==m.groups[0].id);m.entries=m.entries.filter(e=>e.groupId!==mapping.groups[0].id);m.negativeAssertions=[{target:{book:'GEN',chapter:1,verse:1},attestation:'Synthetic fixture A',provenance:{source:'synthetic A'}},{target:{book:'GEN',chapter:1,verse:1},attestation:'Synthetic fixture B',provenance:{source:'synthetic B'}}];},'ambiguous-metadata');
console.log('independent-runtime-probe: '+failures+' failures');process.exitCode=failures?1:0;
