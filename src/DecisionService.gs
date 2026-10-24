/** US-003 — Brouillons de décision sur classeur TEST uniquement.
 * No official designation and no Gmail.
 */
const MandatsDecisionService=(()=>{
 const Repo=MandatsDecisionRepository,Domain=MandatsDecisionDomain;
 function context(){
  const settings=MandatsImportSettings.read();
  if(!settings.sourceId||!settings.targetId||settings.sourceId===settings.targetId)
    throw Error('Source et TEST doivent être distincts');
  return {book:SpreadsheetApp.openById(settings.targetId)};
 }
 function snapshot(book){
  return {
   candidates:MandatsSheetsRepository.readTable(book.getSheetByName('Candidatures'),MANDATS_CONFIG.CAND_HEADERS),
   decisions:MandatsSheetsRepository.readTable(book.getSheetByName('Decisions'),Repo.DECISION_HEADERS),
   audits:MandatsSheetsRepository.readTable(book.getSheetByName('Audit_Decisions'),Repo.AUDIT_HEADERS)
  };
 }
 function simulate(input){
  const proposed=Domain.propose(input,[]);
  const {book}=context(),s=snapshot(book);
  Repo.validateSnapshot(s.candidates,s.decisions,s.audits,proposed);
  return {action:'PREPARER_BROUILLON',decisionId:proposed.decision.decisionId,
    resultat:proposed.decision.resultat,designationAutorisee:false,
    notificationAutorisee:false};
 }
 function saveDraftTest(input,actor){
  if(PropertiesService.getScriptProperties().getProperty('ALLOW_TEST_DECISION_WRITES')!=='YES')
    throw Error('Écriture de décisions TEST non autorisée');
  if(typeof actor!=='string'||!actor.trim())throw Error('Acteur technique requis');
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(30000))throw Error('Une autre opération est en cours');
  try{
   const {book}=context(),proposed=Domain.propose(input,[]);
   // Validate against the existing TEST-only candidate registry before modifying tables.
   const initial=snapshot(book);
   Repo.validateSnapshot(initial.candidates,initial.decisions,initial.audits,proposed);
   const decisions=MandatsSheetsRepository.ensureTable(book,'Decisions',Repo.DECISION_HEADERS);
   const audit=MandatsSheetsRepository.ensureTable(book,'Audit_Decisions',Repo.AUDIT_HEADERS);
   const now=new Date(),eventId=Utilities.getUuid();
   // Intent first: a partial failure blocks replay, requiring manual reconciliation.
   audit.appendRow([eventId,now,proposed.decision.decisionId,'CREATION_BROUILLON',actor.trim(),
      'Nouvelle décision','INTENTION']);
   decisions.appendRow(Repo.toRow(proposed.decision,now));
   audit.appendRow([Utilities.getUuid(),new Date(),proposed.decision.decisionId,
      'CREATION_BROUILLON',actor.trim(),'Nouvelle décision','TERMINE']);
   return {decisionId:proposed.decision.decisionId,etat:'BROUILLON',designationAutorisee:false};
  }finally{lock.releaseLock();}
 }
 return Object.freeze({simulate,saveDraftTest});
})();
