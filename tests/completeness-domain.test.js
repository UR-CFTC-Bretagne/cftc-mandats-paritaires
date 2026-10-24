const test=require('node:test');
const assert=require('node:assert/strict');
const d=require('../src/CompletenessDomain.gs');
const policy={fields:[
 {key:'nom',label:'Nom',required:true,verify:false},
 {key:'courriel',label:'Courriel',required:true,verify:true},
 {key:'instance',label:'Instance',required:true,verify:false}
],documents:[{key:'accord',label:'Accord requis par instance',required:true}]};
const base=()=>({nom:'Martin',courriel:'alex@example.org',instance:'CESER',documents:{accord:'drive-id'},verified:{courriel:true}});
test('dossier complet et vérifié prêt à instruire',()=>{const r=d.evaluate(base(),policy);assert.equal(r.status,'PRET_A_INSTRUIRE');assert.equal(r.complete,true);});
test('donnée obligatoire absente rend le dossier incomplet',()=>{const p=base();p.nom=' ';const r=d.evaluate(p,policy);assert.equal(r.status,'INCOMPLET');assert.equal(r.missing[0].key,'nom');});
test('pièce obligatoire absente rend le dossier incomplet',()=>{const p=base();delete p.documents.accord;const r=d.evaluate(p,policy);assert.equal(r.missing[0].kind,'DOCUMENT');});
test('champ existant mais non vérifié nécessite revue',()=>{const p=base();p.verified={};assert.equal(d.evaluate(p,policy).status,'A_VERIFIER');});
test('vérification ne remplace jamais une donnée absente',()=>{const p=base();p.courriel='';assert.equal(d.evaluate(p,policy).status,'INCOMPLET');});
test('la fonction ne modifie pas son dossier',()=>{const p=base(),before=JSON.stringify(p);d.evaluate(p,policy);assert.equal(JSON.stringify(p),before);});
test('politique dupliquée refusée',()=>assert.throws(()=>d.evaluate(base(),{fields:[policy.fields[0],policy.fields[0]],documents:[]}),/dupliquée/));
test('pièce optionnelle n’empêche pas l’instruction',()=>assert.equal(d.evaluate(base(),{fields:policy.fields,documents:[{key:'option',label:'Option',required:false}]}).complete,true));
test('aucun document obligatoire sans politique explicite',()=>assert.equal(d.evaluate(base(),{fields:policy.fields,documents:[]}).missingCount,0));

test('une preuve booléenne false reste absente',()=>{const p=base();p.documents.accord=false;const r=d.evaluate(p,policy);assert.equal(r.status,'INCOMPLET');assert.equal(r.missing[0].key,'accord');});
test('une preuve booléenne true reste présente',()=>{const p=base();p.documents.accord=true;assert.equal(d.evaluate(p,policy).missingCount,0);});
