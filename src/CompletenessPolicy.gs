/** Configuration de base : les justificatifs varient selon l'instance et restent à arbitrer. */
const MandatsCompletenessPolicy = Object.freeze({
  fields: Object.freeze([
    {key:'nom',label:'Nom',required:true,verify:false},
    {key:'prenom',label:'Prénom',required:true,verify:false},
    {key:'courriel',label:'Courriel',required:true,verify:false},
    {key:'date',label:'Date de réception',required:true,verify:false},
    {key:'instance',label:'Instance sollicitée',required:true,verify:false}
  ]),
  // Ne PAS inventer des pièces obligatoires universelles : règles configurées ultérieurement.
  documents: Object.freeze([])
});
