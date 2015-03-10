function markDuplicates_(range, state, note) {
  var duplicates = findDuplicates_(range);

  for (var i = 0; i < duplicates.length; i++) {
    var duplicate = duplicates[i];
    updateState_(state, duplicate, Status.ERROR, note);
  }
};

function findDuplicates_(range) {
  var valueToPositions = getValueToPositionsMapping_(range);

  var duplicates = [];
  for (var key in valueToPositions) {
    if (valueToPositions.hasOwnProperty(key)) {
      var positions = valueToPositions[key];

      if (positions.length > 1) {
        duplicates = duplicates.concat(positions);
      }
    }
  }

  return duplicates;
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
  var values = range.getValues();

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
  var values = range.getValues();

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
