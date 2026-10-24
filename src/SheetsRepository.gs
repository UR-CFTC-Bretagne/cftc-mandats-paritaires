/** Adaptateur Google Sheets : toute manipulation des feuilles est isolée ici. */
const MandatsSheetsRepository=(()=>{
 const C=MANDATS_CONFIG,D=MandatsImportDomain;
 function rows(sheet){
   if(!sheet||sheet.getLastRow()===0)return [];
   return sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn()).getDisplayValues();
 }
 function readTable(sheet,headers){
   if(!sheet)return [];
   const data=rows(sheet);
   if(data.length&&headers.some((h,i)=>data[0][i]!==h))throw new Error('Schéma incompatible : '+sheet.getName());
   return data.slice(1);
 }
 function ensureTable(book,name,headers){
   let sheet=book.getSheetByName(name);
   if(!sheet){sheet=book.insertSheet(name);sheet.getRange(1,1,1,headers.length).setValues([headers]);sheet.setFrozenRows(1);}
   else readTable(sheet,headers);
   return sheet;
 }
 function indexes(personRows,candRows){
   const people={},candidates={};
   personRows.forEach(r=>{const email=D.clean(r[3]).toLowerCase();if(email)(people[email] ||= []).push({id:r[0],nom:r[1],prenom:r[2]});});
   const duplicates=D.duplicateSourceIds(candRows.map(r=>r[3]));
   if(duplicates.length)throw new Error('Référentiel incohérent : Source_ID présent plusieurs fois ('+duplicates.length+')');
   candRows.forEach(r=>{if(r[3])candidates[String(r[3])]=true;});
   return {people,candidates};
 }
 function loadIndexes(book){
   return indexes(readTable(book.getSheetByName(C.TARGET_PERSONNES),C.PERSON_HEADERS),
                  readTable(book.getSheetByName(C.TARGET_CANDIDATURES),C.CAND_HEADERS));
 }
 function repairAudit(auditSheet,candidateSheet){
   const ids=readTable(candidateSheet,C.CAND_HEADERS).map(r=>r[3]);
   const auditIds=readTable(auditSheet,C.AUDIT_HEADERS).filter(r=>r[1]==='IMPORT'||r[1]==='RECONCILIATION').map(r=>r[2]);
   const missing=D.missingAudits(ids,auditIds);
   missing.forEach(id=>auditSheet.appendRow([new Date(),'RECONCILIATION',id,'OK','Trace restaurée depuis Candidatures']));
   return missing.length;
 }
 return Object.freeze({rows,readTable,ensureTable,indexes,loadIndexes,repairAudit});
})();
