# Passage en production du MVP — critères de décision

Le MVP n'est **pas déclaré prêt** à ce stade. Ce document prépare la revue formelle, sans autoriser une mise en service immédiate.

## Critères de sortie du MVP

- [ ] US-001 : import idempotent de candidatures, doublons et rapprochements contrôlés ; recette sur copie fictive.
- [ ] US-002 : référentiel d'instances validé, exigences documentaires vérifiées et diagnostics fiables ; accès Drive autorisé si indispensable.
- [ ] US-003 : décision et justificatif contrôlés, autorité habilitée confirmée et audit durable des modifications.
- [ ] US-004 : transitions interdites bloquées dans les parcours réels ; aucun acte officiel depuis une décision non vérifiée.
- [ ] Tests CI réussis sur le commit candidat, revue de code approuvée et branches dépendantes intégrées.
- [ ] Environnement TEST fonctionnel ; vérification d'intégration du package Apps Script et recette métier signée.
- [ ] Contrôles RGPD, accès aux dossiers nominatifs, conservation, journalisation et limitation des scopes OAuth approuvés.
- [ ] Sauvegardes et procédure de retour arrière testées ; compte d'exploitation identifié.
- [ ] Autorité de publication désignée, date de bascule et communication aux utilisateurs validées.

## Déploiement protégé

La publication de code en production n'est possible qu'au moyen du workflow manuel `.github/workflows/deploy-production.yml`, après intégration dans `main`. Il faut configurer **un environnement GitHub protégé** `apps-script-production` avec des réviseurs obligatoires et la limitation à la branche `main`.

Secrets de cet environnement :
- `APPS_SCRIPT_PRODUCTION_ID` : identifiant du projet Apps Script de production.
- `CLASPRC_PRODUCTION_JSON` : identifiants OAuth autorisés pour le déploiement en production.

Variables de cet environnement :
- `CONFIRMED_PRODUCTION_SCRIPT_ID` : confirmation indépendante de la cible de production.
- `CONFIRMED_TEST_SCRIPT_ID` : identifiant du projet TEST, nécessaire pour démontrer la séparation.
- `MVP_RELEASE_APPROVED=YES` : à positionner **uniquement après** validation de la présente checklist et de l'autorité compétente.

Le déclencheur exige de renseigner exactement `DEPLOY_MVP_PRODUCTION`. Le job contrôle ensuite les validations, les secrets et le manifeste OAuth ; aucune donnée de candidat ne doit transiter dans GitHub.

**Important :** `clasp push --force` synchronise du code source ; ce n'est ni une migration des tables Sheets, ni une publication d'application web, ni une mise en service utilisateur. L'existence de comptes, déclencheurs Apps Script, droits d'accès et méthodes de bascule devra être confirmée séparément.

## Décision de mise en service

Au terme de la recette, inscrire dans un ticket GitHub privé ou le registre de validation interne : version Git exacte, date, autorité décisionnaire, résultat des tests, sauvegarde vérifiée, état des habilitations et plan de retour arrière. Ne pas publier de données personnelles ou de justificatifs dans le dépôt public.

Aucun contrôle automatique ne remplace la confirmation formelle par les responsables habilités.

## Approbation exprimée dans la conversation de suivi

La décision d'approuver une version du MVP peut être communiquée explicitement dans les échanges avec le coordinateur. Avant publication, la demande doit préciser **le commit Git exact**, le périmètre fonctionnel, la cible Apps Script, le résultat de recette et les réserves éventuelles. Une consigne générale comme « dès que c'est prêt » définit le processus, mais **n'approuve aucune version précise**.

L'accord donné dans la conversation doit être consigné dans le registre interne de validation sous une forme vérifiable (sans y publier de données personnelles ni de secrets), puis rapproché de la checklist et du commit déployé. Les mécanismes de contrôle GitHub restent obligatoires, notamment l'approbation technique de l'environnement de production lorsqu'elle est exigée. L'approbation conversationnelle ne contourne jamais ces contrôles ni les validations statutaires de l'UR.

En cas de modification du commit candidat après validation, une nouvelle vérification et, si nécessaire, une nouvelle approbation sont requises.
