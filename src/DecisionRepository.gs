/** US-003 — Adaptateur Sheets pour brouillons, sans désignation officielle.
 * API d'écriture conçue uniquement pour un classeur de TEST explicitement autorisé.
 */
const MandatsDecisionRepository=(()=>{
 const DECISION_HEADERS=Object.freeze(['DECISION_ID','CAND_ID','Autorite','Date_decision','Resultat','Reference_PV','Drive_justificatif_ID','Competence_verifiee','Justificatif_verifie','Candidature_verifiee','Etat','Cree_le']);
 const AUDIT_HEADERS=Object.freeze(['EVENT_ID','Date','DECISION_ID','Action','Acteur','Champs','Statut']);
 const toFlag=value=>value===true?'oui':'non';
 function toRow(decision,createdAt){
  if(!decision||!decision.decisionId)throw Error('Décision invalide');
  return [decision.decisionId,decision.candidatureId,decision.autorite,decision.date,
   decision.resultat,decision.referencePV,decision.justificatifDriveId,
   toFlag(decision.competenceVerifiee),toFlag(decision.justificatifVerifiee),
   toFlag(decision.candidatureVerifiee),'BROUILLON',createdAt];
 }
 function validateSnapshot(candidates,decisions,audit,proposal){
  const ids=new Set();
  for(const row of candidates){
   if(!row[0]||ids.has(String(row[0])))throw Error('Référentiel de candidatures incohérent');
   ids.add(String(row[0]));
  }
  if(!ids.has(proposal.decision.candidatureId))throw Error('Candidature de la décision inconnue');
  const decisionIds=new Set();
  for(const row of decisions){
   if(!row[0]||decisionIds.has(String(row[0])))throw Error('Identifiants de décisions incohérents');
   decisionIds.add(String(row[0]));
  }
  if(decisionIds.has(proposal.decision.decisionId))throw Error('Décision déjà présente');
  // If audit has already been written, a retry MUST stop for manual reconciliation.
  if(audit.some(row=>String(row[2])===proposal.decision.decisionId))throw Error('Audit existant : rapprochement manuel nécessaire');
  return true;
 }
 return Object.freeze({DECISION_HEADERS,AUDIT_HEADERS,toRow,validateSnapshot});
})();
if(typeof module!=='undefined')module.exports=MandatsDecisionRepository;
