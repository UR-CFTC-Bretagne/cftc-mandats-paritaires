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
