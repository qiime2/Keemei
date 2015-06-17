// TODO: the validations applied to each column are hardcoded for QIIME metadata
function validateColumns_(sheet, state) {
  var startRow = getMetadataStartRow_(sheet);
  var lastRow = sheet.getLastRow();

  if (startRow > lastRow) {
    // no metadata, only header and/or comments
    return;
  }

  var headers = getFormattedValues_(getHeaderRange_(sheet));
  for (var column = 1; column <= sheet.getLastColumn(); column++) {
    var columnRange = sheet.getRange(startRow, column, lastRow - startRow + 1);

    var header = headers[0][column - 1];
    switch(header) {
      case "#SampleID":
        markDuplicates_(columnRange, state, "Duplicate sample ID");
        markInvalidCells_(columnRange, state, /[a-z0-9.]+/ig, Status.WARNING,
                          Status.ERROR, "sample ID",
                          "Only MIENS-compliant characters are allowed.");
        markLeadingTrailingWhitespaceCells_(columnRange, state);
        break;

      case "BarcodeSequence":
        markDuplicates_(columnRange, state, "Duplicate barcode sequence");
        markUnequalLengths_(columnRange, state, "Barcode");

        // Check against IUPAC standard DNA characters (case-insensitive).
        markInvalidCells_(columnRange, state, /[acgt]+/ig, Status.ERROR,
                          Status.ERROR, "barcode sequence",
                          "Only IUPAC standard DNA characters are allowed.");
        markLeadingTrailingWhitespaceCells_(columnRange, state);
        break;

      case "LinkerPrimerSequence":
      case "ReversePrimer":
        // Check against IUPAC DNA characters (case-insensitive). Allow commas
        // since comma-separated primers are valid.
        markInvalidCells_(columnRange, state, /[acbdghkmnsrtwvy,]+/ig, Status.ERROR,
                          Status.ERROR, "primer sequence",
                          "Only IUPAC DNA characters are allowed.");
        markLeadingTrailingWhitespaceCells_(columnRange, state);
        break;

      default:
        // generic metadata column
        markInvalidCells_(columnRange, state, /[a-z0-9_.\-+% ;:,\/]+/ig, Status.WARNING,
                          Status.WARNING, "metadata");
        markLeadingTrailingWhitespaceCells_(columnRange, state);
    }
  }
};

function getMetadataStartRow_(sheet) {
  var startRow = 2;
  for (var row = startRow; row <= sheet.getLastRow(); row++) {
    // TODO: this should be optimized to pull the entire
    // first column in order to reduce API calls
    var value = getFormattedValues_(sheet.getRange(row, 1))[0][0];

    if (startsWith_(value, "#")) {
      startRow++;
    }
    else {
      break;
    }
  }

  return startRow;
};
