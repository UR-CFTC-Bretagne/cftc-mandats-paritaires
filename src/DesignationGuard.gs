/** US-004 — contrôle pur et conservateur des transitions de désignation.
 * Ne confère aucune compétence décisionnelle et ne génère aucun document.
 */
const MandatsDesignationGuard=(()=>{
 const STATES=Object.freeze(['BROUILLON','EN_REVUE','VALIDEE','REFUSEE','AJOURNEE']);
 const TRANSITIONS=Object.freeze({
  BROUILLON:Object.freeze(['EN_REVUE']),
  EN_REVUE:Object.freeze(['VALIDEE','REFUSEE','AJOURNEE']),
  VALIDEE:Object.freeze([]),REFUSEE:Object.freeze([]),AJOURNEE:Object.freeze([])
 });
 const fail=reason=>Object.freeze({allowed:false,reason,officialDocumentAllowed:false,notificationAllowed:false});
 function checkTransition(from,to,decision,authorityRules){
  if(!STATES.includes(from)||!STATES.includes(to))return fail('ETAT_INCONNU');
  if(!TRANSITIONS[from].includes(to))return fail('TRANSITION_INTERDITE');
  if(!decision||typeof decision!=='object')return fail('DECISION_ABSENTE');
  if(to==='VALIDEE'||to==='REFUSEE'||to==='AJOURNEE'){
   if(decision.resultat!==({VALIDEE:'VALIDATION',REFUSEE:'REFUS',AJOURNEE:'AJOURNEMENT'})[to])
    return fail('RESULTAT_INCOMPATIBLE');
   if(decision.competenceVerifiee!==true||decision.justificatifVerifie!==true||
      decision.candidatureVerifiee!==true)return fail('DECISION_NON_VERIFIEE');
   if(!authorityRules||authorityRules.instanceValidee!==true||
      authorityRules.autoriteCompetenteVerifiee!==true||
      authorityRules.justificatifConformeInstance!==true)return fail('EXIGENCES_INSTANCE_NON_VERIFIEES');
  }
  return Object.freeze({allowed:true,reason:'TRANSITION_AUTORISEE',
   officialDocumentAllowed:false,notificationAllowed:false});
 }
 function canPrepareOfficialDocument(decision,state,authorityRules){
  if(state!=='VALIDEE')return fail('DECISION_NON_VALIDEE');
  if(!decision||decision.resultat!=='VALIDATION')return fail('RESULTAT_NON_VALIDANT');
  if(decision.competenceVerifiee!==true||decision.justificatifVerifie!==true||
     decision.candidatureVerifiee!==true)return fail('DECISION_NON_VERIFIEE');
  if(!authorityRules||authorityRules.instanceValidee!==true||
     authorityRules.autoriteCompetenteVerifiee!==true||
     authorityRules.justificatifConformeInstance!==true)return fail('EXIGENCES_INSTANCE_NON_VERIFIEES');
  // The remaining US-004 workflow (signing and publication) is not implemented.
  return Object.freeze({allowed:true,reason:'CONTROLES_PREALABLES_SATISFAITS',
   officialDocumentAllowed:false,notificationAllowed:false});
 }
 return Object.freeze({STATES,TRANSITIONS,checkTransition,canPrepareOfficialDocument});
})();
if(typeof module!=='undefined')module.exports=MandatsDesignationGuard;
