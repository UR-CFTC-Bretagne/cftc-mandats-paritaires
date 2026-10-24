/** Référentiel documentaire pur : aucune obligation inventée. */
const MandatsInstanceRequirements=(()=>{
 const HEADERS=Object.freeze(['INSTANCE_ID','Document_code','Document_libelle','Obligatoire','Validation_metier']);
 const norm=v=>String(v==null?'':v).trim().toLocaleLowerCase('fr');
 function fromRows(rows){
  if(!Array.isArray(rows))throw new Error('Règles documentaires invalides');
  const byId=new Map(),seen=new Set();
  for(const row of rows){
   if(!Array.isArray(row)||row.length<HEADERS.length)throw new Error('Ligne documentaire mal formée');
   const id=String(row[0]||'').trim(),key=String(row[1]||'').trim(),label=String(row[2]||'').trim();
   if(!id||!key||!label)throw new Error('Règle documentaire incomplète');
   if(!['oui','non'].includes(norm(row[3]))||!['oui','non'].includes(norm(row[4])))
      throw new Error('Drapeau documentaire invalide');
   const composite=id+'|'+key;
   if(seen.has(composite))throw new Error('Règle documentaire dupliquée');
   seen.add(composite);
   const list=byId.get(id)||[];
   list.push(Object.freeze({key,label,required:norm(row[3])==='oui',validated:norm(row[4])==='oui'}));
   byId.set(id,list);
  }
  return Object.freeze({forInstance(id){
   const rules=byId.get(String(id||'').trim());
   if(!rules || rules.length===0 || rules.some(x=>!x.validated))
     return {status:'A_VALIDER',documents:[]};
   return {status:'VALIDE',documents:rules.map(({key,label,required})=>({key,label,required}))};
  }});
 }
 return Object.freeze({HEADERS,fromRows});
})();
if(typeof module!=='undefined')module.exports=MandatsInstanceRequirements;
