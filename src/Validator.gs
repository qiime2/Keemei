function findDuplicates_(valueToPositions, note) {
  var invalidCells = {};
  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value)) {
      var positions = valueToPositions[value];

      if (positions.length > 1) {
        var duplicates = [];
        for (var i = 0; i < positions.length; i++) {
          duplicates.push(positions[i].a1);
        }
        var formattedDuplicates = duplicates.join(", ");
        var message = [Utilities.formatString("%s. Duplicates in %s", note, formattedDuplicates)];

        for (var i = 0; i < positions.length; i++) {
          invalidCells[positions[i].a1] = {
            "position": positions[i],
            "errors": [message]
          };
        }
      }
    }
  }

  return invalidCells;
};

function findUnequalLengths_(valueToPositions, label) {
  var invalidCells = {};
  var message = [Utilities.formatString("%s length does not match the others", label)];
  var lengthMode = lengthMode_(valueToPositions);
  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value)) {
      if (value.length != lengthMode) {
        var positions = valueToPositions[value];

        for (var i = 0; i < positions.length; i++) {
          invalidCells[positions[i].a1] = {
            "position": positions[i],
            "warnings": [message]
          };
        }
      }
    }
  }

  return invalidCells;
};

// modified from http://stackoverflow.com/a/1053865/3776794
// no guarantee of which mode will be returned in the event of a tie
function lengthMode_(valueToPositions) {
  var modeMap = {};
  var mode = null;
  var count = 0;
  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value)) {
      if (!modeMap.hasOwnProperty(value.length)) {
        modeMap[value.length] = 0;
      }
      modeMap[value.length] += valueToPositions[value].length;

      if (modeMap[value.length] > count) {
        mode = value.length;
        count = modeMap[value.length];
      }
    }
  }

  return mode;
};

function findMissingValues_(valueToPositions, requiredValues, label, range) {
  var invalidCells = {};

  var missingValues = [];
  for (var requiredValue in requiredValues) {
    if (requiredValues.hasOwnProperty(requiredValue)) {
      if (!valueToPositions.hasOwnProperty(requiredValue)) {
        missingValues.push(requiredValue);
      }
    }
  }

  if (missingValues.length > 0) {
    var message = [Utilities.formatString("Missing required %s: %s", label, missingValues.join(", "))];

    var row = range.getRow();
    var column = range.getColumn();
    var a1 = getA1Notation_(row, column);
    var position = {
      row: row,
      column: column,
      a1: a1
    };
    invalidCells[position.a1] = {
      "position": position,
      "errors": [message]
    };
  }

  return invalidCells;
};

function findLeadingTrailingWhitespaceCells_(valueToPositions) {
  var invalidCells = {};
  var message = ["Cell has leading and/or trailing whitespace characters"];

  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value)) {
      if (value != value.trim()) {
        var positions = valueToPositions[value];

        for (var i = 0; i < positions.length; i++) {
          invalidCells[positions[i].a1] = {
            "position": positions[i],
            "warnings": [message]
          };
        }
      }
    }
  }

  return invalidCells;
};

function findInvalidCells_(valueToPositions, regex, invalidCharactersErrorType,
                           emptyCellErrorType, label, messageSuffix, ignoredValues) {
  ignoredValues = (typeof ignoredValues === "undefined") ? {} : ignoredValues;

  var invalidCells = {};
  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value) && !ignoredValues.hasOwnProperty(value)) {
      var status = validateValue_(value, regex);

      if (!status.valid) {
        var message = ["Empty cell"];
        var errorType = emptyCellErrorType;
        if (status.invalidChars.length > 0) {
          message = [Utilities.formatString("Invalid character(s) in %s: %s", label, status.invalidChars)];
          if (messageSuffix) {
            message.push(messageSuffix);
          }
          errorType = invalidCharactersErrorType;
        }

        var positions = valueToPositions[value];
        for (var i = 0; i < positions.length; i++) {
          var invalidCell = {
            "position": positions[i]
          };
          invalidCell[errorType] = [message];
          invalidCells[positions[i].a1] = invalidCell;
        }
      }
    }
  }

  return invalidCells;
};

function validateValue_(value, regex) {
  var valid = false;
  var invalidChars = "";

  if (value.length > 0) {
    invalidChars = value.replace(regex, "");

    if (invalidChars.length == 0)
      valid = true;
  }

  return {
    valid: valid,
    invalidChars: invalidChars
  };
};
