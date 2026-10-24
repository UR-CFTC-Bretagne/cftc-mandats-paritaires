/** US-002 : contrôle de métadonnées documentaires, sans lire Drive. */
const MandatsDocumentEvidence=(()=>{
 const HEADERS=Object.freeze(['CAND_ID','Document_code','Drive_file_ID','Controle','Validation_metier']);
 const norm=v=>String(v==null?'':v).trim().toLocaleLowerCase('fr');
 function fromRows(rows){
  if(!Array.isArray(rows))throw new Error('Métadonnées documentaires invalides');
  const byCandidate=new Map(),seen=new Set();
  for(const row of rows){
   if(!Array.isArray(row)||row.length<HEADERS.length)throw new Error('Ligne de justificatif mal formée');
   const id=String(row[0]||'').trim(),code=String(row[1]||'').trim(),fileId=String(row[2]||'').trim();
   const control=norm(row[3]),validated=norm(row[4]);
   if(!id||!code)throw new Error('Référence documentaire incomplète');
   const key=id+'|'+code;
   if(seen.has(key))throw new Error('Référence documentaire dupliquée');
   seen.add(key);
   if(!['present','absent','a_verifier'].includes(control)||!['oui','non'].includes(validated))
    throw new Error('Statut documentaire invalide');
   // A file reference is only usable after an explicit business validation.
   // This does not verify Drive permissions, existence, content or authenticity.
   const usable=!!fileId&&control==='present'&&validated==='oui';
   const dossier=byCandidate.get(id)||{};
   dossier[code]=usable ? true : false;
   byCandidate.set(id,dossier);
  }
  return Object.freeze({forCandidature(id){return {...(byCandidate.get(String(id||'').trim())||{})};}});
 }
 return Object.freeze({HEADERS,fromRows});
})();
if(typeof module!=='undefined')module.exports=MandatsDocumentEvidence;
