function findDuplicates_(valueToPositions, note, ignoreFunction) {
  ignoreFunction = (typeof ignoreFunction === 'undefined') ? function(value) {return false;} : ignoreFunction;

  var invalidCells = {};
  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value) &&
        (value.length > 0) &&
        !ignoreFunction(value)) {
      var positions = valueToPositions[value];

      if (positions.length > 1) {
        var duplicates = [];
        for (var i = 0; i < positions.length; i++) {
          duplicates.push(getA1Notation_(positions[i]));
        }

        var maxDuplicateLocations = 10;
        if (duplicates.length <= maxDuplicateLocations) {
          var duplicateLocationsMessage = duplicates.join(", ");
        }
        else {
          var duplicateLocationsMessage = Utilities.formatString("%s, ... (%d more)",
                                                                 duplicates.slice(0, maxDuplicateLocations).join(", "),
                                                                 duplicates.length - maxDuplicateLocations);
        }
        var message = [Utilities.formatString("%s. Duplicates in %s", note, duplicateLocationsMessage)];

        for (var i = 0; i < positions.length; i++) {
          invalidCells[duplicates[i]] = {
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
    var trimmedValue = value.trim();
    if (valueToPositions.hasOwnProperty(value) &&
        (trimmedValue.length > 0) &&
        (trimmedValue.length != lengthMode)) {
      var positions = valueToPositions[value];

      for (var i = 0; i < positions.length; i++) {
        invalidCells[getA1Notation_(positions[i])] = {
          "position": positions[i],
          "warnings": [message]
        };
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
    var trimmedValue = value.trim();
    if (valueToPositions.hasOwnProperty(value) &&
        (trimmedValue.length > 0)) {
      if (!modeMap.hasOwnProperty(trimmedValue.length)) {
        modeMap[trimmedValue.length] = 0;
      }
      modeMap[trimmedValue.length] += valueToPositions[value].length;

      if (modeMap[trimmedValue.length] > count) {
        mode = trimmedValue.length;
        count = modeMap[trimmedValue.length];
      }
    }
  }

  return mode;
};

function findOutOfRange_(valueToPositions, min, max, label) {
  var invalidCells = {};
  var notANumberMessage = [Utilities.formatString("%s must be a number", label)];
  var outOfRangeMessage = [Utilities.formatString("%s must be between %d and %d, inclusive", label, min, max)];

  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value)) {
      var errors = [];
      if (!isNumeric_(value)) {
        errors.push(notANumberMessage);
      }
      else if (!between_(parseFloat(value), min, max)) {
        errors.push(outOfRangeMessage);
      }

      if (errors.length > 0) {
        var positions = valueToPositions[value];

        for (var i = 0; i < positions.length; i++) {
          invalidCells[getA1Notation_(positions[i])] = {
            "position": positions[i],
            "errors": errors
          };
        }
      }
    }
  }

  return invalidCells;
};

function findNegativeIntegers_(valueToPositions, label) {
  var invalidCells = {};
  var message = [Utilities.formatString("%s must be a nonnegative integer", label)];

  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value) &&
        (value.match(/^\d+$/g) === null)) {
      var positions = valueToPositions[value];

      for (var i = 0; i < positions.length; i++) {
        invalidCells[getA1Notation_(positions[i])] = {
          "position": positions[i],
          "errors": [message]
        };
      }
    }
  }

  return invalidCells;
};

function findMissingValues_(valueToPositions, requiredValues, errorType, label, position, messageSuffix) {
  var invalidCells = {};

  var missingValues = [];
  for (var i = 0; i < requiredValues.length; i++) {
    var requiredValue = requiredValues[i];
    if (!valueToPositions.hasOwnProperty(requiredValue)) {
      missingValues.push(requiredValue);
    }
  }

  if (missingValues.length > 0) {
    var message = [Utilities.formatString("Missing required %s: %s", label, missingValues.join(", "))];
    if (messageSuffix) {
      message.push(messageSuffix);
    }

    var invalidCell = {
      "position": position
    };
    invalidCell[errorType] = [message];
    invalidCells[getA1Notation_(position)] = invalidCell;
  }

  return invalidCells;
};

function findLeadingTrailingWhitespace_(valueToPositions) {
  var invalidCells = {};
  var message = ["Cell has leading and/or trailing whitespace characters"];

  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value)) {
      if (value != value.trim()) {
        var positions = valueToPositions[value];

        for (var i = 0; i < positions.length; i++) {
          invalidCells[getA1Notation_(positions[i])] = {
            "position": positions[i],
            "warnings": [message]
          };
        }
      }
    }
  }

  return invalidCells;
};

function findEmpty_(valueToPositions, errorType) {
  var invalidCells = {};
  var message = ["Empty cell"];

  if (valueToPositions.hasOwnProperty("")) {
    var positions = valueToPositions[""];

    for (var i = 0; i < positions.length; i++) {
      var invalidCell = {
        "position": positions[i]
      };
      invalidCell[errorType] = [message];
      invalidCells[getA1Notation_(positions[i])] = invalidCell;
    }
  }

  return invalidCells;
};

function findInvalidCharacters_(valueToPositions, regex, errorType, label, messageSuffix) {
  var invalidCells = {};
  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value)) {
      var invalidChars = value.replace(regex, "");

      if (invalidChars.length > 0) {
        var message = [Utilities.formatString("Invalid character(s) in %s: %s", label, invalidChars)];
        if (messageSuffix) {
          message.push(messageSuffix);
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

function findInvalidValues_(valueToPositions, validValues, label) {
  var invalidCells = {};
  var message = [Utilities.formatString("%s must be one of the following values: %s", label, Object.keys(validValues).join(", "))];

  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value) &&
        !validValues.hasOwnProperty(value)) {
      var positions = valueToPositions[value];
      for (var i = 0; i < positions.length; i++) {
        invalidCells[getA1Notation_(positions[i])] = {
          "position": positions[i],
          "errors": [message]
        };
      }
    }
  }

  return invalidCells;
};

function findInvalidDateTimes_(valueToPositions, format, formatDescription) {
  var invalidCells = {};
  var message = [Utilities.formatString("Must be a valid date/time in %s format", formatDescription)];

  for (var value in valueToPositions) {
    // moment(..., true) indicates strict parsing.
    if (valueToPositions.hasOwnProperty(value) &&
        (value.length > 0) &&
        !moment(value, format, true).isValid()) {
      var positions = valueToPositions[value];
      for (var i = 0; i < positions.length; i++) {
        invalidCells[getA1Notation_(positions[i])] = {
          "position": positions[i],
          "errors": [message]
        };
      }
    }
  }

  return invalidCells;
};
