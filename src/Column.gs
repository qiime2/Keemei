function markDuplicates_(sheet, column) {
  var duplicates = findDuplicates_(sheet, column);

  for (var i = 0; i < duplicates.length; i++) {
    var duplicate = duplicates[i];
    var cell = sheet.getRange(duplicate.row, duplicate.column);
    markCell_(cell, Status.ERROR, "Duplicate cell");
  }
};

function findDuplicates_(sheet, column) {
  var range = getColumnDataRange_(sheet, column);
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

function markInvalidCells_(sheet, column, regex, invalidCharactersStatus,
                           emptyCellStatus, label, messageSuffix) {
  var invalids = findInvalidCells_(sheet, column, regex);

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

    var cell = sheet.getRange(invalid.row, invalid.column);
    markCell_(cell, status, msg);
  }
};

function findInvalidCells_(sheet, column, regex) {
  var rows = getColumnDataRange_(sheet, column);
  var numRows = rows.getNumRows();
  var values = rows.getValues();
  
  var invalidPositions = [];
  for (var i = 0; i < numRows; i++) {
    var value = values[i][0];
    var status = validateCell_(value, regex);
    
    if (!status.valid) {
      var position = {
        row: rows.getRow() + i,
        column: column,
        invalidChars: status.invalidChars
      };
      invalidPositions.push(position);
    }
  }
   
  return invalidPositions;
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
