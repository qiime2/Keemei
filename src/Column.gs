function markDuplicates(sheet, column) {
  var duplicates = findDuplicates(sheet, column);

  for (var i = 0; i < duplicates.length; i++) {
    var duplicate = duplicates[i];
    var cell = sheet.getRange(duplicate.row, duplicate.column);
    markCell(cell, Status.ERROR, "Duplicate cell");
  }
};

function findDuplicates(sheet, column) {
  var valuePositions = getValuePositions(sheet, column);
  
  var duplicates = [];
  for (var key in valuePositions) {
    if (valuePositions.hasOwnProperty(key)) {
      var positions = valuePositions[key];
      
      if (positions.length > 1) {
        duplicates = duplicates.concat(positions);
      }
    }
  }
  
  return duplicates;
};

function getValuePositions(sheet, column) {
  var rows = getColumnDataRange(sheet, column);
  var numRows = rows.getNumRows();
  var values = rows.getValues();
  
  var valuePositions = {};
  for (var i = 0; i < numRows; i++) {
    var value = values[i][0];
    var position = {
      row: rows.getRow() + i,
      column: column
    };
    
    if (valuePositions.hasOwnProperty(value)) {
      valuePositions[value].push(position);
    }
    else {
      valuePositions[value] = [position]; 
    }
  }
  
  return valuePositions;
};

function markInvalidCells(sheet, column, regex, invalidCharactersStatus,
                          emptyCellStatus, label, messageSuffix) {
  var invalids = findInvalidCells(sheet, column, regex);

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
    markCell(cell, status, msg);
  }
};

function findInvalidCells(sheet, column, regex) {
  var rows = getColumnDataRange(sheet, column);
  var numRows = rows.getNumRows();
  var values = rows.getValues();
  
  var invalidPositions = [];
  for (var i = 0; i < numRows; i++) {
    var value = values[i][0];
    var status = validateCell(value, regex);
    
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

function validateCell(value, regex) {
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
