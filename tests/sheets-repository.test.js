const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const domain=require('../src/ImportDomain.gs');
const config={
  PERSON_HEADERS:['PERSONNE_ID','Nom','Prénom','Courriel','Syndicat_ID','UD_ID','Créé_le'],
  CAND_HEADERS:['CAND_ID','PERSONNE_ID','Source','Source_ID','Instance_ID','Date_réception','Statut','Créé_le'],
  AUDIT_HEADERS:['Date','Action','Source_ID','Résultat','Détails']
};
const context=vm.createContext({MANDATS_CONFIG:config,MandatsImportDomain:domain,Date});
const code=fs.readFileSync(path.join(__dirname,'../src/SheetsRepository.gs'),'utf8');
vm.runInContext(code,context);
const repository=vm.runInContext('MandatsSheetsRepository',context);
function sheet(name,initial=[]){
 const values=initial.map(r=>[...r]);
 return {
  values,getName(){return name;},getLastRow(){return values.length;},
  getLastColumn(){return values.reduce((m,r)=>Math.max(m,r.length),0);},
  getRange(row,col,rows,cols){return {
    getDisplayValues(){return values.slice(row-1,row-1+rows).map(r=>r.slice(col-1,col-1+cols));},
    setValues(arr){arr.forEach((r,i)=>{values[row-1+i]=[...r];});}
  };},
  appendRow(row){values.push([...row]);},
  setFrozenRows(){}
 };
}
function book(){
 const sheets=new Map();
 return {
  getSheetByName(name){return sheets.get(name)||null;},
  insertSheet(name){const s=sheet(name);sheets.set(name,s);return s;},
  setSheet(name,s){sheets.set(name,s);}
 };
}
test('ensureTable crée une table puis conserve son schéma',()=>{
 const b=book(),s=repository.ensureTable(b,'Personnes',config.PERSON_HEADERS);
 assert.deepEqual(s.values[0],config.PERSON_HEADERS);
 assert.equal(repository.ensureTable(b,'Personnes',config.PERSON_HEADERS),s);
});
test('refuse un schéma incompatible sans le réécrire',()=>{
 const b=book(),s=sheet('Personnes',[['WRONG']]);b.setSheet('Personnes',s);
 assert.throws(()=>repository.ensureTable(b,'Personnes',config.PERSON_HEADERS),/Schéma incompatible/);
 assert.equal(s.values[0][0],'WRONG');
});
test('réutilise une personne existante sans dupliquer son courriel',()=>{
 const idx=repository.indexes([['id1','Martin','Alex','alex@example.org','','','']],[]);
 assert.equal(idx.people['alex@example.org'][0].id,'id1');
});
test('détecte les Source_ID dupliqués avant import',()=>{
 assert.throws(()=>repository.indexes([],[
 ['1','p','','same','','','',''],['2','p','','same','','','','']
 ]),/Source_ID présent plusieurs fois/);
});
test('reconstitue un audit absent sans le répéter',()=>{
 const candidates=sheet('Candidatures',[config.CAND_HEADERS,
 ['c1','p1','GOOGLE_FORMS','src-1','','2026-01-01','Reçue',''],
 ['c2','p1','GOOGLE_FORMS','src-2','','2026-01-02','Reçue','']]);
 const audits=sheet('Audit_Imports',[config.AUDIT_HEADERS,
 ['2026-01-01','IMPORT','src-1','OK','']]);
 assert.equal(repository.repairAudit(audits,candidates),1);
 assert.equal(audits.values[2][1],'RECONCILIATION');
 assert.equal(audits.values[2][2],'src-2');
 assert.equal(repository.repairAudit(audits,candidates),0);
});
