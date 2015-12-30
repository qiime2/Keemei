function onInstall(e) {
  onOpen(e);
};

function onOpen(e) {
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem("Validate QIIME mapping file", "validate")
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

  // TODO: required headers and their locations are currently hardcoded for QIIME metadata
  var requiredHeaders = {
    "#SampleID": [1, "first"],
    "BarcodeSequence": [2, "second"],
    "LinkerPrimerSequence": [3, "third"],
    "Description": [sheet.getLastColumn(), "last"]
  };

  var validationResults = [];
  validationResults.push(validateHeader_(sheet, requiredHeaders));
  validationResults.push(validateColumns_(sheet));
  validationResults = mergeValidationResults_(validationResults);

  renderSheetView_(sheet, validationResults);
};

function clear() {
  resetSheetView_(SpreadsheetApp.getActiveSheet());
};

function about() {
  var htmlOutput = HtmlService
     .createHtmlOutputFromFile("About")
     .setSandboxMode(HtmlService.SandboxMode.NATIVE)
     .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "About Keemei");
};
