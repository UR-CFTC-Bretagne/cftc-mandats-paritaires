# CFTC Mandats Paritaires — UR CFTC Bretagne

Application Google Apps Script de coordination des mandats paritaires de l'UR CFTC Bretagne.

## Incrément US-001 : synchronisation des candidatures

Synchroniser les réponses Google Forms avec un référentiel central de **test distinct**. Simulation en lecture seule par défaut. L'import est manuel, avec autorisation explicite, verrouillage et journal technique.

### Arborescence

- `src/Config.gs` — configuration, en-têtes et schémas.
- `src/ImportDomain.gs` — validation, dédoublonnage et règles métier testables.
- `src/ImportService.gs` — orchestration des cas d'usage et simulation.
- `src/SheetsRepository.gs` — accès aux feuilles et à leurs schémas.
- `src/ImportSettings.gs` — paramètres d'environnement Google Apps Script.
- `src/Menu.gs` — accès à la simulation en lecture seule.
- `tests/` — tests unitaires de l'US-001 avec données fictives.
- `scripts/` — contrôle syntaxique des fichiers Apps Script.
- `.github/workflows/ci.yml` — vérifications automatiques.
- `docs/US-001-INSTALLATION.md` — installation et recette.
- `docs/ARCHITECTURE.md` — décisions d'architecture et règles de contribution.

### Tests

```bash
npm run check
npm test
```

### Installation

Voir [docs/US-001-INSTALLATION.md](docs/US-001-INSTALLATION.md). **Aucune utilisation en production avant validation des en-têtes réels, des règles de reprise et de l'identifiant immuable des réponses.**

### Confidentialité et licence

Ne jamais stocker de candidatures nominatives, documents confidentiels, identifiants ou secrets dans GitHub.

Projet initié par l'Union Régionale CFTC Bretagne. Licence Apache 2.0 avec attribution prévue dans `NOTICE` (voir PR de licence séparée).
