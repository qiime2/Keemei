function validateQiime_(sheetData) {
  return {
    format: "QIIME mapping file",
    validationResults: mergeValidationResults_([
      validateHeader_(sheetData),
      validateColumns_(sheetData)
    ])
  };
}

function validateHeader_(sheetData) {
  var requiredHeaders = {
    "#SampleID": [0, "first"],
    "BarcodeSequence": [1, "second"],
    "LinkerPrimerSequence": [2, "third"],
    "Description": [sheetData[0].length - 1, "last"]
  };

  var valueToPositions = getValueToPositionsMapping_(sheetData, 0, 0, 1, sheetData[0].length);

  var validationResults = [];
  validationResults.push(findMissingValues_(valueToPositions, requiredHeaders, "columns", [0, 0]));
  validationResults.push(findDuplicates_(valueToPositions, "Duplicate column"));

  // #SampleID is an invalid column header name, so we'll only check header names
  // if they aren't required headers. Assume the required header names are valid.
  validationResults.push(findInvalidColumns_(valueToPositions, requiredHeaders));

  validationResults.push(findMisplacedColumns_(valueToPositions, requiredHeaders));
  validationResults.push(findLeadingTrailingWhitespace_(valueToPositions));

  return mergeValidationResults_(validationResults);
};

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
        validationResults.push(findInvalidCharacters_(valueToPositions, /[a-z0-9.]+/ig, "warnings",
                                                      "errors", "sample ID",
                                                      "Only MIENS-compliant characters are allowed."));
        validationResults.push(findLeadingTrailingWhitespace_(valueToPositions));
        break;

      case "BarcodeSequence":
        validationResults.push(findDuplicates_(valueToPositions, "Duplicate barcode sequence"));
        validationResults.push(findUnequalLengths_(valueToPositions, "Barcode"));

        // Check against IUPAC standard DNA characters (case-insensitive).
        validationResults.push(findInvalidCharacters_(valueToPositions, /[acgt]+/ig, "errors",
                                                      "errors", "barcode sequence",
                                                      "Only IUPAC standard DNA characters are allowed."));
        validationResults.push(findLeadingTrailingWhitespace_(valueToPositions));
        break;

      case "LinkerPrimerSequence":
      case "ReversePrimer":
        // Check against IUPAC DNA characters (case-insensitive). Allow commas
        // since comma-separated primers are valid.
        validationResults.push(findInvalidCharacters_(valueToPositions, /[acbdghkmnsrtwvy,]+/ig, "errors",
                                                      "errors", "primer sequence",
                                                      "Only IUPAC DNA characters are allowed."));
        validationResults.push(findLeadingTrailingWhitespace_(valueToPositions));
        break;

      default:
        // generic metadata column
        validationResults.push(findInvalidCharacters_(valueToPositions, /[a-z0-9_.\-+% ;:,\/]+/ig, "warnings",
                                                      "warnings", "metadata"));
        validationResults.push(findLeadingTrailingWhitespace_(valueToPositions));
    }
  }

  return mergeValidationResults_(validationResults);
};

function findInvalidColumns_(valueToPositions, ignoredValues) {
  var invalidCells = {};
  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value) && !ignoredValues.hasOwnProperty(value)) {
      var status = validateValue_(value, /^[a-z][a-z0-9_]*$/ig);

      if (!status.valid) {
        var message = ["Empty cell"];
        var errorType = "errors";
        if (status.invalidChars.length > 0) {
          message = [
            Utilities.formatString("Invalid column header name. Only alphanumeric and underscore characters are allowed. The first character must be a letter.")
          ];
          errorType = "warnings";
        }

        var positions = valueToPositions[value];
        for (var i = 0; i < positions.length; i++) {
          var invalidCell = {
            "position": positions[i]
          };
          invalidCell[errorType] = [message];
          invalidCells[getA1Notation_(positions[i])] = invalidCell;
        }
      }
    }
  }

  return invalidCells;
};

function findMisplacedColumns_(valueToPositions, requiredHeaders) {
  var invalidCells = {};
  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value)) {
      var positions = valueToPositions[value];

      if (requiredHeaders.hasOwnProperty(value)) {
        var requiredLocation = requiredHeaders[value];
        var message = ["Misplaced column; must be the " + requiredLocation[1] + " column"];

        for (var i = 0; i < positions.length; i++) {
          var position = positions[i];

          if (position[1] != requiredLocation[0]) {
            invalidCells[getA1Notation_(position)] = {
              "position": position,
              "errors": [message]
            };
          }
        }
      }
    }
  }

  return invalidCells;
};

function getStartRowIdx_(sheetData) {
  for (var i = 1; i < sheetData.length; i++) {
    if (!startsWith_(sheetData[i][0], "#")) {
      break;
    }
  }
  return i;
};
