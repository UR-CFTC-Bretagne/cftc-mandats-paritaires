const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../src/DecisionDomain.gs');
const input=()=>({decisionId:'DEC-TEST',candidatureId:'C-TEST',autorite:'Autorité de test',
 date:'2026-10-25',resultat:'VALIDATION',referencePV:'PV-TEST',justificatifDriveId:'FILE-TEST',
 competenceVerifiee:false,justificatifVerifie:false,candidatureVerifiee:false});
test('décision complète classée BROUILLON sans désignation',()=>{
 const r=D.propose(input(),[]);assert.equal(r.etat,'BROUILLON');
 assert.equal(r.designationAutorisee,false);assert.equal(r.decision.pretPourRevue,false);
});
test('validation administrative ne produit pas un mandat officiel',()=>{
 const v={...input(),competenceVerifiee:true,justificatifVerifie:true,candidatureVerifiee:true};
 const r=D.propose(v,[]);assert.equal(r.decision.pretPourRevue,true);
 assert.equal(r.designationAutorisee,false);assert.equal(r.notificationAutorisee,false);
});
test('refus et ajournement distincts',()=>{
 for(const resultat of ['REFUS','AJOURNEMENT'])assert.equal(D.propose({...input(),resultat},[]).decision.resultat,resultat);
});
test('résultat non reconnu bloqué',()=>assert.throws(()=>D.validate({...input(),resultat:'ACCORD'}),/non autorisé/));
test('PV manquant bloqué',()=>assert.throws(()=>D.validate({...input(),referencePV:''}),/referencePV/));
test('autorité manquante bloquée',()=>assert.throws(()=>D.validate({...input(),autorite:''}),/autorite/));
test('dates calendaires invalides bloquées',()=>assert.throws(()=>D.validate({...input(),date:'2026-02-30'}),/Date/));
test('ID dupliqué bloqué',()=>assert.throws(()=>D.propose(input(),['DEC-TEST']),/dupliqué/));
test('modification construit un événement d’audit sans exposer les anciennes valeurs',()=>{
 const previous=D.validate(input());const next=D.validate({...input(),resultat:'REFUS'});
 const log=D.auditChange(previous,next,'AGENT-TEST','2026-10-25T10:00:00Z');
 assert.equal(log.action,'REVISION');assert.deepEqual(log.champsModifies,['resultat']);
 assert.equal(JSON.stringify(log).includes('FILE-TEST'),false);
});
test('aucune mutation des données soumises',()=>{
 const v=input(),before=JSON.stringify(v);D.propose(v,[]);assert.equal(JSON.stringify(v),before);
});

test('refuse une formule Sheets dans la référence PV',()=>assert.throws(()=>D.validate({...input(),referencePV:'=IMPORTXML("url")'}),/Valeur interdite/));
test('refuse un texte de décision démarrant par un opérateur Sheets',()=>assert.throws(()=>D.validate({...input(),autorite:'+cmd'}),/Valeur interdite/));
