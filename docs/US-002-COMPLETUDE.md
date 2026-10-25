# US-002 — Diagnostic de complétude des candidatures

## Objectif
Fournir au coordinateur un diagnostic explicable des informations et justificatifs manquants. Aucun dossier n'est déclaré « prêt à décider » par cet outil.

## Architecture
- `src/CompletenessDomain.gs` : moteur de règles **pur**, sans API Google.
- `src/CompletenessPolicy.gs` : politique de base conservatrice, sans justificatif universel supposé.
- `tests/completeness-domain.test.js` : cas de complétude, pièces, vérifications et immutabilité.

## États de diagnostic
- `INCOMPLET` : au moins une information ou pièce explicitement obligatoire manque.
- `A_VERIFIER` : tout est présent mais certains champs demandent encore vérification.
- `PRET_A_INSTRUIRE` : contrôles de complétude satisfaits ; **aucune validation statutaire ni décision** implicite.

Ces états sont des résultats de diagnostic, distincts des statuts officiels du mandat.

## Contrat de la fonction
`MandatsCompletenessDomain.evaluate(dossier, policy)` retourne un résultat non nominatif composé d'un statut, de listes structurées des champs/pièces manquants et du nombre de vérifications restantes. La fonction ne modifie aucune entrée.

## Décisions métier en attente
- La liste des pièces exigibles selon l'instance, l'autorité compétente et le type de mandat.
- La politique de vérification et l'identité des responsables habilités.
- La source des métadonnées de pièces et la gestion des droits Drive.
- La procédure de relance des candidats et les durées de conservation.

## Sécurité
Pas de lecture du formulaire réel, pas d'envoi automatique, pas d'écriture de données, pas de changement des statuts de candidature. Les tests utilisent uniquement des données fictives.

## Dépendance
Cette branche part de la branche de US-001 ; une **Pull Request empilée** est créée vers celle-ci. La fusion de US-002 dans `main` devra intervenir seulement après validation de US-001 et revue de son socle.

## Intégration en lecture seule — incrément 2

- `src/CompletenessProjection.gs` : transforme les lignes des tables `Personnes` et `Candidatures` en dossier de diagnostic, sans inventer de données absentes.
- `src/CompletenessService.gs` : lit uniquement le classeur **TARGET_TEST_SPREADSHEET_ID** via `SheetsRepository`, calcule un résumé agrégé et renvoie les diagnostics à l'appelant.
- `simulerCompletudeCandidaturesTest()` : point d'entrée manuel réservé aux utilisateurs habilités du projet Apps Script de test.
- `tests/completeness-projection.test.js` : projections, référence manquante, référentiel incohérent et immutabilité.

**Attention :** US-001 stocke actuellement `Instance_ID` vide tant que le rapprochement avec les instances n'est pas réalisé. En conséquence, la politique de base signale ce champ comme manquant. Le moteur **n'interprète pas** un champ vide comme une instance vérifiée et ne peut pas rattacher automatiquement une pièce Drive. Les obligations documentaires restent à définir par instance.

Le diagnostic n'écrit rien dans les tables sources et ne change jamais le statut de candidature. Son retour contient des identifiants techniques de candidatures et des intitulés de champs manquants ; restreindre l'accès à l'environnement de test et ne pas publier le résultat dans GitHub.

## Exigences documentaires par instance — incrément 3

Une feuille **`Exigences_instances`** peut être définie dans le classeur de TEST avec les colonnes exactes :
`INSTANCE_ID`, `Document_code`, `Document_libelle`, `Obligatoire`, `Validation_metier`.

Les deux indicateurs acceptent uniquement **oui** ou **non**. Le moteur refuse les lignes ambiguës ou les doublons d'une même règle.

- Règles documentaires **absentes ou non validées** : un dossier autrement complet demeure `A_VERIFIER`.
- Pièce **explicitement obligatoire**, absente du dossier : `INCOMPLET`.
- Pièce **facultative** et politique validée : aucune pièce manquante ajoutée.
- La vérification du contenu, de l'authenticité et des accès aux justificatifs est **hors périmètre de ce lot**.

⚠️ US-002 ne dispose pas encore d'un adaptateur documentaire Drive qui atteste la présence des pièces. La projection du dossier utilise donc `documents: {}` ; une pièce obligatoire est considérée absente. Aucun document réel n'est consulté ou téléchargé.

Ce module ne prend jamais de décision officielle. La politique doit être validée par l'UR CFTC Bretagne pour chaque instance avant utilisation sur données réelles.

## Métadonnées de justificatifs — incrément 4

La feuille facultative `Pieces_candidatures` du **classeur TEST** utilise les colonnes exactes :
`CAND_ID`, `Document_code`, `Drive_file_ID`, `Controle`, `Validation_metier`.

- `Controle` : `present`, `absent` ou `a_verifier` ;
- `Validation_metier` : `oui` ou `non` ;
- une preuve compte comme présente **uniquement** si la référence de fichier est non vide, `Controle=present` et `Validation_metier=oui` ;
- doublons et statuts inconnus bloquent le diagnostic. Aucun contenu de pièce n'est lu ou exposé dans les résultats.
- en l'absence de feuille ou de ligne correspondante, toute pièce obligatoire reste manquante.

**Limite importante :** il s'agit d'une **attestation déclarative issue du classeur TEST**, et non d'une vérification par Google Drive. Ni l'existence, ni les droits d'accès, ni l'authenticité du fichier ne sont vérifiés. Le raccordement direct à Drive, la preuve de contrôle et les habilitations restent à spécifier et tester avant utilisation réelle.

La sortie du moteur comprend uniquement des indicateurs documentaires et identifiants techniques de candidatures. Ne pas afficher les `Drive_file_ID` dans les rapports.

## Contrôle technique Drive — incrément 5

`src/DriveMetadataAdapter.gs` expose `isAccessibleFile(fileId)` : cette fonction utilise **uniquement** `DriveApp.getFileById` et `file.isTrashed()`. Elle ne lit ni le contenu, ni les permissions, ni les noms des fichiers. Un accès refusé, un identifiant invalide ou un fichier à la corbeille retourne `false`, sans journaliser l'identifiant.

**Activation explicite en test uniquement :** ajouter la propriété de script `ALLOW_TEST_DRIVE_METADATA_READ=YES`. En l'absence de ce paramètre, aucune requête Drive n'est exécutée et toutes les preuves documentaires restent non vérifiées (stratégie *fail closed*).

La complétude documentaire exige désormais **simultanément** une attestation métier positive et un contrôle technique réussi. Cette vérification garantit seulement que le compte exécutant le script peut accéder à une référence de fichier non mise à la corbeille ; elle **ne prouve pas** l'authenticité, l'intégrité du contenu, le bon rattachement du document au candidat ou les droits de chaque utilisateur final.

**Recette obligatoire avant production :** tester fichier fictif accessible, référence inexistante, accès refusé et corbeille ; examiner les scopes OAuth et les habilitations du compte d'exécution. Aucune autorisation d'accès Drive ne doit être étendue sans validation.

**Blocage d'habilitation identifié :** le manifeste actuel `appsscript.json` ne déclare que la portée OAuth Google Sheets. Le contrôle Drive ne doit donc **pas être activé sur un déploiement réel** avant revue de sécurité, ajout approuvé du scope requis et validation des consentements utilisateurs. Dans cet état, l'accès Drive peut échouer et la preuve demeure absente ; c'est un comportement sûr et attendu. L'intégration n'est pas homologuée.

## Intégrité du rattachement candidature ↔ justificatif — incrément 6

Avant toute vérification technique, les lignes de `Pieces_candidatures` sont rapprochées des `CAND_ID` réellement présents dans la table `Candidatures`. Une référence documentaire orpheline bloque la simulation et nécessite un examen humain. Aucun rattachement par nom, prénom, courriel ou nom de fichier n'est utilisé.

Le vérificateur Drive est injecté comme dépendance et ses erreurs sont traitées en **échec conservateur** : une exception du service n'est ni réémise ni journalisée avec des identifiants. Aucune lecture Drive n'est effectuée si l'attestation métier est absente ou négative. Des tests automatisés vérifient ces garanties.

**À confirmer avant recette métier :** qui atteste que le fichier accessible correspond bien à la candidature concernée, et quelle preuve de cette vérification doit être conservée. Le lien technique par `CAND_ID` seul ne démontre pas le contenu ni le titulaire du document.
