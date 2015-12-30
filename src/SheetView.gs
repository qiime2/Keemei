// TODO: make these colors customizable
// color choices taken from http://isabelcastillo.com/error-info-messages-css
var Color = {
  WARNING: "#FEEFB3",
  ERROR: "#FFBABA",
  RESET: "#ffffff"
};

function resetSheetView_(sheet) {
  var range = sheet.getDataRange();
  range.setBackground(Color.RESET);
  range.clearNote();
};

function renderSheetView_(sheet, validationResults) {
  var range = sheet.getDataRange();
  var state = initializeState_(range);

  for (var a1 in validationResults) {
    if (validationResults.hasOwnProperty(a1)) {
      var cellResults = validationResults[a1];
      var rowIdx = cellResults["position"].row - 1;
      var columnIdx = cellResults["position"].column - 1;

      var color = Color.RESET;
      var note = [];
      if (cellResults.hasOwnProperty("errors") && cellResults["errors"].length > 0) {
        color = Color.ERROR;
        note.push("ERRORS:\n\n" + cellResults["errors"].join("\n\n"));
      }
      if (cellResults.hasOwnProperty("warnings") && cellResults["warnings"].length > 0) {
        if (color !== Color.ERROR) {
          color = Color.WARNING;
        }
        note.push("WARNINGS:\n\n" + cellResults["warnings"].join("\n\n"));
      }
      note = note.join("\n\n");

      state.colors[rowIdx][columnIdx] = color;
      state.notes[rowIdx][columnIdx] = note;
    }
  }

  range.setBackgrounds(state.colors);
  range.setNotes(state.notes);

  if (Object.keys(validationResults).length < 1) {
    var ui = SpreadsheetApp.getUi();
    ui.alert("Valid spreadsheet", "All's well! Your spreadsheet is valid.", ui.ButtonSet.OK);
  }
};

function initializeState_(range) {
  colors = initializeGrid_(range, Color.RESET);
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
