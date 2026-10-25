const test=require('node:test'),assert=require('node:assert/strict');
const R=require('../src/DecisionRepository.gs'),D=require('../src/DecisionDomain.gs');
const sample=()=>({decisionId:'D1',candidatureId:'C1',autorite:'Autorité fictive',date:'2026-10-25',
 resultat:'AJOURNEMENT',referencePV:'PV-1',justificatifDriveId:'TEST-FILE',
 competenceVerifiee:false,justificatifVerifie:false,candidatureVerifiee:false});
const proposal=()=>D.propose(sample(),[]);
test('ligne brouillon alignée sur les colonnes',()=>{
 const row=R.toRow(proposal().decision,'2026-10-25T08:00:00Z');
 assert.equal(row.length,R.DECISION_HEADERS.length);assert.equal(row[10],'BROUILLON');
 assert.equal(row[7],'non');
});
test('interdit de rattacher une décision à une candidature inconnue',()=>{
 assert.throws(()=>R.validateSnapshot([['C2']],[],[],proposal()),/inconnue/);
});
test('identifiants décision en double refusés',()=>{
 assert.throws(()=>R.validateSnapshot([['C1']],[['D1']],[],proposal()),/déjà présente/);
});
test('historique audit déjà existant bloque la reprise',()=>{
 assert.throws(()=>R.validateSnapshot([['C1']],[],[['E1','','D1']],proposal()),/rapprochement manuel/);
});
test('référentiel valide permet préparation mais ne modifie aucune entrée',()=>{
 const candidates=[['C1']],decisions=[],audit=[],before=JSON.stringify({candidates,decisions,audit});
 assert.equal(R.validateSnapshot(candidates,decisions,audit,proposal()),true);
 assert.equal(JSON.stringify({candidates,decisions,audit}),before);
});
