/** Contrôles statiques des frontières d'architecture — sans dépendance externe. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const source=path.join(__dirname,'../src');
const gs=fs.readdirSync(source).filter(name=>name.endsWith('.gs'));
const errors=[];
for(const name of gs){
 const contents=fs.readFileSync(path.join(source,name),'utf8');
 // Domaine sans accès direct aux services de Google Workspace.
 if(/Domain\.gs$/.test(name)){
   const forbidden=/\b(?:SpreadsheetApp|DriveApp|GmailApp|MailApp|CalendarApp|PropertiesService|LockService|UrlFetchApp)\b/g;
   const bad=[...contents.matchAll(forbidden)].map(m=>m[0]);
   if(bad.length)errors.push(name+': API Google interdite dans le domaine ('+[...new Set(bad)].join(', ')+')');
 }
 // Un seul point d'entrée onOpen pour l'ensemble du projet.
}
const onOpenCount=gs.reduce((n,name)=>{
 const contents=fs.readFileSync(path.join(source,name),'utf8');
 return n+(contents.match(/\bfunction\s+onOpen\s*\(/g)||[]).length;
},0);
if(onOpenCount!==1)errors.push('Un unique onOpen est requis ; trouvé : '+onOpenCount);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log('Frontières d’architecture respectées : '+gs.length+' fichiers Apps Script.');
