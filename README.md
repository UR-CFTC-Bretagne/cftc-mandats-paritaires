# CFTC Mandats Paritaires

**Application open source de coordination des mandats paritaires — Union Régionale CFTC Bretagne.**

[![Licence : Apache-2.0](https://img.shields.io/badge/licence-Apache--2.0-blue)](https://www.apache.org/licenses/LICENSE-2.0)

> **Statut : développement — US-001 en recette.** Ne pas déployer en production. Le dépôt est actuellement **public** : aucun fichier nominatif, secret, export ou document confidentiel ne doit y être commité.

## Objectifs

Le projet vise à fiabiliser l'instruction des candidatures, la validation des décisions, la formalisation des mandats, la préparation des notifications et le suivi des échéances des mandatés de l'UR CFTC Bretagne.

Le développement est conduit par **user stories** et **Pull Requests** revues, avec incréments testés et documentés.

- [Backlog GitHub Issues](https://github.com/UR-CFTC-Bretagne/cftc-mandats-paritaires/issues)
- [US-001 — Importer les candidatures](https://github.com/UR-CFTC-Bretagne/cftc-mandats-paritaires/issues/2)
- [PR US-001 (brouillon)](https://github.com/UR-CFTC-Bretagne/cftc-mandats-paritaires/pull/14)
- [ARCH-001 — Modularité et maintenabilité](https://github.com/UR-CFTC-Bretagne/cftc-mandats-paritaires/issues/15)

## Architecture et organisation

L'architecture isole les règles métier des services Google Workspace pour favoriser les tests, la maintenance et l'évolution.

```text
.
├── .github/workflows/ci.yml    # Intégration continue
├── docs/
│   ├── ARCHITECTURE.md          # Choix d'architecture, frontières de modules
│   └── US-001-INSTALLATION.md   # Configuration et recette sur environnement TEST
├── scripts/
│   ├── check-architecture.js    # Contrôle des dépendances interdites
│   └── check-syntax.js          # Validation syntaxique Apps Script
├── src/
│   ├── Config.gs                # Configuration et schémas
│   ├── ImportDomain.gs          # Règles métier pures
│   ├── ImportService.gs         # Orchestration du cas d'usage
│   ├── ImportSettings.gs        # Adaptateur Script Properties
│   ├── SheetsRepository.gs      # Adaptateur Google Sheets
│   └── Menu.gs                  # Interface utilisateur Apps Script
├── tests/
│   ├── import-domain.test.js
│   └── sheets-repository.test.js
├── appsscript.json
├── package.json
├── .gitignore
└── README.md
```

La licence, le fichier NOTICE et les mentions d'attribution font l'objet de la [PR #1](https://github.com/UR-CFTC-Bretagne/cftc-mandats-paritaires/pull/1) jusqu'à leur fusion. Voir les fichiers LICENSE, NOTICE et ATTRIBUTION.md après intégration.

## US-001 — Fonctionnalités disponibles sur la branche

- Simulation des réponses Google Forms en lecture seule.
- Correspondance des en-têtes et contrôle des données requises.
- Rapprochement des personnes par courriel et identité.
- Import manuel dans un **classeur de test distinct**, après activation explicite.
- Clé de source basée sur une empreinte SHA-256 (insensible à l'ordre des lignes).
- Verrou anti-concurrence, audit et rapprochement des audits incomplets.
- Contrôle d'intégrité des identifiants sources et tests automatisés sur données fictives.

**Limites ouvertes :** la clé de source n'est pas un identifiant natif immuable de réponse ; une réponse modifiée peut changer d'empreinte. Google Sheets n'est pas transactionnel. L'association à une instance et la recette Google Workspace réelle restent à confirmer.

## Développement

Pré-requis : Node.js **20 ou plus**. Aucun paquet npm externe n'est nécessaire aux tests actuels.

```bash
npm run check        # Syntaxe + frontières d'architecture
npm test             # Tests unitaires + repository simulé
npm run architecture # Contrôle indépendant des couches
```

La CI GitHub Actions exécute `npm run check` puis `npm test` sur les Pull Requests. Toute nouvelle user story doit comporter des tests, une documentation et une recette métier avant fusion.

## Installation et confidentialité

Lire [la procédure d'installation et de recette US-001](docs/US-001-INSTALLATION.md). Les paramètres de projet Apps Script sont configurés **hors GitHub**, dans Script Properties ; `.clasp.json`, exports Sheets/Forms et secrets ne sont jamais versionnés.

Le code ne déclenche **aucun envoi de mail ni aucune désignation officielle**. Les opérations d'écriture sont désactivées par défaut et réservées à un environnement de test distinct.

## Licence et attribution

Copyright © 2026 **Union Régionale CFTC Bretagne**.

Projet proposé sous **Apache License 2.0**, accompagné de `NOTICE` et `ATTRIBUTION.md` (voir [PR #1](https://github.com/UR-CFTC-Bretagne/cftc-mandats-paritaires/pull/1)). Lors des redistributions, les mentions de droit d'auteur et le crédit d'origine doivent être conservés dans les conditions de la licence. Cette licence ne confère aucun droit d'utilisation des marques et logos CFTC et n'implique aucun soutien aux versions modifiées.

**Important :** la présence d'un fichier licence ne remplace pas la vérification des droits d'auteur sur l'ensemble des contributions.
