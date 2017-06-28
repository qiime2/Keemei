function onInstall(e) {
  onOpen(e);
};

function onOpen(e) {
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem("Validate QIIME 1 mapping file", "validateQiime1")
      .addItem("Validate QIIME 2 mapping file", "validateQiime2")
      .addItem("Validate SRGD file", "validateSrgd")
      .addItem("Validate Qiita sample template (experimental)", "validateQiitaSampleTemplate")
      .addSeparator()
      .addItem("Clear validation status", "clear")
      .addItem("About", "about")
      .addSeparator()
      .addSubMenu(SpreadsheetApp.getUi().createMenu("Developer tools")
          .addItem("Create simulated QIIME 1 mapping file dataset", "createSimulatedData")
          .addItem("Run benchmarks: dataset size and error rate", "runDatasetSizeBenchmarks")
          .addItem("Run benchmarks: rule size", "runRuleSizeBenchmarks"))
      .addToUi();
};

function validateQiime1() {
  validate_(getQiime1FormatSpec_);
};

function validateQiime2() {
  validate_(getQiime2FormatSpec_);
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
     .setWidth(650)
     .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "About Keemei");
};
