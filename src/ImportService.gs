/** US-001 : simulation puis import vers un classeur de TEST distinct. */
const MandatsImportService=(()=>{
 const C=MANDATS_CONFIG,D=MandatsImportDomain;
 const R=MandatsSheetsRepository,S=MandatsImportSettings;
 function makeSourceId(sheetId,value){
  const canonical=D.identityKey(value);
  const digest=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    String(sheetId)+'|'+canonical,Utilities.Charset.UTF_8);
  const hex=digest.map(b=>('0'+(b&255).toString(16)).slice(-2)).join('');
  return 'forms-sha256:'+hex;
 }
 function prepare(){
  const c=S.read(),source=SpreadsheetApp.openById(c.sourceId).getSheetByName(C.SOURCE_SHEET);
  if(!source)throw new Error('Feuille Forms absente : '+C.SOURCE_SHEET);
  const sourceRows=R.rows(source);
  if(!sourceRows.length)throw new Error('Source vide');
  const map=D.mapping(sourceRows[0],c.overrides,C.HEADER_ALIASES);
  if(map.errors.length)throw new Error('En-têtes : '+map.errors.join(' | '));
  const target=SpreadsheetApp.openById(c.targetId);
  const idx=R.loadIndexes(target);
  const records=[];
  sourceRows.slice(1).forEach(r=>{
   if(r.every(cell=>!D.clean(cell)))return;
   const record=D.record(r,map.indices,'');
   record.value.sourceId=makeSourceId(source.getSheetId(),record.value);
   records.push(record);
  });
  const decisions=D.decideBatch(records,idx.people,idx.candidates);
  const items=records.map((record,i)=>({record,decision:decisions[i]}));
  return {target,items};
 }
 function summary(items){
  const counts={IMPORT:0,IGNORE:0,REJET:0};
  items.forEach(x=>counts[x.decision.action]++);
  return {counts,anomalies:items.filter(x=>x.decision.action==='REJET')
    .map(x=>({sourceId:x.record.value.sourceId,motif:x.decision.reason}))};
 }
 function simulation(){
  const report=summary(prepare().items);
  Logger.log(JSON.stringify(report)); // Identifiants techniques et erreurs uniquement
  return report;
 }
 function executeTest(){
  S.assertTestWrites();
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(30000))throw new Error('Synchronisation déjà en cours');
  try{
   const state=prepare(),initial=summary(state.items);
   if(initial.counts.REJET)throw new Error('Import bloqué : '+initial.counts.REJET+' erreur(s), lancer la simulation.');
   const ss=state.target,p=R.ensureTable(ss,C.TARGET_PERSONNES,C.PERSON_HEADERS),
     c=R.ensureTable(ss,C.TARGET_CANDIDATURES,C.CAND_HEADERS),
     a=R.ensureTable(ss,C.TARGET_AUDIT,C.AUDIT_HEADERS);
   const idx=R.indexes(R.readTable(p,C.PERSON_HEADERS),R.readTable(c,C.CAND_HEADERS));
   // Repair an interrupted run where candidate persisted but audit write failed.
   const repaired=R.repairAudit(a,c);
   const now=new Date();let imported=0,skipped=0;
   for(const item of state.items){
    const v=item.record.value,decision=D.evaluate(item.record,idx.people,idx.candidates);
    if(decision.action==='IGNORE'){skipped++;continue;}
    if(decision.action!=='IMPORT')throw new Error('Conflit à la source '+v.sourceId);
    let personId=decision.personId;
    if(!personId){
     personId=Utilities.getUuid();
     p.appendRow([personId,v.nom,v.prenom,v.courriel,'','',now]);
     (idx.people[v.courriel] ||= []).push({id:personId,nom:v.nom,prenom:v.prenom});
    }
    c.appendRow([Utilities.getUuid(),personId,C.SOURCE_KIND,v.sourceId,'',v.date,'Candidature reçue',now]);
    idx.candidates[v.sourceId]=true;
    a.appendRow([now,'IMPORT',v.sourceId,'OK','Candidature enregistrée']);
    imported++;
   }
   return {importees:imported,ignorees:skipped,audits_repares:repaired};
  }finally{lock.releaseLock();}
 }
 return Object.freeze({simulation,executeTest});
})();
function simulerImportCandidatures(){return MandatsImportService.simulation();}
function importerCandidaturesDansTest(){return MandatsImportService.executeTest();}
