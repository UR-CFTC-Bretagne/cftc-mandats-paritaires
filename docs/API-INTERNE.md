# Contrat API métier interne — API-001

## Objet et périmètre

L'architecture cible est **API-first interne** : les services métier communiquent progressivement avec un contrat d'accès abstrait, indépendamment du moteur de stockage. Le MVP continue à employer Google Sheets ; PostgreSQL et une API HTTP sécurisée demeurent des **options futures**, non déployées.

Le module `src/DataAccess.gs` est une première brique **en lecture seule**, sans `doGet`, `doPost`, endpoint public, connexion réseau ou identité fictivement déduite d'une requête utilisateur.

## Ressources en lecture

| Ressource | Clé technique | Portée requise |
| --- | --- | --- |
| `personnes` | `PERSONNE_ID` | `personnes:read` |
| `candidatures` | `CAND_ID` | `candidatures:read` |
| `instances` | `INSTANCE_ID` | `instances:read` |
| `decisions` | `DECISION_ID` | `decisions:read` |

Interface `MandatsDataAccess.create({readTable,authorize,audit})` puis `get(resource,recordId,context)`.

- `readTable(table)` retourne `{headers,rows}` depuis un stockage de confiance.
- `authorize(request)` doit répondre **exactement** `true`, sur la base d'une identité et de droits attestés côté serveur.
- `audit(event)` doit confirmer l'enregistrement en renvoyant **exactement** `true`. Une simple impression dans les logs ne constitue pas un audit durable.
- `context.principalId` doit être construit côté serveur par un composant d'authentification non encore développé. **Une chaîne fournie par un client ne suffit pas à établir l'identité.**
- Le service interdit les ressources hors liste blanche et les doublons de clé. Il refuse l'accès si la politique d'autorisation ou l'audit échoue.
- Le retour est un enregistrement brut : **il n'existe pas encore de projection de champs par rôle**. Aucun appel avec données personnelles n'est autorisé en production avant réalisation de cet élément.

## Limites du premier incrément

Le module est testable sur des données fictives, mais **n'est pas connecté aux services US-001 à US-004**. Il ne stocke ni ne modifie de données et n'est pas publié comme API accessible à des tiers. L'autorisation, l'audit persistant et les contrôles de champs sont des adaptateurs à implémenter et auditer séparément. Un véritable contrôle d'accès doit vérifier aussi l'appartenance du dossier et les autorisations de l'utilisateur au niveau de la ressource.

## Prochain incrément

1. Implémenter l'authentification serveur avec gestion explicite des rôles UR/UD/syndicat/mandaté.
2. Mettre en place la restriction des colonnes et des dossiers par rôle et une traçabilité durable.
3. Adapter progressivement les services existants sans modifier les règles métier.
4. Évaluer ensuite une spécification OpenAPI 3.1 et la migration PostgreSQL selon les besoins réels de volumétrie, d'intégrité et de confidentialité.

La mise en production de ce module est **bloquée** tant que l'autorisation et l'audit ne sont pas raccordés à des implémentations vérifiables. Aucune donnée personnelle ni secret n'est ajouté au dépôt.
