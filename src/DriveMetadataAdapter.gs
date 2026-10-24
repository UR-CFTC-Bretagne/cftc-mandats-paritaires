/** Adaptateur Drive en lecture seule : aucune consultation du contenu ni du partage. */
const MandatsDriveMetadataAdapter=(()=>{
  function isAccessibleFile(fileId){
    if(typeof fileId!=='string'||!fileId.trim())return false;
    try{
      const file=DriveApp.getFileById(fileId.trim());
      // Only check existence accessible to the script account and trash state.
      return Boolean(file && !file.isTrashed());
    }catch(_error){
      // Missing, forbidden or unsupported file references all fail closed.
      // Never log exceptions: messages can contain identifiers.
      return false;
    }
  }
  return Object.freeze({isAccessibleFile});
})();
