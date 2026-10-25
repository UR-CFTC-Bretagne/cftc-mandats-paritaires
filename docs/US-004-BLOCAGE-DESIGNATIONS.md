# US-004 — Bloquer les désignations sans validation

**Issue :** [#5](https://github.com/UR-CFTC-Bretagne/cftc-mandats-paritaires/issues/5).

## Périmètre développé (moteur pur)

Le module `MandatsDesignationGuard` vérifie les transitions préparatoires d'une décision. Il **n'écrit pas dans Google Sheets**, **ne génère aucun document**, **ne valide aucune compétence réelle** et **n'envoie aucun message**.

Les états `BROUILLON`, `EN_REVUE`, `VALIDEE`, `REFUSEE`, `AJOURNEE` correspondent à un **modèle cible de workflow** : les tables US-003 enregistrent encore les nouveaux dossiers en `BROUILLON`. Aucune transition persistante n'a été mise en œuvre.

| État initial | Nouvel état admissible | Conditions |
| --- | --- | --- |
| `BROUILLON` | `EN_REVUE` | Entrée en instruction ; aucun acte officiel |
| `EN_REVUE` | `VALIDEE` | Résultat `VALIDATION`, vérifications métier, autorité et justificatif de l'instance |
| `EN_REVUE` | `REFUSEE` | Résultat `REFUS`, contrôles explicites |
| `EN_REVUE` | `AJOURNEE` | Résultat `AJOURNEMENT`, contrôles explicites |
| État terminal | Aucune transition automatisée | Révision ou annulation à cadrer avec le métier |

## Défense en profondeur

Les trois confirmations `competenceVerifiee`, `justificatifVerifie` et `candidatureVerifiee` ne suffisent **pas** à elles seules. Une transition terminale exige aussi les trois contrôles **propres à l'instance** : `instanceValidee`, `autoriteCompetenteVerifiee` et `justificatifConformeInstance`. Le moteur refuse tout champ omis ou valant autre chose que le booléen `true`.

Ces contrôles sont pour l'instant **des attestations injectées**, et non des preuves vérifiées auprès d'une source externe. Leur source, leurs responsables et leur durée de validité doivent être établis avant production.

La propriété `officialDocumentAllowed` reste toujours `false` dans ce premier incrément, y compris lorsque les vérifications préalables sont satisfaites. Le déblocage de la production d'un acte officiel nécessitera un service distinct, des autorisations humaines et une recette dédiée. `notificationAllowed` reste également `false`.

## Points ouverts

- Identifier les autorités effectivement habilitées par instance et type de mandat.
- Préciser quels PV et justificatifs sont recevables et comment attester leur vérification.
- Définir qui peut confirmer une transition et les preuves d'identité/horodatage.
- Enregistrer les transitions et versions dans un audit durable, sans écrasement.
- Vérifier les règles de désignation après rejet, ajournement, annulation ou renouvellement.

## Sécurité et recette

Aucun accès au répertoire réel, aucun acte officiel produit, aucun envoi Gmail. Les tests automatisés couvrent les transitions permises, interdites, les résultats incompatibles et les contrôles manquants. Les scénarios réels nécessitent validation de l'UR CFTC Bretagne avant tout déploiement.
