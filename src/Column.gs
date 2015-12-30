// TODO: the validations applied to each column are hardcoded for QIIME metadata
function validateColumns_(sheet) {
  var startRow = getMetadataStartRow_(sheet);
  var lastRow = sheet.getLastRow();

  if (startRow > lastRow) {
    // no metadata, only header and/or comments
    return {};
  }

  var headers = getHeaderRange_(sheet).getDisplayValues();
  var validationResults = [];
  for (var column = 1; column <= sheet.getLastColumn(); column++) {
    var columnRange = sheet.getRange(startRow, column, lastRow - startRow + 1);
    var valueToPositions = getValueToPositionsMapping_(columnRange);

    var header = headers[0][column - 1];
    switch(header) {
      case "#SampleID":
        validationResults.push(findDuplicates_(valueToPositions, "Duplicate sample ID"));
        validationResults.push(findInvalidCells_(valueToPositions, /[a-z0-9.]+/ig, "warnings",
                                                 "errors", "sample ID",
                                                 "Only MIENS-compliant characters are allowed."));
        validationResults.push(findLeadingTrailingWhitespaceCells_(valueToPositions));
        break;

      case "BarcodeSequence":
        validationResults.push(findDuplicates_(valueToPositions, "Duplicate barcode sequence"));
        validationResults.push(findUnequalLengths_(valueToPositions, "Barcode"));

        // Check against IUPAC standard DNA characters (case-insensitive).
        validationResults.push(findInvalidCells_(valueToPositions, /[acgt]+/ig, "errors",
                                                 "errors", "barcode sequence",
                                                 "Only IUPAC standard DNA characters are allowed."));
        validationResults.push(findLeadingTrailingWhitespaceCells_(valueToPositions));
        break;

      case "LinkerPrimerSequence":
      case "ReversePrimer":
        // Check against IUPAC DNA characters (case-insensitive). Allow commas
        // since comma-separated primers are valid.
        validationResults.push(findInvalidCells_(valueToPositions, /[acbdghkmnsrtwvy,]+/ig, "errors",
                                                 "errors", "primer sequence",
                                                 "Only IUPAC DNA characters are allowed."));
        validationResults.push(findLeadingTrailingWhitespaceCells_(valueToPositions));
        break;

      default:
        // generic metadata column
        validationResults.push(findInvalidCells_(valueToPositions, /[a-z0-9_.\-+% ;:,\/]+/ig, "warnings",
                                                 "warnings", "metadata"));
        validationResults.push(findLeadingTrailingWhitespaceCells_(valueToPositions));
    }
  }

  return mergeValidationResults_(validationResults);
};

function getMetadataStartRow_(sheet) {
  var startRow = 2;
  for (var row = startRow; row <= sheet.getLastRow(); row++) {
    // TODO: this should be optimized to pull the entire
    // first column in order to reduce API calls
    var value = sheet.getRange(row, 1).getDisplayValues()[0][0];

    if (startsWith_(value, "#")) {
      startRow++;
    }
    else {
      break;
    }
  }

  return startRow;
};
