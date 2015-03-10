function getColumnDataRange_(sheet, column) {
  var startRow = 2;
  var lastRow = sheet.getLastRow();
  return sheet.getRange(startRow, column, lastRow - startRow + 1);
};

// TODO: the validations applied to each column are hardcoded for QIIME metadata
function validateColumns_(sheet, state) {
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
};
