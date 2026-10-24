const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const root=path.join(__dirname,'..');
function load(name,globalName){
 const context=vm.createContext({});
 vm.runInContext(fs.readFileSync(path.join(root,'src',name),'utf8'),context);
 return Array.from(vm.runInContext(globalName,context));
}
const configContext=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'src','Config.gs'),'utf8'),configContext);
const config=vm.runInContext('MANDATS_CONFIG',configContext);
const documentation=fs.readFileSync(path.join(root,'docs','MODELE-DONNEES.md'),'utf8');
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');

const schemas=[
 ['Personnes',Array.from(config.PERSON_HEADERS)],
 ['Candidatures',Array.from(config.CAND_HEADERS)],
 ['Audit_Imports',Array.from(config.AUDIT_HEADERS)],
 ['Instances',load('InstanceRegistry.gs','MandatsInstanceRegistry.HEADERS')],
 ['Exigences_instances',load('InstanceRequirements.gs','MandatsInstanceRequirements.HEADERS')],
 ['Pieces_candidatures',load('DocumentEvidence.gs','MandatsDocumentEvidence.HEADERS')]
];
for (const [table,headers] of schemas){
 test('modèle documenté : '+table,()=>{
  const line=documentation.split('\n').find(s=>s.startsWith('| `'+table+'` |'));
  assert.ok(line,'Table absente du dictionnaire : '+table);
  // All headers must appear in the contract line in the correct order.
  let position=-1;
  for(const header of headers){
   const index=line.indexOf('`'+header+'`',position+1);
   assert.ok(index>position,'Colonne absente ou mal ordonnée : '+table+'.'+header);
   position=index;
  }
 });
}
test('README référence explicitement le dictionnaire des données',()=>{
 assert.match(readme,/docs\/MODELE-DONNEES\.md/);
});
