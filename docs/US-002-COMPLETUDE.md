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
