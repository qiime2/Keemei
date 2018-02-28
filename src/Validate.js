function validate_(formatSpecFunction, sheet) {
  var startTime = Date.now();

  sheet = (typeof sheet === 'undefined') ? SpreadsheetApp.getActiveSheet() : sheet;
  var sheetData = sheet.getDataRange().getDisplayValues();
  var cellCount = sheetData.length * sheetData[0].length;

  var formatSpec = formatSpecFunction(sheetData);

  var report = {
    format: formatSpec.format,
    validationResults: mergeValidationResults_([
      validateHeader_(sheetData, formatSpec),
      validateColumns_(sheetData, formatSpec)
    ]),
    cellCount: cellCount,
    runtime: Date.now() - startTime
  };

  renderSheetView_(sheet, report);
  renderSidebarView_(sheet, report);
  return report;
};

function validateHeader_(sheetData, formatSpec) {
  var headerRowIdx = getHeaderRowIdx_(sheetData, formatSpec.ignoredRowIdxs);
  var valueToPositions = getValueToPositionsMapping_(sheetData, headerRowIdx, 0, 1, sheetData[0].length, formatSpec.ignoredRowIdxs);

  var validationResults = [];
  for (var i = 0; i < formatSpec.headerValidation.length; i++) {
    var validator = formatSpec.headerValidation[i].validator;
    var args = formatSpec.headerValidation[i].args;
    var validationResult = validator.apply(this, [valueToPositions].concat(args));
    validationResults.push(validationResult);
  }

  return mergeValidationResults_(validationResults);
};

function validateColumns_(sheetData, formatSpec) {
  var headerRowIdx = getHeaderRowIdx_(sheetData, formatSpec.ignoredRowIdxs);
  var startRowIdx = headerRowIdx + 1;
  var endRowIdx = sheetData.length - 1;
  var numRows = endRowIdx - startRowIdx + 1;

  if (startRowIdx > endRowIdx) {
    // no data, only header
    return {};
  }

  var headers = sheetData[headerRowIdx];
  var validationResults = [];
  for (var columnIdx = 0; columnIdx < headers.length; columnIdx++) {
    var valueToPositions = getValueToPositionsMapping_(sheetData, startRowIdx, columnIdx, numRows, 1, formatSpec.ignoredRowIdxs);

    var header = headers[columnIdx];
    var columnValidators = formatSpec.columnValidation["default"];
    if (formatSpec.columnValidation.columns.hasOwnProperty(header)) {
      columnValidators = formatSpec.columnValidation.columns[header];
    }

    for (var i = 0; i < columnValidators.length; i++) {
      var validator = columnValidators[i].validator;
      var args = columnValidators[i].args;
      var validationResult = validator.apply(this, [valueToPositions].concat(args));
      validationResults.push(validationResult);
    }
  }

  return mergeValidationResults_(validationResults);
};

function getHeaderRowIdx_(sheetData, ignoredRowIdxs) {
  for (var idx = 0; idx < sheetData.length; idx++) {
    if (ignoredRowIdxs[idx]) {
      continue;
    }
    return idx;
  }
  throw new Error("Failed to find header row. All rows in the sheet are being " +
                  "ignored according to the file format's validation rules.");
};

function getValueToPositionsMapping_(sheetData, rowIdx, columnIdx, numRows, numColumns, ignoredRowIdxs) {
  var valueToPositions = {};
  for (var i = 0; i < numRows; i++) {
    var currRowIdx = rowIdx + i;

    if (ignoredRowIdxs[currRowIdx]) {
      continue;
    }

    for (var j = 0; j < numColumns; j++) {
      var currColumnIdx = columnIdx + j;
      var position = [currRowIdx, currColumnIdx];

      var value = sheetData[currRowIdx][currColumnIdx];
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
