# Référentiel des instances — contrat de données (préparatoire)

Un référentiel `Instances` peut contenir les colonnes :
`INSTANCE_ID`, `Nom`, `Type`, `Actif`, `Validation_metier`.

La résolution automatique d'un nom est autorisée **uniquement** lorsque l'instance est active, validée par le métier et que la correspondance est unique. Une ambiguïté ou un nom inconnu n'entraîne **aucune affectation automatique**.

Le module `src/InstanceRegistry.gs` est pur et testable sans Google Workspace. **Il ne créé ni ne modifie d'instance**, ne déduit aucune règle de mandatement et n'ajoute aucune pièce obligatoire par défaut.

Avant son utilisation sur des données réelles, le coordinateur doit valider la nomenclature des instances, leurs identifiants, les habilitations et les règles documentaires applicables. Le référentiel demeure distinct du statut officiel des décisions.
