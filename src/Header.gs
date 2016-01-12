function validateHeader_(sheetData, requiredHeaders) {
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

// TODO: refactor this validator to be general (it is currently specific to headers)
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
