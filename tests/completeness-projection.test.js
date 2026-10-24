const test=require('node:test');
const assert=require('node:assert/strict');
const projection=require('../src/CompletenessProjection.gs');
const domain=require('../src/CompletenessDomain.gs');
const policy={fields:[
 {key:'nom',label:'Nom',required:true},
 {key:'prenom',label:'Prénom',required:true},
 {key:'courriel',label:'Courriel',required:true},
 {key:'date',label:'Date de réception',required:true},
 {key:'instance',label:'Instance sollicitée',required:true}
],documents:[]};
const person=['P-1','Martin','Alex','alex@example.org','','',''];
const app=['C-1','P-1','GOOGLE_FORMS','S-1','','2026-01-01','Candidature reçue',''];
test('projection restitue les données connues et non les colonnes fictives',()=>{
 const row=projection.project(person,app);
 assert.equal(row.nom,'Martin');
 assert.equal(row.instance,'');
 assert.deepEqual(row.documents,{});
});
test('instance non rapprochée => dossier incomplet et non déclaré prêt',()=>{
 const result=projection.inspectRows([person],[app],policy,domain);
 assert.equal(result[0].status,'INCOMPLET');
 assert.equal(result[0].missing[0].key,'instance');
});
test('instance renseignée => dossier prêt à instruire, pas de décision',()=>{
 const updated=[...app];updated[4]='INSTANCE-ID-TEST';
 const result=projection.inspectRows([person],[updated],policy,domain);
 assert.equal(result[0].status,'PRET_A_INSTRUIRE');
});
test('personne absente produit une anomalie explicite, sans faux statut complet',()=>{
 const result=projection.inspectRows([],[app],policy,domain);
 assert.equal(result[0].status,'ANOMALIE_REFERENTIEL');
});
test('refuse les références personne dupliquées',()=>{
 assert.throws(()=>projection.inspectRows([person,person],[app],policy,domain),/dupliqué/);
});
test('refuse les identifiants candidature dupliqués',()=>{
 assert.throws(()=>projection.inspectRows([person],[app,app],policy,domain),/dupliqué/);
});
test('projection ne modifie ni personnes ni candidatures',()=>{
 const before=JSON.stringify({person,app});
 projection.inspectRows([person],[app],policy,domain);
 assert.equal(JSON.stringify({person,app}),before);
});

const instanceRegistry = require('../src/InstanceRegistry.gs');
const validInstances = instanceRegistry.fromRows([['I-1','Instance fictive','Paritaire','oui','oui']]);
test('instance validée et active permet un diagnostic prêt à instruire',()=>{
 const updated=[...app];updated[4]='I-1';
 const r=projection.inspectRows([person],[updated],policy,domain,validInstances);
 assert.equal(r[0].status,'PRET_A_INSTRUIRE');
});
test('identifiant inconnu ne rend jamais un dossier complet',()=>{
 const updated=[...app];updated[4]='inconnu';
 const r=projection.inspectRows([person],[updated],policy,domain,validInstances);
 assert.equal(r[0].status,'INCOMPLET');
 assert.equal(r[0].missing[0].key,'instance');
});
test('instance inactive ou non validée ne rend pas le dossier complet',()=>{
 const updated=[...app];updated[4]='I-2';
 const registry=instanceRegistry.fromRows([['I-2','Instance fictive','Paritaire','non','oui']]);
 assert.equal(projection.inspectRows([person],[updated],policy,domain,registry)[0].status,'INCOMPLET');
 const nonValidated=instanceRegistry.fromRows([['I-2','Instance fictive','Paritaire','oui','non']]);
 assert.equal(projection.inspectRows([person],[updated],policy,domain,nonValidated)[0].status,'INCOMPLET');
});
test('registre vide conserve une approche prudente',()=>{
 const updated=[...app];updated[4]='I-1';
 assert.equal(projection.inspectRows([person],[updated],policy,domain,instanceRegistry.fromRows([]))[0].status,'INCOMPLET');
});

const requirements=require('../src/InstanceRequirements.gs');
test('absence de règles validées interdit prêt à instruire',()=>{
 const row=[...app];row[4]='I-1';
 const r=projection.inspectRows([person],[row],policy,domain,validInstances,requirements.fromRows([]));
 assert.equal(r[0].status,'A_VERIFIER');
 assert.equal(r[0].verificationPending[0].key,'regles_documentaires');
});
test('document requis non présent => incomplet',()=>{
 const row=[...app];row[4]='I-1';
 const rules=requirements.fromRows([['I-1','autorisation','Autorisation','oui','oui']]);
 const r=projection.inspectRows([person],[row],policy,domain,validInstances,rules);
 assert.equal(r[0].status,'INCOMPLET');
 assert.equal(r[0].missing[0].key,'autorisation');
});
test('document facultatif validé permet instruction',()=>{
 const row=[...app];row[4]='I-1';
 const rules=requirements.fromRows([['I-1','info','Information','non','oui']]);
 const r=projection.inspectRows([person],[row],policy,domain,validInstances,rules);
 assert.equal(r[0].status,'PRET_A_INSTRUIRE');
});
