# US-003 — Enregistrement des décisions du Conseil UR

## Contrat métier, incrément initial

Issue [#4](https://github.com/UR-CFTC-Bretagne/cftc-mandats-paritaires/issues/4). Ce développement introduit la **validation structurelle et la préparation d'un brouillon** de décision, sans activer un mandat et sans envoyer de courriel.

Champs proposés :
`DECISION_ID`, `CAND_ID`, `Autorite`, `Date_decision`, `Resultat`, `Reference_PV`, `Drive_justificatif_ID`, `Competence_verifiee`, `Justificatif_verifie`, `Candidature_verifiee`, `Etat`, `Cree_le`.

Le module pur `src/DecisionDomain.gs` exige identifiant, candidature, autorité, date réelle au format ISO, résultat et référence de PV, ainsi qu'une référence de justificatif. Il distingue `VALIDATION`, `REFUS` et `AJOURNEMENT`.

Les indicateurs de vérification doivent être renseignés **expressément** par des acteurs habilités ; ils ne sont pas déduits d'une simple présence de fichier ou du texte de l'autorité. Une décision avec les trois contrôles positifs est seulement `pretPourRevue`, **jamais automatiquement exécutoire**. L'état initial reste `BROUILLON`.

## Audit et protection

Toute révision de la décision doit engendrer un événement distinct et horodaté. Le module `auditChange` fournit une intention d'événement, sans sauvegarde à ce stade. Le futur journal devra conserver les versions ou références nécessaires à la traçabilité selon les règles de conservation validées. La méthode actuelle ne constitue **pas** un audit persistant.

Le module ne lit aucun PV Drive, ne vérifie pas une autorité réelle, ne réalise pas d'écriture Sheets, et ne communique aucune donnée à des tiers. Les tests utilisent uniquement des dossiers fictifs.

## Points à trancher avant le stockage et la recette

- Autorité compétente selon l'instance et la nature du mandat ; règles de quorum et de validation, si applicables.
- Source de vérité des décisions : PV adopté, extrait signé, registre délibératif, etc.
- Gestion de la correction, de l'annulation, du remplacement et des décisions multiples pour une même candidature.
- Référentiel de décisions à créer en **TEST** avec migrations non destructives et audit append-only.
- Habilitations de saisie, validation et consultation ; preuve que l'accès Drive est limité.

## Dépendance

La branche US-003 est empilée sur US-002, elle-même dépendante de US-001. Ne pas fusionner dans `main` sans recettes et validations préalables.

## Incrément 2 — stockage dans un classeur de TEST

Le code fournit `MandatsDecisionService.simulate(input)` (lecture seule) et `MandatsDecisionService.saveDraftTest(input,actor)` (écriture de brouillon uniquement).

**Protection des écritures :** la propriété de script `ALLOW_TEST_DECISION_WRITES=YES` doit être ajoutée **explicitement**, exclusivement dans l'environnement de développement/recette. Sans cette valeur exacte, l'écriture est interdite. Le classeur est celui de `TARGET_TEST_SPREADSHEET_ID` et doit être distinct de `SOURCE_SPREADSHEET_ID`.

### Tables proposées dans le classeur TEST

`Decisions` : `DECISION_ID`, `CAND_ID`, `Autorite`, `Date_decision`, `Resultat`, `Reference_PV`, `Drive_justificatif_ID`, `Competence_verifiee`, `Justificatif_verifie`, `Candidature_verifiee`, `Etat`, `Cree_le`.

`Audit_Decisions` : `EVENT_ID`, `Date`, `DECISION_ID`, `Action`, `Acteur`, `Champs`, `Statut`.

L'adaptateur vérifie les identifiants des candidatures, l'absence de `DECISION_ID` dupliqué et l'absence d'événement d'audit existant pour la décision avant tout enregistrement. L'écriture est protégée par `LockService`.

### Réconciliation obligatoire

Le code écrit une **intention** d'audit (`INTENTION`) avant la ligne de décision, puis un événement de succès (`TERMINE`). Les tables Google Sheets **ne sont pas transactionnelles** : si une opération s'interrompt entre les écritures, un audit ou un brouillon peut rester partiel. Une nouvelle tentative portant le même `DECISION_ID` est bloquée et la reprise nécessite un contrôle humain.

Cet audit est une première **piste d'audit append-only applicative**, non une garantie d'inaltérabilité technique ou réglementaire. Les révocations, modifications et historiques de versions ne sont pas encore implémentés. Aucun envoi ou désignation officielle n'est déclenché.

Le code rejette les valeurs textuelles susceptibles d'être interprétées comme une formule dans Google Sheets. Les tests sont fictifs ; aucune recette réelle Workspace n'est présumée.

### Scénarios de recette nécessaires

1. Sans flag d'écriture : opération refusée.
2. Avec données fictives : créer un brouillon et deux lignes d'audit, sans désignation.
3. Candidature inconnue : opération refusée avant toute écriture.
4. Doublon décision ou audit partiel : opération refusée et réconciliation manuelle.
5. Feuille au schéma incompatible : opération interrompue.
6. Vérification des droits d'édition, de la séparation TEST/production et des informations d'identification de l'acteur.

**Restriction :** ne pas activer la fonction de sauvegarde dans le projet Apps Script réel tant que l'autorité compétente, la gestion des droits, la politique de conservation et les règles d'audit n'ont pas été validées.
