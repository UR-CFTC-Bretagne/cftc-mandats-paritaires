const test=require('node:test'),assert=require('node:assert/strict');
const d=require('../src/ImportDomain.gs');
const headers=['Horodateur','Nom','Prénom','Adresse e-mail','Organisme'];
const aliases={date:['Horodateur'],nom:['Nom'],prenom:['Prénom'],courriel:['Adresse e-mail'],instance:['Organisme']};
test('reconnaît les en-têtes',()=>assert.deepEqual(d.mapping(headers,{},aliases).errors,[]));
test('bloque les colonnes obligatoires absentes',()=>assert.ok(d.mapping(['Nom'],{},aliases).errors.length>=3));
test('valide un dossier complet',()=>assert.deepEqual(d.record(['2026-01-01','Martin','Alex','alex@example.org','CESER'],{date:0,nom:1,prenom:2,courriel:3,instance:4},'1:2').errors,[]));
test('rejette les courriels invalides',()=>assert.ok(d.record(['2026-01-01','Martin','Alex','invalid'],{date:0,nom:1,prenom:2,courriel:3},'1:2').errors.length));
test('import puis synchronisation idempotente',()=>{const r=d.record(['2026-01-01','Martin','Alex','alex@example.org'],{date:0,nom:1,prenom:2,courriel:3},'1:2');assert.equal(d.evaluate(r,{},{}).action,'IMPORT');assert.equal(d.evaluate(r,{}, {'1:2':true}).action,'IGNORE');});
test('refuse le rapprochement de personnes différentes',()=>{const r=d.record(['2026-01-01','Martin','Alex','alex@example.org'],{date:0,nom:1,prenom:2,courriel:3},'1:2');assert.equal(d.evaluate(r,{'alex@example.org':[{id:'X',nom:'Autre',prenom:'Alex'}]},{}).action,'REJET');});
test('refuse les correspondances multiples',()=>{const r=d.record(['2026-01-01','Martin','Alex','alex@example.org'],{date:0,nom:1,prenom:2,courriel:3},'1:2');assert.equal(d.evaluate(r,{'alex@example.org':[{id:'1'},{id:'2'}]},{}).action,'REJET');});

test('clé canonique identique indépendamment de la position de ligne',()=>{
 const one=d.record(['2026-01-01','Martin','Alex','alex@example.org'],{date:0,nom:1,prenom:2,courriel:3},'A');
 const two=d.record(['2026-01-01','Martin','Alex','alex@example.org'],{date:0,nom:1,prenom:2,courriel:3},'B');
 assert.equal(d.identityKey(one.value),d.identityKey(two.value));
});
test('clé canonique normalise la casse et les accents',()=>{
 assert.equal(d.identityKey({date:'2026-01-01',nom:'ÉVRARD',prenom:'Zoé',courriel:'ZOE@example.org'}),
 d.identityKey({date:'2026-01-01',nom:'evrard',prenom:'zoe',courriel:'zoe@example.org'}));
});
test('rejet sécurisé de deux réponses indiscernables',()=>{
 const r=d.record(['2026-01-01','Martin','Alex','alex@example.org'],{date:0,nom:1,prenom:2,courriel:3},'key');
 const result=d.decideBatch([r,r],{},{});
 assert.deepEqual(result.map(x=>x.action),['REJET','REJET']);
});
test('des dates différentes produisent des identités de soumission distinctes',()=>{
 const a={date:'2026-01-01T09:00:00',nom:'Martin',prenom:'Alex',courriel:'alex@example.org'};
 const b={...a,date:'2026-01-02T09:00:00'};
 assert.notEqual(d.identityKey(a),d.identityKey(b));
});

test('détecte des Source_ID dupliqués dans le référentiel',()=>{
 assert.deepEqual(d.duplicateSourceIds(['a','b','a','b','c']),['a','b']);
});
test('identifie les audits manquants après interruption',()=>{
 assert.deepEqual(d.missingAudits(['a','b','b','c'],['a','c']),['b']);
});
test('ne restaure pas deux fois un audit réparé',()=>{
 assert.deepEqual(d.missingAudits(['a','b'],['a','b']),[]);
});
