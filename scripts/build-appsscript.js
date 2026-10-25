#!/usr/bin/env node
/** Assemble an isolated Apps Script package. No deployment or network access. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const target=path.join(root,'dist');
const src=path.join(root,'src');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'appsscript.json'),'utf8'));
if(manifest.runtimeVersion!=='V8'||!Array.isArray(manifest.oauthScopes))
 throw Error('Invalid Apps Script manifest');
const files=fs.readdirSync(src).filter(f=>f.endsWith('.gs')).sort();
if(!files.length)throw Error('No Apps Script sources');
fs.rmSync(target,{recursive:true,force:true});
fs.mkdirSync(target,{recursive:true});
for(const name of files){
 if(!/^[A-Za-z0-9_-]+\.gs$/.test(name))throw Error('Unsafe source filename');
 fs.copyFileSync(path.join(src,name),path.join(target,name));
}
fs.writeFileSync(path.join(target,'appsscript.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Package Apps Script ready: '+files.length+' source files plus manifest');
