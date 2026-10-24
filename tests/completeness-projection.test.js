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
