function isSheetEmpty_(sheet) {
  return sheet.getLastRow() == 0 && sheet.getLastColumn() == 0;
};

// modified from http://stackoverflow.com/a/4579228/3776794
function startsWith_(str, substr) {
  return str.lastIndexOf(substr, 0) === 0;
};

// modified from http://stackoverflow.com/a/8241071/3776794
function getA1Notation_(row, column) {
  var columnIdx = column - 1;

  var ordA = "A".charCodeAt(0);
  var ordZ = "Z".charCodeAt(0);
  var len = ordZ - ordA + 1;

  var a1 = "";
  while (columnIdx >= 0) {
    a1 = String.fromCharCode(columnIdx % len + ordA) + a1;
    columnIdx = Math.floor(columnIdx / len) - 1;
  }

  return Utilities.formatString("%s%d", a1, row);
};

function getValueToPositionsMapping_(range) {
  var values = range.getDisplayValues();

  var valueToPositions = {};
  for (var i = 0; i < values.length; i++) {
    for (var j = 0; j < values[i].length; j++) {
      var row = range.getRow() + i;
      var column = range.getColumn() + j;
      var a1 = getA1Notation_(row, column);
      var position = {
        row: row,
        column: column,
        a1: a1
      };

      var value = values[i][j];
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

function mergeValidationResults_(validationResults) {
  var dest = {};
  for (var i = 0; i < validationResults.length; i++) {
    var src = validationResults[i];

    for (var a1 in src) {
      if (src.hasOwnProperty(a1)) {
        if (dest.hasOwnProperty(a1)) {
          var srcCell = src[a1];
          var destCell = dest[a1];

          if (srcCell.hasOwnProperty("errors")) {
            if (!destCell.hasOwnProperty("errors")) {
              destCell["errors"] = [];
            }
            destCell["errors"] = destCell["errors"].concat(srcCell["errors"]);
          }

          if (srcCell.hasOwnProperty("warnings")) {
            if (!destCell.hasOwnProperty("warnings")) {
              destCell["warnings"] = [];
            }
            destCell["warnings"] = destCell["warnings"].concat(srcCell["warnings"]);
          }
        }
        else {
          dest[a1] = src[a1];
        }
      }
    }
  }

  return dest;
};
