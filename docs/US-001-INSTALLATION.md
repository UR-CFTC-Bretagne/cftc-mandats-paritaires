# US-001 — Installation et recette sur environnement TEST

## Pré-requis
- Feuille de réponses Forms appelée `Réponses au formulaire 1`.
- **Classeur Google Sheets de test vide distinct** de la source, avec droits restreints.
- Projet Apps Script de test sans déclencheur automatique.
- Ne pas transmettre de données nominatives ni de secrets à GitHub.

## Propriétés du projet Apps Script
| Propriété | Valeur |
| --- | --- |
| `SOURCE_SPREADSHEET_ID` | ID du classeur de réponses Forms |
| `TARGET_TEST_SPREADSHEET_ID` | ID du classeur de test distinct |
| `ALLOW_TEST_IMPORT_WRITES` | `NO` par défaut ; `YES` après autorisation de la recette |
| `FORM_HEADER_DATE` | En-tête exact horodatage si non reconnu |
| `FORM_HEADER_NOM` | En-tête exact nom si non reconnu |
| `FORM_HEADER_PRENOM` | En-tête exact prénom si non reconnu |
| `FORM_HEADER_COURRIEL` | En-tête exact courriel si non reconnu |
| `FORM_HEADER_INSTANCE` | En-tête exact instance, optionnel |

## Étapes
1. Configurer un projet Apps Script de test. Copier `src/*.gs` et `appsscript.json` dans le projet via `clasp` (ne jamais committer `.clasp.json`).
2. Définir les propriétés sans activer les écritures.
3. Exécuter `simulerImportCandidatures` et examiner les résultats anonymisés.
4. Vérifier les en-têtes réels du formulaire et les règles de protection des données.
5. Après validation métier, définir `ALLOW_TEST_IMPORT_WRITES=YES`, puis exécuter manuellement `importerCandidaturesDansTest`.
6. Vérifier `Personnes`, `Candidatures`, `Audit_Imports` dans le classeur TEST.
7. Relancer l'import : aucun doublon attendu.
8. Désactiver immédiatement `ALLOW_TEST_IMPORT_WRITES`.

## Limites connues — pas de déploiement en production
- `Source_ID` est désormais une empreinte SHA-256 de l'ID technique de feuille, du courriel, du nom, du prénom et de l'horodatage. L'ordre des lignes n'intervient plus dans cette clé.
- Deux réponses indiscernables (mêmes nom, prénom, courriel et horodatage) sont **rejetées** pour arbitrage humain. Cette solution n'est pas un identifiant natif immuable Google Forms.
- Modifier l'identité, l'horodatage ou le format d'affichage de la date **change l'empreinte** et peut conduire à un nouvel import : il faut figer les formats et prévoir un mécanisme natif de suivi des modifications avant production.
- Les modifications a posteriori d'une réponse existante ne sont pas réconciliées.
- Une panne entre plusieurs écritures peut laisser une personne orpheline : les écritures Google Sheets ne sont pas transactionnelles.
- L'instance textuelle n'est pas liée à `Instance_ID` : rapprochement métier à développer, ne rien inventer.
- En-têtes réels non encore confirmés : compléter le mapping avant recette.
- Aucun envoi automatique, décision officielle ou génération de mandat n'est effectué.

## Scénarios de recette complémentaires
- [ ] Trier les lignes de la feuille source dans une copie de test ; aucune candidature déjà importée ne doit être créée à nouveau.
- [ ] Ajouter deux réponses strictement identiques : les deux doivent être rejetées et l'import arrêté.
- [ ] Interrompre volontairement l'import après l'ajout d'une personne, puis relancer : aucune seconde personne ne doit être créée.
- [ ] Tester un échec d'ajout au journal d'audit : l'opération doit être rapprochée avec la candidature persistée.
- [ ] Vérifier qu'une modification de date ou d'identité en source est signalée et traitée manuellement, et non silencieusement assimilée à une nouvelle candidature.
