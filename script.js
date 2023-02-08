function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // Check if json then list some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        if (f.name.indexOf("json") !== -1) {
            output.push('<div id="fileStats"><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                f.size, ' bytes, last modified: ',
                f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                '</div>');
        } else {
            alert("File must be a valid GTM json export");
            throw new Error("File must be a valid GTM json export");
        }

    }
    document.getElementById('list').innerHTML = '<div>' + output.join('') + '</div>';
    // document.getElementById('options').innerHTML ='<input name="filename" id="filename" type="text" placeholder="GTM_Export"/><select class="selectpicker"><option>.xlsx</option><option>.csv</option></select>'
    document.getElementById('parse').innerHTML = '<button id="parseButton" type="button">Download</button>';

    // begin parsing
    document.getElementById("parseButton").addEventListener("click", function () {
        // Read in the file as Text.
        for (var i = 0; i < files.length; ++i) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = function (e) {
                var text = reader.result;
                var jsonData = JSON.parse(text);
                console.log(jsonData);

                let gtm_output = gtmHelper.getAllAssets(jsonData);
                gtmHelper.tagsOnly = gtm_output.filter(function (item) {
                    if (item.assetCategory === "tag") {
                        return item;
                    }
                });

                gtmHelper.triggersOnly = gtm_output.filter(function (item) {
                    if (item.assetCategory === "trigger") {
                        return item;
                    }
                });

                gtmHelper.variablesOnly = gtm_output.filter(function (item) {
                    if (item.assetCategory === "variable" || item.assetCategory === "variable_builtin") {
                        return item;
                    }
                });

                gtmHelper.download(gtmHelper.convertToCSV(gtm_output), "full");
                gtmHelper.getTriggersByTag(gtmHelper.tagsOnly, gtmHelper.triggersOnly); // also downloads csv

            };
            reader.readAsText(file);
        }
    });
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);