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

  var requiredHeaders = {
    "#SampleID": [1, "first"],
    "BarcodeSequence": [2, "second"],
    "LinkerPrimerSequence": [3, "third"],
    "Description": [sheet.getLastColumn(), "last"]
  };
  validateHeader_(sheet, state, requiredHeaders);

  var headerRange = getHeaderRange_(sheet);
  for (var column = 1; column <= sheet.getLastColumn(); column++) {
    var headerName = headerRange.getCell(1, column).getValue();
    var columnRange = getColumnDataRange_(sheet, column);

    switch(headerName) {
      case "#SampleID":
        markDuplicates_(columnRange, state, "Duplicate cell");
        markInvalidCells_(columnRange, state, /[a-z0-9.]+/ig, Status.WARNING,
                          Status.ERROR, "sample ID",
                          "Only MIENS-compliant characters are allowed.");
        break;

      case "BarcodeSequence":
        markDuplicates_(columnRange, state, "Duplicate cell");
        // TODO only accept nondegenerate characters
        markInvalidCells_(columnRange, state, /[acbdghkmnsrtwvy,]+/ig, Status.ERROR,
                          Status.ERROR, "barcode sequence",
                          "Only IUPAC DNA characters are allowed.");
        break;

      case "LinkerPrimerSequence":
        // Checks against valid IUPAC DNA characters (case-insensitive).
        markInvalidCells_(columnRange, state, /[acbdghkmnsrtwvy,]+/ig, Status.ERROR,
                          Status.ERROR, "linker primer sequence",
                          "Only IUPAC DNA characters are allowed.");
        break;

      default:
        // generic metadata column
        markInvalidCells_(columnRange, state, /[a-z0-9_.\-+% ;:,\/]+/ig, Status.WARNING,
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

function markDuplicates_(range, state, note) {
  var duplicates = findDuplicates_(range);

  for (var i = 0; i < duplicates.length; i++) {
    var duplicate = duplicates[i];
    updateState_(state, duplicate, Status.ERROR, note);
  }
};

function findDuplicates_(range) {
  var valueToPositions = getValueToPositionsMapping_(range);

  var duplicates = [];
  for (var key in valueToPositions) {
    if (valueToPositions.hasOwnProperty(key)) {
      var positions = valueToPositions[key];

      if (positions.length > 1) {
        duplicates = duplicates.concat(positions);
      }
    }
  }

  return duplicates;
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

function markInvalidCells_(range, state, regex, invalidCharactersStatus,
                           emptyCellStatus, label, messageSuffix, ignoredValues) {
  ignoredValues = (typeof ignoredValues === "undefined") ? {} : ignoredValues;

  var invalids = findInvalidCells_(range, regex, ignoredValues);

  for (var i = 0; i < invalids.length; i++) {
    var invalid = invalids[i];

    var msg = "Empty cell";
    var status = emptyCellStatus;
    if (invalid.invalidChars.length > 0) {
      msg = Utilities.formatString("Invalid character(s) in %s: %s", label, invalid.invalidChars);
      if (messageSuffix) {
        msg += Utilities.formatString("\n\n%s", messageSuffix);
      }
      status = invalidCharactersStatus;
    }

    updateState_(state, invalid, status, msg);
  }
};

function findInvalidCells_(range, regex, ignoredValues) {
  var values = range.getValues();

  var invalidPositions = [];
  for (var i = 0; i < values.length; i++) {
    for (var j = 0; j < values[i].length; j++) {
      var value = values[i][j];

      if (!ignoredValues.hasOwnProperty(value)) {
        var status = validateCell_(value, regex);

        if (!status.valid) {
          var position = {
            row: range.getRow() + i,
            column: range.getColumn() + j,
            invalidChars: status.invalidChars
          };
          invalidPositions.push(position);
        }
      }
    }
  }

  return invalidPositions;
};

function validateCell_(value, regex) {
  var valid = false;
  var invalidChars = "";

  if (value.length > 0) {
    invalidChars = value.replace(regex, "");

    if (invalidChars.length == 0)
      valid = true;
  }

  return {
    valid: valid,
    invalidChars: invalidChars
  };
};

function markMissingValues_(range, state, requiredValues, label) {
  var valueToPositions = getValueToPositionsMapping_(range);

  var missingValues = [];
  for (var requiredValue in requiredValues) {
    if (requiredValues.hasOwnProperty(requiredValue)) {
      if (!valueToPositions.hasOwnProperty(requiredValue)) {
        missingValues.push(requiredValue);
      }
    }
  }

  if (missingValues.length > 0) {
    var message = Utilities.formatString("Missing required %s: %s", label, missingValues.join(", "));
    updateState_(state, {row: range.getRow(), column: range.getColumn()}, Status.ERROR, message);
  }
};
