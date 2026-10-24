# US-002 — Diagnostic de complétude des candidatures

## Objectif
Fournir au coordinateur un diagnostic explicable des informations et justificatifs manquants. Aucun dossier n'est déclaré « prêt à décider » par cet outil.

## Architecture
- `src/CompletenessDomain.gs` : moteur de règles **pur**, sans API Google.
- `src/CompletenessPolicy.gs` : politique de base conservatrice, sans justificatif universel supposé.
- `tests/completeness-domain.test.js` : cas de complétude, pièces, vérifications et immutabilité.

## États de diagnostic
- `INCOMPLET` : au moins une information ou pièce explicitement obligatoire manque.
- `A_VERIFIER` : tout est présent mais certains champs demandent encore vérification.
- `PRET_A_INSTRUIRE` : contrôles de complétude satisfaits ; **aucune validation statutaire ni décision** implicite.

Ces états sont des résultats de diagnostic, distincts des statuts officiels du mandat.

## Contrat de la fonction
`MandatsCompletenessDomain.evaluate(dossier, policy)` retourne un résultat non nominatif composé d'un statut, de listes structurées des champs/pièces manquants et du nombre de vérifications restantes. La fonction ne modifie aucune entrée.

## Décisions métier en attente
- La liste des pièces exigibles selon l'instance, l'autorité compétente et le type de mandat.
- La politique de vérification et l'identité des responsables habilités.
- La source des métadonnées de pièces et la gestion des droits Drive.
- La procédure de relance des candidats et les durées de conservation.

## Sécurité
Pas de lecture du formulaire réel, pas d'envoi automatique, pas d'écriture de données, pas de changement des statuts de candidature. Les tests utilisent uniquement des données fictives.

## Dépendance
Cette branche part de la branche de US-001 ; une **Pull Request empilée** est créée vers celle-ci. La fusion de US-002 dans `main` devra intervenir seulement après validation de US-001 et revue de son socle.

## Intégration en lecture seule — incrément 2

- `src/CompletenessProjection.gs` : transforme les lignes des tables `Personnes` et `Candidatures` en dossier de diagnostic, sans inventer de données absentes.
- `src/CompletenessService.gs` : lit uniquement le classeur **TARGET_TEST_SPREADSHEET_ID** via `SheetsRepository`, calcule un résumé agrégé et renvoie les diagnostics à l'appelant.
- `simulerCompletudeCandidaturesTest()` : point d'entrée manuel réservé aux utilisateurs habilités du projet Apps Script de test.
- `tests/completeness-projection.test.js` : projections, référence manquante, référentiel incohérent et immutabilité.

**Attention :** US-001 stocke actuellement `Instance_ID` vide tant que le rapprochement avec les instances n'est pas réalisé. En conséquence, la politique de base signale ce champ comme manquant. Le moteur **n'interprète pas** un champ vide comme une instance vérifiée et ne peut pas rattacher automatiquement une pièce Drive. Les obligations documentaires restent à définir par instance.

Le diagnostic n'écrit rien dans les tables sources et ne change jamais le statut de candidature. Son retour contient des identifiants techniques de candidatures et des intitulés de champs manquants ; restreindre l'accès à l'environnement de test et ne pas publier le résultat dans GitHub.

## Exigences documentaires par instance — incrément 3

Une feuille **`Exigences_instances`** peut être définie dans le classeur de TEST avec les colonnes exactes :
`INSTANCE_ID`, `Document_code`, `Document_libelle`, `Obligatoire`, `Validation_metier`.

Les deux indicateurs acceptent uniquement **oui** ou **non**. Le moteur refuse les lignes ambiguës ou les doublons d'une même règle.

- Règles documentaires **absentes ou non validées** : un dossier autrement complet demeure `A_VERIFIER`.
- Pièce **explicitement obligatoire**, absente du dossier : `INCOMPLET`.
- Pièce **facultative** et politique validée : aucune pièce manquante ajoutée.
- La vérification du contenu, de l'authenticité et des accès aux justificatifs est **hors périmètre de ce lot**.

⚠️ US-002 ne dispose pas encore d'un adaptateur documentaire Drive qui atteste la présence des pièces. La projection du dossier utilise donc `documents: {}` ; une pièce obligatoire est considérée absente. Aucun document réel n'est consulté ou téléchargé.

Ce module ne prend jamais de décision officielle. La politique doit être validée par l'UR CFTC Bretagne pour chaque instance avant utilisation sur données réelles.

## Métadonnées de justificatifs — incrément 4

La feuille facultative `Pieces_candidatures` du **classeur TEST** utilise les colonnes exactes :
`CAND_ID`, `Document_code`, `Drive_file_ID`, `Controle`, `Validation_metier`.

- `Controle` : `present`, `absent` ou `a_verifier` ;
- `Validation_metier` : `oui` ou `non` ;
- une preuve compte comme présente **uniquement** si la référence de fichier est non vide, `Controle=present` et `Validation_metier=oui` ;
- doublons et statuts inconnus bloquent le diagnostic. Aucun contenu de pièce n'est lu ou exposé dans les résultats.
- en l'absence de feuille ou de ligne correspondante, toute pièce obligatoire reste manquante.

**Limite importante :** il s'agit d'une **attestation déclarative issue du classeur TEST**, et non d'une vérification par Google Drive. Ni l'existence, ni les droits d'accès, ni l'authenticité du fichier ne sont vérifiés. Le raccordement direct à Drive, la preuve de contrôle et les habilitations restent à spécifier et tester avant utilisation réelle.

La sortie du moteur comprend uniquement des indicateurs documentaires et identifiants techniques de candidatures. Ne pas afficher les `Drive_file_ID` dans les rapports.
