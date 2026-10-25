const test=require('node:test'),assert=require('node:assert/strict');
const A=require('../src/DataAccess.gs');
const context={principalId:'AGENT-TEST'};
const make=({authorized=true,audited=true,rows=[['C1','P1','REÇUE']]}={})=>{
 let reads=0,checks=0,events=[];
 const service=A.create({
  authorize:()=>{checks++;return authorized},
  readTable:()=>{reads++;return {headers:['CAND_ID','PERSONNE_ID','Statut'],rows}},
  audit:event=>{events.push(event);return audited}
 });
 return {service,reads:()=>reads,checks:()=>checks,events};
};
test('consultation autorisée journalisée et projection par colonnes',()=>{
 const d=make(),r=d.service.get('candidatures','C1',context);
 assert.equal(r.CAND_ID,'C1');assert.equal(r.PERSONNE_ID,'P1');
 assert.equal(d.reads(),1);assert.equal(d.events.length,1);
 assert.equal(Object.isFrozen(r),true);
});
test('aucune lecture sans autorisation',()=>{
 const d=make({authorized:false});
 assert.throws(()=>d.service.get('candidatures','C1',context),/Accès refusé/);
 assert.equal(d.reads(),0);assert.equal(d.events.length,0);
});
test('identité absente rejetée avant toute lecture',()=>{
 const d=make();assert.throws(()=>d.service.get('candidatures','C1',{}),/Identité/);
 assert.equal(d.checks(),0);
});
test('ressource et identifiant invalides rejetés',()=>{
 const d=make();
 assert.throws(()=>d.service.get('audit','C1',context),/Ressource/);
 assert.throws(()=>d.service.get('candidatures','../C1',context),/Identifiant/);
});
test('audit non disponible : lecture non restituée',()=>{
 const d=make({audited:false});
 assert.throws(()=>d.service.get('candidatures','C1',context),/Audit indisponible/);
});
test('identifiant dupliqué bloqué',()=>{
 const d=make({rows:[['C1','P1','REÇUE'],['C1','P2','REÇUE']]});
 assert.throws(()=>d.service.get('candidatures','C1',context),/dupliqué/);
});
test('absence de dossier renvoie null et journalise la consultation',()=>{
 const d=make();assert.equal(d.service.get('candidatures','INCONNU',context),null);
 assert.equal(d.events[0].resultat,'ABSENT');
});
test('un adaptateur permissif ou incomplet est rejeté',()=>{
 assert.throws(()=>A.create({readTable:()=>[]}),/obligatoires/);
});
