// TODO: make these colors customizable
// color choices taken from http://isabelcastillo.com/error-info-messages-css
var Status = {
  SUCCESS: "#DFF2BF",
  WARNING: "#FEEFB3",
  ERROR: "#FFBABA",
  RESET: "#ffffff"
};

function onInstall(e) {
  onOpen(e);
};

function onOpen(e) {
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem("Validate QIIME mapping file format (versions 0.92-1.9.x)", "validate")
      .addItem("Clear validation status", "clear")
      .addItem("About", "about")
      .addToUi();
};

function validate() {
  var sheet = SpreadsheetApp.getActiveSheet();

  if (isSheetEmpty_(sheet)) {
    var ui = SpreadsheetApp.getUi();
    ui.alert("Empty spreadsheet", "There is nothing to validate because the spreadsheet is empty.", ui.ButtonSet.OK);
    return;
  }

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

function about() {
  var htmlOutput = HtmlService
     .createHtmlOutputFromFile("About")
     .setSandboxMode(HtmlService.SandboxMode.NATIVE)
     .setHeight(175);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "About Keemei");
};
