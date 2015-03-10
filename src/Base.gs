// TODO: make these colors customizable
var Status = {
  SUCCESS: "#00ff00",
  WARNING: "#ffff00",
  ERROR: "#ff0000",
  RESET: "#ffffff"
};

function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Validate metadata",
    functionName : "validate"
  }];
  sheet.addMenu("keemei", entries);
};

function validate() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getDataRange();
  var state = initializeState_(range);

  resetStatus_(range);

  // TODO: required headers and their locations are currently hardcoded for QIIME metadata
  var requiredHeaders = {
    "#SampleID": [1, "first"],
    "BarcodeSequence": [2, "second"],
    "LinkerPrimerSequence": [3, "third"],
    "Description": [sheet.getLastColumn(), "last"]
  };

  validateHeader_(sheet, state, requiredHeaders);
  validateColumns_(sheet, state);

  setStatus_(range, state);
};
