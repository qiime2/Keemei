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

function renderSheetView_(sheet, report) {
  var range = sheet.getDataRange();
  var numRows = range.getNumRows();
  var numColumns = range.getNumColumns();
  var state = initializeState_(numRows, numColumns);

  var validationResults = report.validationResults;
  for (var a1 in validationResults) {
    if (validationResults.hasOwnProperty(a1)) {
      var cellResults = validationResults[a1];
      var rowIdx = cellResults["position"][0];
      var columnIdx = cellResults["position"][1];

      var color = Color.RESET;
      var note = [];
      if (cellResults.hasOwnProperty("errors") && cellResults["errors"].length > 0) {
        color = Color.ERROR;
        note.push("ERRORS:\n\n" + buildNote_(cellResults["errors"]));
      }
      if (cellResults.hasOwnProperty("warnings") && cellResults["warnings"].length > 0) {
        if (color !== Color.ERROR) {
          color = Color.WARNING;
        }
        note.push("WARNINGS:\n\n" + buildNote_(cellResults["warnings"]));
      }
      note = note.join("\n\n");

      state.colors[rowIdx][columnIdx] = color;
      state.notes[rowIdx][columnIdx] = note;
    }
  }

  range.setBackgrounds(state.colors);
  range.setNotes(state.notes);
};

function initializeState_(numRows, numColumns) {
  return {
    colors: initializeGrid_(numRows, numColumns, Color.RESET),
    notes: initializeGrid_(numRows, numColumns, "")
  };
};

function initializeGrid_(numRows, numColumns, value) {
  var grid = [];
  for (var i = 0; i < numRows; i++) {
    var row = [];
    for (var j = 0; j < numColumns; j++) {
      row.push(value);
    }
    grid.push(row);
  }
  return grid;
};

function buildNote_(messages) {
  var joinedMessages = [];
  for (var i = 0; i < messages.length; i++) {
    joinedMessages.push(messages[i].join("\n\n"));
  }
  return joinedMessages.join("\n\n");
};
