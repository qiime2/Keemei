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
  var sheetData = sheet.getDataRange().getDisplayValues();

  // TODO: required headers and their locations are currently hardcoded for QIIME metadata
  var requiredHeaders = {
    "#SampleID": [0, "first"],
    "BarcodeSequence": [1, "second"],
    "LinkerPrimerSequence": [2, "third"],
    "Description": [sheetData[0].length - 1, "last"]
  };

  var validationResults = [];
  validationResults.push(validateHeader_(sheetData, requiredHeaders));
  validationResults.push(validateColumns_(sheetData));
  validationResults = mergeValidationResults_(validationResults);

  renderSheetView_(sheet, validationResults);
  renderSidebarView_(sheet, validationResults);
};

function clear() {
  resetSheetView_(SpreadsheetApp.getActiveSheet());
};

function about() {
  var htmlOutput = HtmlService
     .createHtmlOutputFromFile("About")
     .setSandboxMode(HtmlService.SandboxMode.IFRAME)
     .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "About Keemei");
};
