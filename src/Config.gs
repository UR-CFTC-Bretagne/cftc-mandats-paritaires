/** Copyright 2026 Union Régionale CFTC Bretagne. SPDX-License-Identifier: Apache-2.0 */
const MANDATS_CONFIG = Object.freeze({
  SOURCE_SHEET:'Réponses au formulaire 1', TARGET_PERSONNES:'Personnes', TARGET_CANDIDATURES:'Candidatures',
  TARGET_AUDIT:'Audit_Imports', SOURCE_KIND:'GOOGLE_FORMS',
  PERSON_HEADERS:['PERSONNE_ID','Nom','Prénom','Courriel','Syndicat_ID','UD_ID','Créé_le'],
  CAND_HEADERS:['CAND_ID','PERSONNE_ID','Source','Source_ID','Instance_ID','Date_réception','Statut','Créé_le'],
  AUDIT_HEADERS:['Date','Action','Source_ID','Résultat','Détails'],
  HEADER_ALIASES:{
    date:['Horodateur','Timestamp','Date de réception','Date de réception de la candidature'],
    nom:['Nom','Nom de famille','Votre nom'], prenom:['Prénom','Prenom','Votre prénom'],
    courriel:['Adresse e-mail','Adresse email','E-mail','Email','Courriel','Adresse mail'],
    instance:['Instance','Organisme','Mandat demandé','Mandat sollicité']
  }
});
