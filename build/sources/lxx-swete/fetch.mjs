import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const get=async url=>{const r=await fetch(url,{headers:{'User-Agent':'Maranatha-source-audit'}});if(!r.ok)throw Error(`${r.status} ${url}`);return r;};
for(const [id,repo,prefix] of [['A','nathans/lxx-swete',''],['B','OpenGreekAndLatin/First1KGreek','data/tlg0527/']]){
 const commit=await (await get(`https://api.github.com/repos/${repo}/commits/HEAD`)).json();
 const tree=await (await get(`https://api.github.com/repos/${repo}/git/trees/${commit.sha}?recursive=1`)).json();
 if(tree.truncated)throw Error('Truncated tree');
 const list=tree.tree.filter(e=>e.type==='blob'&&(e.path.startsWith(prefix)||(!prefix&&true)||/^(license|readme)/i.test(e.path)));
 const files=[];
 for(let i=0;i<list.length;i+=8)await Promise.all(list.slice(i,i+8).map(async e=>{
  const bytes=Buffer.from(await (await get(`https://raw.githubusercontent.com/${repo}/${commit.sha}/${e.path}`)).arrayBuffer());
  const dest=path.join(root,id,e.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);
  files.push({path:e.path,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
 }));
 files.sort((a,b)=>a.path.localeCompare(b.path));
 fs.writeFileSync(path.join(root,`${id}-manifest.json`),JSON.stringify({id,repo,commit:commit.sha,fetched:new Date().toISOString(),files},null,2)+'\n');
 console.log(`${id} ${repo} ${commit.sha} ${files.length} files ${files.reduce((s,f)=>s+f.bytes,0)} bytes`);
}
