// enum
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
  validateHeader(sheet);

  var headerRange = getHeaderRange(sheet);
  for (var column = 1; column <= sheet.getLastColumn(); column++) {
    resetRange(getColumnDataRange(sheet, column));

    var headerName = headerRange.getCell(1, column).getValue();
    switch(headerName) {
      case "#SampleID":
        markDuplicates(sheet, column);
        markInvalidCells(sheet, column, /[a-z0-9.]+/ig, Status.WARNING,
                         Status.ERROR, "sample ID",
                         "Only MIENS-compliant characters are allowed.");
        break;

      case "BarcodeSequence":
        markDuplicates(sheet, column);
        // TODO only accept nondegenerate characters
        markInvalidCells(sheet, column, /[acbdghkmnsrtwvy,]+/ig, Status.ERROR,
                         Status.ERROR, "barcode sequence",
                         "Only IUPAC DNA characters are allowed.");
        break;

      case "LinkerPrimerSequence":
        // Checks against valid IUPAC DNA characters (case-insensitive).
        markInvalidCells(sheet, column, /[acbdghkmnsrtwvy,]+/ig, Status.ERROR,
                         Status.ERROR, "linker primer sequence",
                         "Only IUPAC DNA characters are allowed.");
        break;
        
      default:
        // generic metadata column
        markInvalidCells(sheet, column, /[a-z0-9_.\-+% ;:,\/]+/ig, Status.WARNING,
                         Status.WARNING, "metadata");
    }
  }
};

function getColumnDataRange(sheet, column) {
  var startRow = 2;
  var lastRow = sheet.getLastRow();
  return sheet.getRange(startRow, column, lastRow - startRow + 1);
};

function markCell(cell, status, message) {
  var currentStatus = cell.getBackgroundColor();
  if (currentStatus != Status.ERROR) {
    cell.setBackground(status);
  }
  
  var currentNote = cell.getNote();
  var newNote = null;
  if (currentNote) {
    newNote = currentNote + "\n\n" + message;
  }
  else {
    newNote = message
  }
  
  cell.setNote(newNote);
};

function resetRange(range) {
  range.setBackground(Status.RESET);
  range.clearNote();
};
