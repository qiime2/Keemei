// TODO: make these colors customizable
// color choices taken from http://isabelcastillo.com/error-info-messages-css
var Status = {
  SUCCESS: "#DFF2BF",
  WARNING: "#FEEFB3",
  ERROR: "#FFBABA",
  RESET: "#ffffff"
};

function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [
    {
      name: "QIIME mapping file format (versions 0.92-1.9.x)",
      functionName: "validate"
    },
    {
      name: "Clear status",
      functionName: "clear"
    }
  ];
  sheet.addMenu("Validate metadata", entries);
};

function validate() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getDataRange();
  var state = initializeState_(range);

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

function clear() {
  var range = SpreadsheetApp.getActiveSheet().getDataRange();
  range.setBackground(Status.RESET);
  range.clearNote();
};
