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
      .addSeparator()
      .addSubMenu(SpreadsheetApp.getUi().createMenu("Developer tools")
          .addItem("Create simulated QIIME mapping file dataset", "createSimulatedData")
          .addItem("Run benchmarks: dataset size and error rate", "runDatasetSizeBenchmarks")
          .addItem("Run benchmarks: rule size", "runRuleSizeBenchmarks"))
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
     .setWidth(650)
     .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "About Keemei");
};
