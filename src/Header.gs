function getHeaderRange_(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn());
};

function validateHeader_(sheet, requiredHeaders) {
  var headerRange = getHeaderRange_(sheet);
  var valueToPositions = getValueToPositionsMapping_(headerRange);

  var validationResults = [];
  validationResults.push(findMissingValues_(valueToPositions, requiredHeaders, "columns", headerRange));
  validationResults.push(findDuplicates_(valueToPositions, "Duplicate column"));

  // #SampleID is an invalid column header name, so we'll only check header names
  // if they aren't required headers. Assume the required header names are valid.
  //
  // TODO: improve reporting of invalid header names, include description
  validationResults.push(findInvalidCells_(valueToPositions, /[a-z][a-z0-9_]*$/ig, "warnings",
                                           "errors", "column header name", null, requiredHeaders));

  validationResults.push(findMisplacedColumns_(valueToPositions, requiredHeaders));
  validationResults.push(findLeadingTrailingWhitespaceCells_(valueToPositions));

  return mergeValidationResults_(validationResults);
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

          if (position.column != requiredLocation[0]) {
            invalidCells[position.a1] = {
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
