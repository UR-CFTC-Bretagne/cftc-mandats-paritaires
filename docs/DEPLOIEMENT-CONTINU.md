# Livraison et déploiement continus (CI/CD) — Apps Script

## Politique de déploiement

- Les Pull Requests exécutent uniquement la CI existante : vérifications d'architecture, syntaxe et tests unitaires.
- Chaque `push` sur `main`, après intégration validée, déclenche `.github/workflows/deploy-test.yml` : tests, assemblage des scripts, artefact temporaire, puis `clasp push` vers **le projet Apps Script de TEST**.
- Aucun workflow ne publie automatiquement en **production**. Pas de fusion, de désignation officielle, d'écriture dans des dossiers réels ni d'envoi Gmail.
- Ce workflow déploie **le code source** vers un projet Apps Script existant. Il ne crée pas automatiquement de version web app, d'exécution ni de trigger.

## Prérequis à configurer dans GitHub

Dans Settings > Environments, créer `apps-script-test`. Limiter les branches autorisées à `main`. Recommandé : imposer une approbation humaine initiale lors de la recette, puis l'enlever uniquement quand les garanties et le schéma TEST sont validés.

Configurer les **variables d'environnement** `CONFIRMED_TEST_SCRIPT_ID` (copie contrôlée de l'identifiant du projet TEST) et `ALLOW_TEST_CODE_DEPLOY=YES` pour autoriser explicitement le transfert du code vers TEST. Toute autre valeur bloque le job.

Configurer comme **secrets de l'environnement** :
- `APPS_SCRIPT_TEST_ID` : identifiant du projet Apps Script **de test** (différent de la production).
- `CLASPRC_JSON` : contenu JSON des identifiants OAuth clasp obtenus par l'administrateur autorisé. Les préserver exclusivement dans GitHub Secrets et renouveler/révoquer les jetons selon la procédure interne.

Le workflow bloque le job de déploiement si la référence Git n'est pas `main`, si le dépôt n'est pas celui de l'UR CFTC Bretagne ou si le manifeste comporte une permission Drive. Cela ne dispense pas de vérifier l'identifiant du projet TEST et ses habilitations avant l'activation.

Ces deux secrets sont indispensables. Sans eux, le job de livraison échoue explicitement et ne touche aucun projet Apps Script.

Le compte OAuth doit être dédié au test ou très étroitement habilité. Les droits Google Sheets/Drive dépendent du manifeste `appsscript.json` et des autorisations Google effectives. **Le scope Drive n'est pas approuvé dans le manifeste actuel** : ne pas activer la lecture de pièces réelles sans revue de sécurité.

## Déroulement technique

1. `npm run check` puis `npm test`.
2. `npm run build` : copie des fichiers `src/*.gs` et du manifeste dans `dist/`.
3. Publication d'un artefact temporaire GitHub Actions ; aucune donnée réelle ne doit être incluse dans les sources.
4. Installation de `@google/clasp` épinglée, génération temporaire de `.clasp.json`, puis `clasp push --force` vers le seul `APPS_SCRIPT_TEST_ID`.
5. Suppression des fichiers temporaires de credentials du runner.

La synchronisation `clasp push --force` **remplace le code du projet Apps Script cible** : le projet TEST doit être exclusivement piloté par ce dépôt, sauvegardé et ne doit pas contenir de modifications manuelles non versionnées.

## Vérifications d'exploitation et retour arrière

- Vérifier l'identité du projet TEST et l'environnement GitHub avant la première activation.
- Après un déploiement, ouvrir le projet Apps Script TEST pour vérifier la synchronisation des fichiers ; une recette fonctionnelle nécessite toujours un opérateur habilité.
- En cas d'échec, conserver les logs GitHub Actions sans y inscrire les secrets ni les données des mandatés.
- Retour arrière : restaurer sur `main` un commit revu puis relancer le workflow sur cette référence. Les données Sheets ne sont **pas** restaurées par ce mécanisme ; planifier séparément leurs sauvegardes.
- Une publication **production** exigera un workflow spécifique avec revue de sécurité, environnement protégé et autorisation humaine expresse.

## Statut

Ce dispositif est **préparé sur une branche de développement**. Il ne devient opérationnel sur `main` qu'après revue/fusion de la chaîne de PR, création de l'environnement et des secrets, puis validation du test de bout en bout.


## Préflight de déploiement

Le script `scripts/verify-test-deploy.js` valide les paramètres dans le runner avant d'écrire `.clasprc.json` :

- concordance stricte entre `APPS_SCRIPT_TEST_ID` (secret) et `CONFIRMED_TEST_SCRIPT_ID` (variable d'environnement protégée) ;
- présence et validité structurelle des identifiants OAuth ;
- conformité du manifeste à la seule permission actuellement approuvée : `https://www.googleapis.com/auth/spreadsheets` ;
- rejet de toute permission supplémentaire, notamment Drive.

Pour éviter d'exposer des valeurs confidentielles, les erreurs de préflight ne reprennent pas le contenu des secrets ni les identifiants. Les tests automatisés utilisent exclusivement des identifiants fictifs. **La vérification de l'identité du projet cible reste un contrôle organisationnel obligatoire** : une double valeur identique saisie par erreur ne démontre pas la propriété du projet.
