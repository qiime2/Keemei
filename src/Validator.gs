function markDuplicates_(range, state, note) {
  var valueToPositions = getValueToPositionsMapping_(range);

  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value)) {
      var positions = valueToPositions[value];

      if (positions.length > 1) {
        var duplicates = [];
        for (var i = 0; i < positions.length; i++) {
          var position = positions[i];
          duplicates.push(getA1Notation_(position));
        }

        var formattedDuplicates = duplicates.join(", ");

        for (var i = 0; i < positions.length; i++) {
          var position = positions[i];
          var message = Utilities.formatString("%s. Duplicates in %s", note, formattedDuplicates);
          updateState_(state, position, Status.ERROR, message);
        }
      }
    }
  }
};

function markUnequalLengths_(range, state, label) {
  var lengthMode = lengthMode_(range);
  var valueToPositions = getValueToPositionsMapping_(range);

  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value)) {
      if (value.length != lengthMode) {
        var positions = valueToPositions[value];

        for (var i = 0; i < positions.length; i++) {
          var message = Utilities.formatString("%s length does not match the others", label);
          updateState_(state, positions[i], Status.WARNING, message);
        }
      }
    }
  }
};

// modified from http://stackoverflow.com/a/1053865/3776794
// no guarantee of which mode will be returned in the event of a tie
function lengthMode_(range) {
  var values = getFormattedValues_(range);

  if (values.length < 1 || values[0].length < 1) {
    return null;
  }

  var modeMap = {};
  var mode = values[0][0].length;
  var count = 1;
  for (var i = 0; i < values.length; i++) {
    for (var j = 0; j < values[i].length; j++) {
      var valueLength = values[i][j].length;

      if (modeMap.hasOwnProperty(valueLength)) {
        modeMap[valueLength]++;
      }
      else {
        modeMap[valueLength] = 1;
      }

      if (modeMap[valueLength] > count) {
        mode = valueLength;
        count = modeMap[valueLength];
      }
    }
  }

  return mode;
};

function markMissingValues_(range, state, requiredValues, label) {
  var valueToPositions = getValueToPositionsMapping_(range);

  var missingValues = [];
  for (var requiredValue in requiredValues) {
    if (requiredValues.hasOwnProperty(requiredValue)) {
      if (!valueToPositions.hasOwnProperty(requiredValue)) {
        missingValues.push(requiredValue);
      }
    }
  }

  if (missingValues.length > 0) {
    var message = Utilities.formatString("Missing required %s: %s", label, missingValues.join(", "));
    updateState_(state, {row: range.getRow(), column: range.getColumn()}, Status.ERROR, message);
  }
};

function markInvalidCells_(range, state, regex, invalidCharactersStatus,
                           emptyCellStatus, label, messageSuffix, ignoredValues) {
  ignoredValues = (typeof ignoredValues === "undefined") ? {} : ignoredValues;

  var invalids = findInvalidCells_(range, regex, ignoredValues);

  for (var i = 0; i < invalids.length; i++) {
    var invalid = invalids[i];

    var msg = "Empty cell";
    var status = emptyCellStatus;
    if (invalid.invalidChars.length > 0) {
      msg = Utilities.formatString("Invalid character(s) in %s: %s", label, invalid.invalidChars);
      if (messageSuffix) {
        msg += Utilities.formatString("\n\n%s", messageSuffix);
      }
      status = invalidCharactersStatus;
    }

    updateState_(state, invalid, status, msg);
  }
};

function findInvalidCells_(range, regex, ignoredValues) {
  var values = getFormattedValues_(range);

  var invalidPositions = [];
  for (var i = 0; i < values.length; i++) {
    for (var j = 0; j < values[i].length; j++) {
      var value = values[i][j];

      if (!ignoredValues.hasOwnProperty(value)) {
        var status = validateCell_(value, regex);

        if (!status.valid) {
          var position = {
            row: range.getRow() + i,
            column: range.getColumn() + j,
            invalidChars: status.invalidChars
          };
          invalidPositions.push(position);
        }
      }
    }
  }

  return invalidPositions;
};

function getValueToPositionsMapping_(range) {
  var values = getFormattedValues_(range);

  var valueToPositions = {};
  for (var i = 0; i < values.length; i++) {
    for (var j = 0; j < values[i].length; j++) {
      var value = values[i][j];
      var position = {
        row: range.getRow() + i,
        column: range.getColumn() + j
      };

      if (valueToPositions.hasOwnProperty(value)) {
        valueToPositions[value].push(position);
      }
      else {
        valueToPositions[value] = [position];
      }
    }
  }

  return valueToPositions;
};

function validateCell_(value, regex) {
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
