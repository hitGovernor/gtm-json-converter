let allGTMAssets = [];
let results = {
  container: 0,
  folder: 0,
  tag: 0,
  template: 0,
  trigger: 0,
  variable: 0,
  variable_builtin: 0
};

let gtmHelper = {

  getAssetId: function (assetCategory, asset) {
    let retval = asset[assetCategory + "Id"] || "";
    return retval;
  },

  getConsentSettings: function (asset) {
    try {
      return asset.consentSettings.consentStatus || "";
    } catch (err) {
      return "";
    }
  },

  getParameters: function (asset) {
    let retval = [];
    let params = asset.parameter || [];
    params.forEach(function (item) {
      // retval.push(item.type + "~" + item.key);
      retval.push(item.key);
    });
    return retval.join("|");
  },

  getTagTriggerIds: function (assetCategory, asset) {
    try {
      return {
        firingTriggerId: asset.firingTriggerId.join("|"),
        blockingTriggerId: asset.blockingTriggerId.join("|")
      };
    } catch (err) {
      return "";
    }
  },

  getParentFolderName: function (folders, folderId) {
    let retval = "";
    folders.map(function (item) {
      if (item.folderId === folderId) {
        retval = item.name;
        return;
      }
    });
    return retval;
  },

  getTriggersByTag: function (tags_only, triggers_only) {
    let triggersByTag = [];

    tags_only.forEach(function (item) {
      class tmpClass {
        constructor() {
          this.account = item.ACCOUNTID;
          this.CONTAINERNAME = item.CONTAINERNAME;
          this.tagId = item.assetId;
          this.tagName = item.assetName;
          this.status = item.status;
          this.assetCategory = item.assetCategory;
          this.assetType = item.assetType;
          this.tagFiringOption = item.tagFiringOption;
          this.parentLibrary = item.parentLibrary;
          this.parentFolderId = item.parentFolderId;
          this.parentFolderName = item.parentFolderName;
          this.firingTriggerId = "";
          this.firingTriggerName = "";
          this.blockingTriggerId = "";
          this.blockingTriggerName = "";
        }
      }

      let firingTriggers = item.firingTriggerId.split("|");
      firingTriggers.forEach(function (lrule) {
        let tmpFiringObj = new tmpClass();

        triggers_only.filter(function (trigger) {
          if (trigger.assetId === lrule) {
            tmpFiringObj.firingTriggerId = trigger.assetId;
            tmpFiringObj.firingTriggerName = trigger.assetName;
          }
        });
        triggersByTag.push(tmpFiringObj);
      });

      let blockingTriggers = item.blockingTriggerId.split("|");
      blockingTriggers.forEach(function (lrule) {
        let tmpBlockingObj = new tmpClass();
        
        triggers_only.filter(function (trigger) {
          if (trigger.assetId === lrule) {
            tmpBlockingObj.blockingTriggerId = trigger.assetId;
            tmpBlockingObj.blockingTriggerName = trigger.assetName;
          }
        });
        triggersByTag.push(tmpBlockingObj);
      });
    });

    console.log("GTM_AUDIT: TRIGGERS BY TAG", triggersByTag);
    gtmHelper.download(gtmHelper.convertToCSV(triggersByTag), "by-loadrule");
  },

  /**
   * returns a comma-delimited string of all assets; suitable for copy/paste into spreadsheet
   * @param {array} assets - an array of objects, where each object represents a single asset
   * @returns {string}
   * @example gtmHelper.convertToCSV(gtmHelper.getAllAssets());
   */
  convertToCSV: function (assets) {
    let allBody = [];
    let headers = [];

    // build the csv header row based on keys in first asset
    headers = Object.keys(assets[0]).join(",") + "\n";

    // loop throug all assets to build the individual rows
    for (let item in assets) {
      let tmp = assets[item],
        tmpArray = [];

      for (let key in tmp) {
        tmpArray.push(tmp[key]);
      }

      allBody.push(tmpArray.join(","));
    }

    // join everything together w/ line breaks between asset rows
    return headers + allBody.join("\n");
  },

  /**
   * downloads inventory as a csv file
   * @param {string} data - csv-formatted input
   */
  download: function (data, suffix) {
    account = gtmHelper.accountId || "";
    let filename = 'gtm-inventory-' + account + ((suffix) ? "-" + suffix : "") + ".csv"
    const blob = new Blob([data], {
      type: 'text/csv'
    });

    // create object for download url
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url);
    a.setAttribute('download', filename);

    // download the file
    a.click();
  },

  getAllAssets: function (payload) {
    let ACCOUNTID = gtmHelper.accountId = payload.containerVersion.container.accountId || "";
    let CONTAINERID = payload.containerVersion.container.containerId || "";
    let CONTAINERNAME = payload.containerVersion.container.name || "";
    let PUBLICID = payload.containerVersion.container.publicId || "";
    let assetCategorysToRetrieve = ["folder", "template", "tag", "trigger", "variable", "variable_builtin"];
    let retval = [];

    // specifies the js object to evaluate for the asset type
    let assetSources = {
      folder: payload.containerVersion.folder,
      tag: payload.containerVersion.tag,
      template: payload.containerVersion.customTemplate,
      trigger: payload.containerVersion.trigger,
      variable: payload.containerVersion.variable,
      variable_builtin: payload.containerVersion.builtInVariable,
    }

    assetCategorysToRetrieve.forEach(function (assetCategory) {
      let assets = assetSources[assetCategory];

      for (let key in assets) {
        results[assetCategory]++;
        let tmp = {};
        let tagTriggerIds = gtmHelper.getTagTriggerIds(assetCategory, assets[key]);

        tmp.ACCOUNTID = ACCOUNTID;
        tmp.CONTAINERID = CONTAINERID;
        tmp.CONTAINERNAME = CONTAINERNAME;
        tmp.PUBLICID = PUBLICID;
        tmp.assetCategory = assetCategory;
        tmp.assetId = gtmHelper.getAssetId(assetCategory, assets[key]);
        tmp.assetName = assets[key].name;
        tmp.assetType = assets[key].type || "";
        tmp.status = (assets[key].paused) ? "paused" : "";
        tmp.consentSettings = gtmHelper.getConsentSettings(assets[key]);
        tmp.tagFiringOption = assets[key].tagFiringOption || "";
        tmp.firingTriggerId = tagTriggerIds.firingTriggerId || "";
        tmp.blockingTriggerId = tagTriggerIds.blockingTriggerId || "";
        tmp.parameters = gtmHelper.getParameters(assets[key]);
        tmp.parentFolderId = assets[key].parentFolderId || "";
        tmp.parentFolderName = gtmHelper.getParentFolderName(assetSources.folder, tmp.parentFolderId);

        allGTMAssets.push(tmp);
        retval.push(tmp);
      }
    });
    return retval;
  }
}


                        
// gtmHelper.getAllAssets(gtm);

// gtmHelper.tagsOnly = allGTMAssets.filter(function(item) {
//   if (item.assetCategory === "tag") {
//     return item;
//   }
// });
   
// gtmHelper.triggersOnly = allGTMAssets.filter(function(item) {
//   if (item.assetCategory === "trigger") {
//     return item;
//   }
// });

// gtmHelper.variablesOnly = allGTMAssets.filter(function(item) {
//   if (item.assetCategory === "variable" || item.assetCategory ===  "variable_builtin") {
//     return item;
//   }
// });


// gtmHelper.download(gtmHelper.convertToCSV(allGTMAssets), "full");
// gtmHelper.getTriggersByTag(gtmHelper.tagsOnly, gtmHelper.triggersOnly);