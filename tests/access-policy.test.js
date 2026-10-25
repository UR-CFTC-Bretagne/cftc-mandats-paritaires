const test=require('node:test'),assert=require('node:assert/strict');
const Policy=require('../src/AccessPolicy.gs');
const person={PERSONNE_ID:'P1',Nom:'Exemple',Prénom:'Test',Courriel:'fictif@example.invalid',
  UD_ID:'UD35',Syndicat_ID:'SYND1',secret:'PRIVE'};
const ur={principalId:'UR-1',role:'UR_COORDINATEUR',dossiersRegionauxAutorises:true,decisionsAutorisees:false};
test('coordinateur UR explicitement autorisé lit uniquement les colonnes approuvées',()=>{
 const result=Policy.project(ur,'personnes',person);
 assert.equal(result.PERSONNE_ID,'P1');assert.equal(result.secret,undefined);
 assert.equal(Object.isFrozen(result),true);
});
test('un rôle UR sans attestation régionale ne peut lire le dossier',()=>{
 assert.equal(Policy.authorize({...ur,dossiersRegionauxAutorises:false},'personnes',person),false);
});
test('UD35 autorisée, autre UD rejetée et champ territorial manquant refusé',()=>{
 const p={principalId:'U1',role:'UD_RESPONSABLE',udId:'UD35'};
 assert.equal(Policy.authorize(p,'personnes',person),true);
 assert.equal(Policy.authorize({...p,udId:'UD56'},'personnes',person),false);
 assert.equal(Policy.authorize(p,'candidatures',{CAND_ID:'C1'}),false);
});
test('syndicat rattaché seulement et données inconnues exclues',()=>{
 const p={principalId:'S1',role:'SYNDICAT_RESPONSABLE',syndicatId:'SYND1'};
 assert.equal(Policy.authorize(p,'personnes',person),true);
 assert.equal(Policy.authorize({...p,syndicatId:'AUTRE'},'personnes',person),false);
});
test('mandaté voit seulement ses données et aucun champ supplémentaire',()=>{
 const p={principalId:'M1',role:'MANDATE',personneId:'P1'};
 const result=Policy.project(p,'personnes',person);
 assert.deepEqual(Object.keys(result),['PERSONNE_ID','Nom','Prénom','Courriel']);
 assert.equal(Policy.authorize({...p,personneId:'P2'},'personnes',person),false);
});
test('décisions interdites aux mandataires, UD et UR sans privilège spécifique',()=>{
 const d={DECISION_ID:'D1',CAND_ID:'C1',Resultat:'VALIDATION',Etat:'BROUILLON'};
 assert.equal(Policy.authorize(ur,'decisions',d),false);
 assert.equal(Policy.authorize({principalId:'U1',role:'UD_RESPONSABLE',udId:'UD35'},'decisions',d),false);
 assert.equal(Policy.authorize({...ur,decisionsAutorisees:true},'decisions',d),true);
});
test('tout rôle et dossier absent est refusé par défaut',()=>{
 assert.equal(Policy.authorize({principalId:'T1',role:'ADMIN'},'personnes',person),false);
 assert.equal(Policy.authorize({principalId:'T1',role:'MANDATE'},'personnes',person),false);
 assert.equal(Policy.authorize(ur,'autre',person),false);
 assert.throws(()=>Policy.project(ur,'autre',person),/refusé/);
});
