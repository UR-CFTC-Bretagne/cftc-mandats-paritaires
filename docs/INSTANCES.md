# Référentiel des instances — contrat de données (préparatoire)

Un référentiel `Instances` peut contenir les colonnes :
`INSTANCE_ID`, `Nom`, `Type`, `Actif`, `Validation_metier`.

La résolution automatique d'un nom est autorisée **uniquement** lorsque l'instance est active, validée par le métier et que la correspondance est unique. Une ambiguïté ou un nom inconnu n'entraîne **aucune affectation automatique**.

Le module `src/InstanceRegistry.gs` est pur et testable sans Google Workspace. **Il ne créé ni ne modifie d'instance**, ne déduit aucune règle de mandatement et n'ajoute aucune pièce obligatoire par défaut.

Avant son utilisation sur des données réelles, le coordinateur doit valider la nomenclature des instances, leurs identifiants, les habilitations et les règles documentaires applicables. Le référentiel demeure distinct du statut officiel des décisions.

## Utilisation par US-002

Le diagnostic en lecture seule ouvre, si elle existe, la feuille `Instances` du **classeur TEST** configuré, et vérifie la présence de cinq colonnes dans cet ordre. Lorsque la feuille est absente, aucune instance n'est considérée comme validée : un `Instance_ID` simplement renseigné ne suffit pas.

Si un identifiant correspond à une instance inactive ou non validée, la candidature demeure `INCOMPLET`. Ce résultat ne modifie ni le référentiel ni le statut officiel du mandat.

**Recette nécessaire :** tester un identifiant inconnu, une instance inactive, une instance à valider, et une instance approuvée ; vérifier les droits d'accès et le format réel de la table avant tout déploiement.
