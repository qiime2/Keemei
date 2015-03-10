function resetStatus_(range) {
  range.setBackground(Status.RESET);
  range.clearNote();
};

function setStatus_(range, state) {
  range.setBackgrounds(state.colors);
  range.setNotes(state.notes);
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
