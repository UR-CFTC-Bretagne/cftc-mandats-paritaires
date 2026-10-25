# API-002 — Politique d'habilitation territoriale

## Incrément implémenté

`src/AccessPolicy.gs` fournit une politique RBAC en mémoire et le filtrage de colonnes. Le fonctionnement est **refus par défaut** : identité, rôle, relation au dossier et attestation régionale doivent être présents et valides.

| Rôle technique | Règle préparatoire |
| --- | --- |
| `UR_COORDINATEUR` / `UR_RESPONSABLE` | Accès régional uniquement si `dossiersRegionauxAutorises === true` |
| `UD_RESPONSABLE` | Même `UD_ID` attesté sur le dossier |
| `SYNDICAT_RESPONSABLE` | Même `Syndicat_ID` attesté sur le dossier |
| `MANDATE` | Même `PERSONNE_ID` attesté sur le dossier |
| Tous les autres rôles | Refus |

La lecture des décisions est **réservée aux rôles UR** avec `decisionsAutorisees === true`. Les droits de validation ou de signature ne sont pas implémentés.

## Filtrage

La projection n'expose que les colonnes prévues dans des listes blanches. Aucun champ supplémentaire n'est recopié, même si de nouvelles colonnes apparaissent dans Sheets. Pour le mandaté, la projection `personnes` contient seulement identifiant, nom, prénom et courriel.

## Conditions d'intégration

1. L'objet `principal` doit impérativement venir d'une **authentification serveur**, jamais d'un champ Forms, d'une requête HTTP ou d'un attribut client.
2. La politique suppose que chaque `record` possède les attributs de rattachement pertinents. Or `Candidatures` ne porte pas actuellement `UD_ID` ni `Syndicat_ID`. Un **résolveur serveur** devra enrichir le contexte depuis `Personnes` en contrôlant la clé `PERSONNE_ID`, les doublons et les absences. Tant que ce raccordement n'existe pas, l'accès territorial à ces enregistrements est refusé.
3. Le rôle `MANDATE` doit être lié à la personne par une preuve d'identité indépendante, et non par une valeur libre.
4. `AccessPolicy` est encore indépendant de `DataAccess` ; aucun service opérationnel ne l'utilise. Le moteur ne remplace pas l'audit durable requis par API-001.
5. Avant production : valider la matrice des droits avec l'UR, ajouter les tests d'intégration de résolution des dossiers et documenter les habilitations/révocations, puis effectuer la recette sécurité.

## Tests

`tests/access-policy.test.js` vérifie les rôles connus/inconnus, les accès inter-UD, inter-syndicats, le périmètre individuel, les décisions sensibles, et la projection de colonnes.

**Statut : prototype de règles métier sur données fictives, non connecté à des informations nominatives et non homologué.**
