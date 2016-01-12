// TODO: the validations applied to each column are hardcoded for QIIME metadata
function validateColumns_(sheetData) {
  var startRowIdx = getStartRowIdx_(sheetData);
  var endRowIdx = sheetData.length - 1;
  var numRows = endRowIdx - startRowIdx + 1;

  if (startRowIdx > endRowIdx) {
    // no metadata, only header and/or comments
    return {};
  }

  var headers = sheetData[0];
  var validationResults = [];
  for (var columnIdx = 0; columnIdx < headers.length; columnIdx++) {
    var valueToPositions = getValueToPositionsMapping_(sheetData, startRowIdx, columnIdx, numRows, 1);

    var header = headers[columnIdx];
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

function getStartRowIdx_(sheetData) {
  for (var i = 1; i < sheetData.length; i++) {
    if (!startsWith_(sheetData[i][0], "#")) {
      break;
    }
  }
  return i;
};
