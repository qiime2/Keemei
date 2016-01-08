function renderSidebarView_(sheet, validationResults) {
  var sidebar = HtmlService.createTemplateFromFile('Sidebar');

  var errorCount = 0;
  var warningCount = 0;
  for (var a1 in validationResults) {
    if (validationResults.hasOwnProperty(a1)) {
      var cellResults = validationResults[a1];

      if (cellResults.hasOwnProperty("errors")) {
        errorCount += cellResults["errors"].length;
      }
      if (cellResults.hasOwnProperty("warnings")) {
        warningCount += cellResults["warnings"].length;
      }
    }
  }

  // Perform natural sort of cells based on A1 notation.
  // TODO: improve sorting so that B1 comes before AA1, etc.
  var sortedCells = Object.keys(validationResults).sort(naturalCompare_);
  var invalidCells = [];
  for (var i = 0; i < sortedCells.length; i++) {
    invalidCells.push(validationResults[sortedCells[i]]);
  }

  sidebar.data = {
    sheetId: sheet.getSheetId(),
    sheetName: sheet.getSheetName(),
    summary: {
      invalidCount: sortedCells.length,
      errorCount: errorCount,
      warningCount: warningCount
    },
    invalidCells: invalidCells
  };

  SpreadsheetApp.getUi().showSidebar(sidebar.evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle("Keemei validation report"));
};

function focus(sheetId, a1) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var activeSheet = ss.getActiveSheet();

  if (activeSheet.getSheetId() !== sheetId) {
    var sheets = ss.getSheets();
    var sheet = null;
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getSheetId() === sheetId) {
        sheet = sheets[i];
        break;
      }
    }

    if (sheet === null) {
      var ui = SpreadsheetApp.getUi();
      ui.alert("Cannot find sheet",
               "Cannot find the sheet this validation report applies to. The sheet may have been deleted.",
               ui.ButtonSet.OK);
      return;
    }
    activeSheet = ss.setActiveSheet(sheet);
  }
  activeSheet.setActiveSelection(a1);
};
