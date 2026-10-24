const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/DriveMetadataAdapter.gs'),'utf8');
function adapter(getFileById){
 const ctx=vm.createContext({DriveApp:{getFileById}});
 vm.runInContext(source,ctx);
 return vm.runInContext('MandatsDriveMetadataAdapter',ctx);
}
test('référence accessible et non supprimée => vraie',()=>{
 assert.equal(adapter(()=>({isTrashed:()=>false})).isAccessibleFile('TEST-1'),true);
});
test('fichier à la corbeille => faux',()=>{
 assert.equal(adapter(()=>({isTrashed:()=>true})).isAccessibleFile('TEST-1'),false);
});
test('erreur accès refusé => faux et aucune exception exposée',()=>{
 assert.equal(adapter(()=>{throw Error('identifiant sensible');}).isAccessibleFile('TEST-1'),false);
});
test('identifiant vide ne consulte pas Drive',()=>{
 let calls=0;const d=adapter(()=>{calls++;return {isTrashed:()=>false};});
 assert.equal(d.isAccessibleFile(' '),false);assert.equal(calls,0);
});
