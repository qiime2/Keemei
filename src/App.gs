function onInstall(e) {
  onOpen(e);
};

function onOpen(e) {
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem("Validate QIIME mapping file", "validateQiime")
      .addItem("Validate SRGD file", "validateSrgd")
      .addItem("Validate Qiita sample template (experimental)", "validateQiitaSampleTemplate")
      .addSeparator()
      .addItem("Clear validation status", "clear")
      .addItem("About", "about")
      .addToUi();
};

function validateQiime() {
  validate_(getQiimeFormatSpec_);
};

function validateSrgd() {
  validate_(getSrgdFormatSpec_);
};

function validateQiitaSampleTemplate() {
  validate_(getQiitaSampleTemplateFormatSpec_);
};

function clear() {
  resetSheetView_(SpreadsheetApp.getActiveSheet());
};

function about() {
  var htmlOutput = HtmlService
     .createHtmlOutputFromFile("About")
     .setSandboxMode(HtmlService.SandboxMode.IFRAME)
     .setHeight(350);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "About Keemei");
};
