# gtm-json-converter
This tool converts json GTM exports into csv. It provides two export files:
1. A full inventory of the key elements of the account
  * Account ID
  * Container ID
  * Container Name
  * Public Container ID
  * Asset Category (folder, template, tag, trigger, variable)
  * Asset ID
  * Asset Name
  * Asset Type
  * Status ("paused" if disabled/paused)
  * Consent Status
  * Tag Firing Option
  * Firing Trigger ID	
  * Blocking Trigger ID
  * Parameters
  * Parent Folder ID
  * Parent Folder Name

2. An breakout of each trigger assigned to each tag (great for evaluating where/how triggers are used)
  * Account ID
  * Container Name
  * Tag ID
  * Tag Name
  * Status ("paused" if disabled/paused)
  * Asset Category (folder, template, tag, trigger, variable)
  * Asset Type
  * Tag Firing Option
  * Parent Library
  * Parent Folder ID
  * Parent Folder Name
  * Firing Trigger ID
  * Firing Trigger Name
  * Blocking Trigger ID
  * Blocking Trigger Name

Try it out! [GTM Inventory!](http://sandbox.evolytics.com/b/gtm-inventory/)
