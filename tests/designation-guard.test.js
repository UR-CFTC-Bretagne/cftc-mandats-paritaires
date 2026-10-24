const test=require('node:test'),assert=require('node:assert/strict');
const G=require('../src/DesignationGuard.gs');
const decision=()=>({resultat:'VALIDATION',competenceVerifiee:true,justificatifVerifie:true,candidatureVerifiee:true});
const verified=()=>({instanceValidee:true,autoriteCompetenteVerifiee:true,justificatifConformeInstance:true});
test('brouillon vers revue permis sans document officiel',()=>{
 const result=G.checkTransition('BROUILLON','EN_REVUE',{},null);
 assert.equal(result.allowed,true);assert.equal(result.officialDocumentAllowed,false);
});
test('brouillon directement valide : transition interdite',()=>{
 assert.equal(G.checkTransition('BROUILLON','VALIDEE',decision(),verified()).reason,'TRANSITION_INTERDITE');
});
test('transition vérifiée vers validée autorisée sans génération officielle',()=>{
 const r=G.checkTransition('EN_REVUE','VALIDEE',decision(),verified());
 assert.equal(r.allowed,true);assert.equal(r.officialDocumentAllowed,false);assert.equal(r.notificationAllowed,false);
});
test('décision non vérifiée refusée',()=>{
 const v={...decision(),competenceVerifiee:false};
 assert.equal(G.checkTransition('EN_REVUE','VALIDEE',v,verified()).reason,'DECISION_NON_VERIFIEE');
});
test('autorité et justificatif propres à l’instance nécessaires',()=>{
 assert.equal(G.checkTransition('EN_REVUE','VALIDEE',decision(),{...verified(),justificatifConformeInstance:false}).reason,'EXIGENCES_INSTANCE_NON_VERIFIEES');
});
test('refus et ajournement ne sont pas assimilés à validation',()=>{
 for(const [status,resultat] of [['REFUSEE','REFUS'],['AJOURNEE','AJOURNEMENT']]){
  const r=G.checkTransition('EN_REVUE',status,{...decision(),resultat},verified());
  assert.equal(r.allowed,true);assert.equal(r.officialDocumentAllowed,false);
  assert.equal(G.canPrepareOfficialDocument({...decision(),resultat},status,verified()).allowed,false);
 }
});
test('mauvais résultat : transition rejetée',()=>{
 assert.equal(G.checkTransition('EN_REVUE','VALIDEE',{...decision(),resultat:'REFUS'},verified()).reason,'RESULTAT_INCOMPATIBLE');
});
test('un document officiel reste bloqué en brouillon',()=>{
 assert.equal(G.canPrepareOfficialDocument(decision(),'BROUILLON',verified()).officialDocumentAllowed,false);
});
test('contrôles préalables réussis ne déclenchent pas document ni notification',()=>{
 const r=G.canPrepareOfficialDocument(decision(),'VALIDEE',verified());
 assert.equal(r.allowed,true);assert.equal(r.officialDocumentAllowed,false);assert.equal(r.notificationAllowed,false);
});
test('états inconnus et transitions inverses refusés',()=>{
 assert.equal(G.checkTransition('INVALID','VALIDEE',decision(),verified()).reason,'ETAT_INCONNU');
 assert.equal(G.checkTransition('VALIDEE','EN_REVUE',decision(),verified()).reason,'TRANSITION_INTERDITE');
});
