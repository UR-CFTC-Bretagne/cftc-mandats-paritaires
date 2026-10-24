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
- `Source_ID` utilise l'ID de feuille et le numéro de ligne : ne jamais trier, déplacer ou supprimer les réponses du formulaire.
- Les modifications a posteriori d'une réponse existante ne sont pas réconciliées.
- Une panne entre plusieurs écritures peut laisser une personne orpheline : les écritures Google Sheets ne sont pas transactionnelles.
- L'instance textuelle n'est pas liée à `Instance_ID` : rapprochement métier à développer, ne rien inventer.
- En-têtes réels non encore confirmés : compléter le mapping avant recette.
- Aucun envoi automatique, décision officielle ou génération de mandat n'est effectué.
