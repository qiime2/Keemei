function validateHeader_(sheetData, requiredHeaders) {
  var valueToPositions = getValueToPositionsMapping_(sheetData, 0, 0, 1, sheetData[0].length);

  var validationResults = [];
  validationResults.push(findMissingValues_(valueToPositions, requiredHeaders, "columns", [0, 0]));
  validationResults.push(findDuplicates_(valueToPositions, "Duplicate column"));

  // #SampleID is an invalid column header name, so we'll only check header names
  // if they aren't required headers. Assume the required header names are valid.
  //
  // TODO: error message isn't very clear because it displays whatever couldn't match
  // the regex, which isn't always just a list of invalid characters. Header has more
  // complicated rules, so this part of the validation needs to be improved to better
  // describe the issue to users.
  validationResults.push(findInvalidCells_(valueToPositions, /^[a-z][a-z0-9_]*$/ig, "warnings",
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
