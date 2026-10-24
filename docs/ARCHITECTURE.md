# Architecture — ADR-001 : modularité et évolutivité

## Décision
Architecture **modulaire légère / ports-adapters**, compatible Google Apps Script V8 et testable avec Node.js. Les fichiers `.gs` constituent un seul projet Apps Script : leurs dépendances globales doivent être disponibles dans le projet déployé.

## Couches
- **Domaine** `ImportDomain.gs` : règles métier pures, validation, dédoublonnage, transitions. Ne dépend ni de Google Sheets ni de Gmail/Drive.
- **Application** `ImportService.gs` : coordination des cas d'usage, validation des préconditions et orchestration.
- **Infrastructure** `SheetsRepository.gs`, `ImportSettings.gs` : adaptateurs Google Sheets et Script Properties ; remplaçables sans réécrire le domaine.
- **Présentation** `Menu.gs` : points d'entrée pour les utilisateurs, sans règles métier.
- **Contrôle qualité** `tests/`, `.github/workflows/` : tests unitaires et contrôle syntaxique.
- **Documentation** `docs/` : ADR, modèles de données, procédures de recette.

## Règles obligatoires de contribution
1. Le domaine **ne doit jamais importer** `SpreadsheetApp`, `GmailApp`, `DriveApp` ni `PropertiesService`.
2. Toute nouvelle intégration Google passe par un adaptateur ou dépôt dédié, pas directement depuis le domaine.
3. Chaque user story dispose de critères d'acceptation et de tests unitaires sur données fictives.
4. Une Pull Request contient une documentation de compatibilité et, si nécessaire, un plan de migration de schéma.
5. Les changements destructeurs ou non rétrocompatibles requièrent une migration explicite et testée.
6. Pas de données personnelles, clé, secret ou identifiant de déploiement dans GitHub.
7. Aucun envoi ou désignation officielle déclenché automatiquement sans validation métier explicite.
8. Les entrées Google Apps Script (`onOpen`, déclencheurs) restent minimales et **uniques**.

## Évolution
Les modules `candidatures`, `personnes`, `instances`, `decisions`, `mandats`, `documents`, `notifications` et `audit` pourront être introduits au fil des sprints ; éviter les dossiers vides artificiels. Lorsqu'une couche grossit, scinder par cas d'usage ou agrégat métier.

## Limites
Les écritures multi-feuilles Sheets ne sont pas transactionnelles. Le rapprochement des réponses modifiées, la gestion d'un identifiant natif Google Forms et la recette réelle restent à traiter avant production.

## Garde-fous exécutables (Sprint 1)
- `npm run check` lance le contrôle de syntaxe et `scripts/check-architecture.js`.
- Le garde-fou interdit toute API Google Workspace dans les fichiers `*Domain.gs` et refuse plusieurs `onOpen`.
- `tests/sheets-repository.test.js` exécute l'adaptateur sur des doubles Google Sheets en mémoire : schémas, réutilisation, contrôles des doublons et reprise des audits.
- L'adaptateur d'infrastructure est vérifié sans accéder aux données réelles.

### Limites des garde-fous
Les contrôles statiques reposent sur des expressions régulières, et non sur un AST : ils ne remplacent ni revue de code ni tests de bout en bout. L'infrastructure, l'orchestrateur et les entrées de menu peuvent toujours accéder directement à des services Google lorsqu'ils remplissent leur responsabilité, mais les prochains incréments devraient tendre vers une injection explicite des adaptateurs.
