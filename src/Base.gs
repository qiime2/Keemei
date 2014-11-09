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
  resetRange_(sheet.getDataRange());
  validateHeader_(sheet);

  var headerRange = getHeaderRange_(sheet);
  for (var column = 1; column <= sheet.getLastColumn(); column++) {
    var headerName = headerRange.getCell(1, column).getValue();
    switch(headerName) {
      case "#SampleID":
        markDuplicates_(sheet, column);
        markInvalidCells_(sheet, column, /[a-z0-9.]+/ig, Status.WARNING,
                          Status.ERROR, "sample ID",
                          "Only MIENS-compliant characters are allowed.");
        break;

      case "BarcodeSequence":
        markDuplicates_(sheet, column);
        // TODO only accept nondegenerate characters
        markInvalidCells_(sheet, column, /[acbdghkmnsrtwvy,]+/ig, Status.ERROR,
                          Status.ERROR, "barcode sequence",
                          "Only IUPAC DNA characters are allowed.");
        break;

      case "LinkerPrimerSequence":
        // Checks against valid IUPAC DNA characters (case-insensitive).
        markInvalidCells_(sheet, column, /[acbdghkmnsrtwvy,]+/ig, Status.ERROR,
                          Status.ERROR, "linker primer sequence",
                          "Only IUPAC DNA characters are allowed.");
        break;
        
      default:
        // generic metadata column
        markInvalidCells_(sheet, column, /[a-z0-9_.\-+% ;:,\/]+/ig, Status.WARNING,
                          Status.WARNING, "metadata");
    }
  }
};

function getHeaderRange_(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn());
};

function getColumnDataRange_(sheet, column) {
  var startRow = 2;
  var lastRow = sheet.getLastRow();
  return sheet.getRange(startRow, column, lastRow - startRow + 1);
};

function getValueToPositionsMapping_(range) {
  var values = range.getValues();
  
  var valueToPositions = {};
  for (var i = 0; i < values.length; i++) {
    for (var j = 0; j < values[i].length; j++) { 
      var value = values[i][j];
      var position = {
        row: range.getRow() + i,
        column: range.getColumn() + j
      };
      
      if (valueToPositions.hasOwnProperty(value)) {
        valueToPositions[value].push(position);
      }
      else {
        valueToPositions[value] = [position]; 
      }
    }
  }
  
  return valueToPositions;
};

function markCell_(cell, status, message) {
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

function resetRange_(range) {
  range.setBackground(Status.RESET);
  range.clearNote();
};
