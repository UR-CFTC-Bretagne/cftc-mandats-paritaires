/** US-001 : simulation puis import vers un classeur de TEST distinct. */
const MandatsImportService=(()=>{
 const C=MANDATS_CONFIG,D=MandatsImportDomain;
 const props=()=>PropertiesService.getScriptProperties();
 function config(){
  const p=props(),src=p.getProperty('SOURCE_SPREADSHEET_ID'),dst=p.getProperty('TARGET_TEST_SPREADSHEET_ID');
  if(!src||!dst)throw new Error('Configurer SOURCE_SPREADSHEET_ID et TARGET_TEST_SPREADSHEET_ID');
  if(src===dst)throw new Error('Le référentiel de TEST doit être distinct de la source');
  const overrides={};
  ['date','nom','prenom','courriel','instance'].forEach(k=>overrides[k]=p.getProperty('FORM_HEADER_'+k.toUpperCase())||'');
  return {src,dst,overrides};
 }
 function rows(sh){
  if(!sh||sh.getLastRow()===0)return [];
  return sh.getRange(1,1,sh.getLastRow(),sh.getLastColumn()).getDisplayValues();
 }
 function readTarget(sh,headers){
  if(!sh)return [];
  const data=rows(sh);
  if(data.length&&headers.some((h,i)=>data[0][i]!==h))
   throw new Error('Schéma incompatible : '+sh.getName());
  return data.slice(1);
 }
 function indexes(personRows,candRows){
  const people={},candidates={};
  personRows.forEach(r=>{const email=D.clean(r[3]).toLowerCase();if(email)(people[email] ||= []).push({id:r[0],nom:r[1],prenom:r[2]});});
  candRows.forEach(r=>{if(r[3])candidates[String(r[3])]=true;});
  return {people,candidates};
 }
 function prepare(){
  const c=config(),source=SpreadsheetApp.openById(c.src).getSheetByName(C.SOURCE_SHEET);
  if(!source)throw new Error('Feuille Forms absente : '+C.SOURCE_SHEET);
  const sourceRows=rows(source);
  if(!sourceRows.length)throw new Error('Source vide');
  const map=D.mapping(sourceRows[0],c.overrides,C.HEADER_ALIASES);
  if(map.errors.length)throw new Error('En-têtes : '+map.errors.join(' | '));
  const target=SpreadsheetApp.openById(c.dst);
  const idx=indexes(readTarget(target.getSheetByName(C.TARGET_PERSONNES),C.PERSON_HEADERS),
                    readTarget(target.getSheetByName(C.TARGET_CANDIDATURES),C.CAND_HEADERS));
  const items=[];
  sourceRows.slice(1).forEach((r,i)=>{
   if(r.every(cell=>!D.clean(cell)))return;
   // Clé positionnelle : ne jamais trier, supprimer ou réordonner les réponses du formulaire.
   const record=D.record(r,map.indices,String(source.getSheetId())+':'+String(i+2));
   items.push({record,decision:D.evaluate(record,idx.people,idx.candidates)});
  });
  return {target,items};
 }
 function summary(items){
  const counts={IMPORT:0,IGNORE:0,REJET:0};
  items.forEach(x=>counts[x.decision.action]++);
  return {counts,anomalies:items.filter(x=>x.decision.action==='REJET')
    .map(x=>({sourceId:x.record.value.sourceId,motif:x.decision.reason}))};
 }
 function ensureSheet(ss,name,headers){
  let sh=ss.getSheetByName(name);
  if(!sh){sh=ss.insertSheet(name);sh.getRange(1,1,1,headers.length).setValues([headers]);sh.setFrozenRows(1);}
  else readTarget(sh,headers);
  return sh;
 }
 function simulation(){
  const report=summary(prepare().items);
  Logger.log(JSON.stringify(report)); // Identifiants techniques et erreurs uniquement
  return report;
 }
 function executeTest(){
  if(props().getProperty('ALLOW_TEST_IMPORT_WRITES')!=='YES')
   throw new Error('Écriture désactivée : définir ALLOW_TEST_IMPORT_WRITES=YES');
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(30000))throw new Error('Synchronisation déjà en cours');
  try{
   const state=prepare(),initial=summary(state.items);
   if(initial.counts.REJET)throw new Error('Import bloqué : '+initial.counts.REJET+' erreur(s), lancer la simulation.');
   const ss=state.target,p=ensureSheet(ss,C.TARGET_PERSONNES,C.PERSON_HEADERS),
     c=ensureSheet(ss,C.TARGET_CANDIDATURES,C.CAND_HEADERS),
     a=ensureSheet(ss,C.TARGET_AUDIT,C.AUDIT_HEADERS);
   const idx=indexes(readTarget(p,C.PERSON_HEADERS),readTarget(c,C.CAND_HEADERS));
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
   return {importees:imported,ignorees:skipped};
  }finally{lock.releaseLock();}
 }
 return Object.freeze({simulation,executeTest});
})();
function simulerImportCandidatures(){return MandatsImportService.simulation();}
function importerCandidaturesDansTest(){return MandatsImportService.executeTest();}
