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
  var range = sheet.getDataRange();
  var state = initializeState_(range);

  resetStatus_(range);
  validateHeader_(sheet, state);

  var headerRange = getHeaderRange_(sheet);
  for (var column = 1; column <= sheet.getLastColumn(); column++) {
    var headerName = headerRange.getCell(1, column).getValue();

    switch(headerName) {
      case "#SampleID":
        markDuplicates_(sheet, column, state);
        markInvalidCells_(sheet, column, state, /[a-z0-9.]+/ig, Status.WARNING,
                          Status.ERROR, "sample ID",
                          "Only MIENS-compliant characters are allowed.");
        break;

      case "BarcodeSequence":
        markDuplicates_(sheet, column, state);
        // TODO only accept nondegenerate characters
        markInvalidCells_(sheet, column, state, /[acbdghkmnsrtwvy,]+/ig, Status.ERROR,
                          Status.ERROR, "barcode sequence",
                          "Only IUPAC DNA characters are allowed.");
        break;

      case "LinkerPrimerSequence":
        // Checks against valid IUPAC DNA characters (case-insensitive).
        markInvalidCells_(sheet, column, state, /[acbdghkmnsrtwvy,]+/ig, Status.ERROR,
                          Status.ERROR, "linker primer sequence",
                          "Only IUPAC DNA characters are allowed.");
        break;

      default:
        // generic metadata column
        markInvalidCells_(sheet, column, state, /[a-z0-9_.\-+% ;:,\/]+/ig, Status.WARNING,
                          Status.WARNING, "metadata");
    }
  }

  setStatus_(range, state);
};

function getHeaderRange_(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn());
};

function getColumnDataRange_(sheet, column) {
  var startRow = 2;
  var lastRow = sheet.getLastRow();
  return sheet.getRange(startRow, column, lastRow - startRow + 1);
};

function initializeState_(range) {
  colors = initializeGrid_(range, Status.RESET);
  notes = initializeGrid_(range, "");
  return {
    colors: colors,
    notes: notes
  };
};

function initializeGrid_(range, value) {
  var grid = [];
  for (var i = 0; i < range.getNumRows(); i++) {
    var row = [];
    for (var j = 0; j < range.getNumColumns(); j++) {
      row.push(value);
    }
    grid.push(row);
  }
  return grid;
};

function updateState_(state, position, color, note) {
  var i = position.row - 1;
  var j = position.column - 1;

  var currentColor = state.colors[i][j];
  if (currentColor != Status.ERROR) {
    state.colors[i][j] = color;
  }

  var currentNote = state.notes[i][j];
  var newNote = note;
  if (currentNote) {
    newNote = currentNote + "\n\n" + newNote;
  }
  state.notes[i][j] = newNote;
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

function resetStatus_(range) {
  range.setBackground(Status.RESET);
  range.clearNote();
};

function setStatus_(range, state) {
  range.setBackgrounds(state.colors);
  range.setNotes(state.notes);
};
