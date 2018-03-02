/**
 * TODO:
 * - The code is pretty messy/complicated and could use some refactoring to decompose
 *   functions, reduce duplication, etc. Consider this an MVP for now.
 *
 * - This validator doesn't use the "format spec" API used by the other validators.
 *   Consider refactoring the code to reuse some of the existing functionality. For
 *   now, this format implements everything itself except for reporting and rendering
 *   the results.
 *
 * - There are lots of functions in this file (and the project as a whole), and everything
 *   is in the global namespace. The functions in this file include the word "Q2" in their
 *   names for now to avoid clashes and to make it clear that the functions are specific to
 *   the QIIME 2 validator. Consider redesigning to group a format's functions into a single
 *   namespace (perhaps some OOP would help here).
 *
 * - The code needs more comments/documentation.
 *
 * - The code could use some linting and style-checks for consistency.
 *
 * - Consider adding warnings to cells with leading/trailing whitespace.
 */

/**
 * TODO: Rhino engine doesn't support data structures like Set and Map.
 * Consider using a GAS shim library such as this one (it'd be better to
 * inline the code rather than importing as a GAS library because libraries
 * can slow down add-on loading time).
 *
 * http://ramblings.mcpher.com/Home/excelquirks/gassnips/es6shim
 *
 * For now, we'll fake Set objects. If a shim is added, there are likely other
 * parts of the codebase that could take advantage of it too (some places are
 * commented, some are not).
 */
var Q2IDHEADERS_ = {
  caseInsensitive: {
    "id": null,
    "sampleid": null,
    "sample id": null,
    "sample-id": null,
    "featureid": null,
    "feature id": null,
    "feature-id": null
  },

  exactMatch: {
    "#SampleID": null,
    "#Sample ID": null,
    "#OTUID": null,
    "#OTU ID": null,
    "sample_name": null
  }
};

var Q2COLUMNTYPES_ = {
  "categorical": null,
  "numeric": null
};

// Ported from QIIME 2's Metadata reader regex, tested at https://regexr.com/
// Credit: https://stackoverflow.com/a/4703508/3776794
var NUMERICREGEX_ = /^[-+]?(?:(?:\d*\.\d+)|(?:\d+\.?))(?:[Ee][+-]?\d+)?$/;

// Recommended ID regex based on "Recommendations for Identifiers" in QIIME 2 Metadata file format docs.
// Tested at https://regexr.com/
var RECOMMENDEDIDREGEX_ = /^[a-zA-Z0-9.\-]{1,36}$/;

function validateQiime2_() {
  var startTime = Date.now();

  var sheet = SpreadsheetApp.getActiveSheet();
  var sheetData = sheet.getDataRange().getDisplayValues();
  trimLeadingTrailingWhitespace_(sheetData);
  var cellCount = sheetData.length * sheetData[0].length;

  var validationResults = getQiime2ValidationResults_(sheetData);

  var report = {
    format: "QIIME 2 metadata file",
    validationResults: validationResults,
    cellCount: cellCount,
    runtime: Date.now() - startTime
  };

  renderSheetView_(sheet, report);
  renderSidebarView_(sheet, report);
  return report;
};

function trimLeadingTrailingWhitespace_(sheetData) {
  for (var i = 0; i < sheetData.length; i++) {
    var row = sheetData[i];
    for (var j = 0; j < row.length; j++) {
      row[j] = row[j].trim();
    }
  }
};

function trimTrailingEmptyCells_(row) {
  var dataExtent = null;
  for (var i = 0; i < row.length; i++) {
    if (row[i] !== "") {
      dataExtent = i;
    }
  }
  return row.slice(0, dataExtent + 1);
};

function getQiime2ValidationResults_(sheetData) {
  var validationResults = {};

  var header = null;
  var headerIdx = null;
  for (var i = 0; i < sheetData.length; i++) {
    var row = sheetData[i];

    if (isQ2Comment_(row)) {
      continue;
    }
    else if (isQ2Empty_(row)) {
      continue;
    }
    else if (isQ2Directive_(row)) {
      var position = [i, 0];
      addCellError_(validationResults, position, ["Found directive before header. Directives may only appear immediately after the header."]);
    }
    else {
      // Trim trailing empty cells from the header so that directives and data rows
      // can be length-checked against the header (values should be within the bounds
      // of the header).
      header = trimTrailingEmptyCells_(row);
      headerIdx = i;
      break;
    }
  }

  if (header === null) {
    var position = [0, 0];
    addCellError_(validationResults, position, ["Failed to locate header. The sheet may be empty, or consists only of comments or empty rows."]);
    // TODO avoid early return
    return validationResults;
  }

  validateQ2Header_(validationResults, header, headerIdx);

  var typesDirective = null;
  var typesDirectiveIdx = null;
  var dataIdx = null;
  // Iterate over rows directly after the header.
  for (var i = headerIdx + 1; i < sheetData.length; i++) {
    var row = sheetData[i];

    if (!isQ2Directive_(row)) {
      dataIdx = i;
      break;
    }

    if (isQ2TypesDirective_(row)) {
      if (typesDirective === null) {
        typesDirective = trimTrailingEmptyCells_(row);
        typesDirectiveIdx = i;
      }
      else {
        var position = [i, 0];
        addCellError_(validationResults, position, ["Found duplicate #q2:types directive. Each directive may only be specified a single time."]);
      }
    }
    else {
      var position = [i, 0];
      addCellError_(validationResults, position, ["Unrecognized directive. Only the #q2:types directive is supported at this time."]);
    }
  }

  if (typesDirective !== null) {
    validateQ2TypesDirective_(validationResults, typesDirective, typesDirectiveIdx, header);
  }

  if (dataIdx === null) {
    // TODO this check happens here and within `validateQ2Data_`. Refactor to have the check
    // only happen in `validateQ2Data_` (which might avoid the early return below too).
    var position = [headerIdx, 0];
    addCellError_(validationResults, position, ["At least one ID must be present after the header and any optional directives."]);
    // TODO avoid early return
    return validationResults;
  }

  validateQ2Data_(validationResults, sheetData, dataIdx, header, headerIdx, typesDirective);

  return validationResults;
};

function validateQ2Header_(validationResults, header, headerIdx) {
  if (!isQ2Header_(header)) {
    var position = [headerIdx, 0];
    var message = ["Found unrecognized ID column name in the header. The first column name in the header must be one of these values:"];
    // TODO this is duplicated below for column name clashes, refactor.
    var caseInsensitive = Object.keys(Q2IDHEADERS_.caseInsensitive).sort();
    var exactMatch = Object.keys(Q2IDHEADERS_.exactMatch).sort();
    message.push(Utilities.formatString("Case-insensitive: %s", caseInsensitive.join(", ")));
    message.push(Utilities.formatString("Case-sensitive: %s", exactMatch.join(", ")));
    addCellError_(validationResults, position, message);
  }

  // TODO `seen` could be a Set object in the future.
  var seen = {};
  for (var i = 0; i < header.length; i++) {
    var value = header[i];
    var position = [headerIdx, i]

    if (value === "") {
      addCellError_(validationResults, position, ["Each column in the header must have a name."]);
    }

    // TODO this doesn't mark the first occurrence of a column that's duplicated.
    // It'd be helpful to mark all occurrences and note which cells are duplicates
    // in the error message.
    if (seen.hasOwnProperty(value)) {
      addCellError_(validationResults, position, ["Duplicate column name. This column name occurs earlier in the header."]);
    }
    else {
      seen[value] = true;
    }

    // Skip validation of the first cell because we're expecting that value to be an
    // ID column header.
    if (i != 0 && isQ2Header_([value])) {
      var message = ["Column name conflicts with a name reserved for the ID column. Reserved ID column names:"];
      // TODO this is duplicated above at the start of this function, refactor.
      var caseInsensitive = Object.keys(Q2IDHEADERS_.caseInsensitive).sort();
      var exactMatch = Object.keys(Q2IDHEADERS_.exactMatch).sort();
      message.push(Utilities.formatString("Case-insensitive: %s", caseInsensitive.join(", ")));
      message.push(Utilities.formatString("Case-sensitive: %s", exactMatch.join(", ")));
      addCellError_(validationResults, position, message);
    }
  }
};

function validateQ2TypesDirective_(validationResults, typesDirective, typesDirectiveIdx, header) {
  // Skip the first cell because we know it is "#q2:types" at this point.
  for (var i = 1; i < typesDirective.length; i++) {
    var value = typesDirective[i];
    var position = [typesDirectiveIdx, i]

    if (value !== "" && !Q2COLUMNTYPES_.hasOwnProperty(value.toLowerCase())) {
      var columnTypes = Object.keys(Q2COLUMNTYPES_).sort();
      var message = [Utilities.formatString("Unrecognized column type specified in #q2:types directive. Supported column types (case-insensitive): %s", columnTypes.join(", "))];
      addCellError_(validationResults, position, message);
    }

    // TODO a similar check happens below in `validateQ2Data_`. Refactor code to reduce duplication.
    if (i >= header.length) {
      addCellError_(validationResults, position, ["Cell is past the boundaries declared by the header. Please check that this cell's column has a name in the header."]);
    }
  }
};

function validateQ2Data_(validationResults, sheetData, dataIdx, header, headerIdx, typesDirective) {
  // Convert all values in the types directive to lowercase in order to speed up lookups in
  // the inner loop below (otherwise each directive cell would need to be converted to lowercase
  // each time is it accessed).
  if (typesDirective !== null) {
    typesDirective = typesDirective.map(function(cell) {
      return cell.toLowerCase();
    });
  }

  // TODO `ids` could be a Set object in the future.
  var ids = {};
  for (var i = dataIdx; i < sheetData.length; i++) {
    var row = sheetData[i];

    if (isQ2Comment_(row)) {
      continue;
    }
    else if (isQ2Empty_(row)) {
      continue;
    }
    else if (isQ2Directive_(row)) {
      var position = [i, 0];
      addCellError_(validationResults, position, ["Found directive outside of the directives section. Directives may only appear immediately after the header."]);
      // Don't try to validate a misplaced comment directive row.
      continue;
    }

    // We now have a data row to validate. Trim cells off the end that should be ignored.
    row = trimTrailingEmptyCells_(row);

    if (isQ2Header_(row)) {
      var position = [i, 0];
      var message = ["Metadata ID conflicts with a name reserved for the ID column header. Reserved ID column names:"];
      // TODO this is duplicated above at the start of this function, refactor.
      var caseInsensitive = Object.keys(Q2IDHEADERS_.caseInsensitive).sort();
      var exactMatch = Object.keys(Q2IDHEADERS_.exactMatch).sort();
      message.push(Utilities.formatString("Case-insensitive: %s", caseInsensitive.join(", ")));
      message.push(Utilities.formatString("Case-sensitive: %s", exactMatch.join(", ")));
      addCellError_(validationResults, position, message);
    }

    var id = row[0];
    if (id === "") {
      var position = [i, 0];
      addCellError_(validationResults, position, ["Each ID must have a name."]);
    }

    // TODO this doesn't mark the first occurrence of an ID that's duplicated.
    // It'd be helpful to mark all occurrences and note which cells are duplicates
    // in the error message.
    if (ids.hasOwnProperty(id)) {
      var position = [i, 0];
      addCellError_(validationResults, position, ["Duplicate ID. The ID occurs earlier in this column."]);
    }
    else {
      ids[id] = true;
    }

    // Warn if ID doesn't meet the "recommended identifiers" requirements in the QIIME 2 Metadata file format docs.
    if (!RECOMMENDEDIDREGEX_.test(id)) {
      var position = [i, 0];
      var message = ["ID doesn't meet the recommendations for choosing identifiers described in the QIIME 2 metadata documentation. IDs are recommended to have the following attributes:"];
      message.push("- IDs should be 36 characters long or less.");
      message.push("- IDs should contain only ASCII alphanumeric characters (i.e. in the range of [a-z], [A-Z], or [0-9]), the period (.) character, or the dash (-) character.");
      addCellWarning_(validationResults, position, message);
    }

    // Now that the ID is validated, check that the other values in the row can be converted to numbers
    // if they are declared to be numeric. Also check that values don't overflow past the header's length.
    for (var j = 1; j < row.length; j++) {
      var value = row[j];
      var position = [i, j];

      if (typesDirective !== null && typesDirective[j] === "numeric") {
        if (value !== "" && !NUMERICREGEX_.test(value)) {
          addCellError_(validationResults, position, ["Cannot interpret value as a number. #q2:types directive declares this column numeric."]);
        }
      }

      // TODO a similar check happens above in `validateQ2TypesDirective_`. Refactor code to reduce duplication.
      if (j >= header.length) {
        addCellError_(validationResults, position, ["Cell is past the boundaries declared by the header. Please check that this cell's column has a name in the header."]);
      }
    }
  }

  if (Object.keys(ids).length < 1) {
    // TODO this check happens here and earlier within `getQiime2ValidationResults_`.
    // Refactor to have the check only happen here.
    var position = [headerIdx, 0];
    addCellError_(validationResults, position, ["At least one ID must be present after the header and any optional directives."]);
  }
};

function isQ2Header_(row) {
  return (
    Q2IDHEADERS_.exactMatch.hasOwnProperty(row[0]) ||
    Q2IDHEADERS_.caseInsensitive.hasOwnProperty(row[0].toLowerCase())
  );
};

function isQ2Directive_(row) {
  return startsWith_(row[0], "#q2:");
};

function isQ2TypesDirective_(row) {
  return row[0] === "#q2:types";
};

function isQ2Comment_(row) {
  return (
    startsWith_(row[0], "#") &&
    !isQ2Directive_(row) &&
    !isQ2Header_(row)
  );
};

function isQ2Empty_(row) {
  return row.every(function(cell) {
    return cell === "";
  });
};

function addCellError_(validationResults, position, message) {
  var a1 = getA1Notation_(position);

  if (validationResults.hasOwnProperty(a1)) {
    if (validationResults[a1].hasOwnProperty("errors")) {
      validationResults[a1].errors.push(message);
    }
    else {
      validationResults[a1].errors = [message];
    }
  }
  else {
    validationResults[a1] = {
      position: position,
      errors: [message],
    };
  }
};

function addCellWarning_(validationResults, position, message) {
  var a1 = getA1Notation_(position);

  if (validationResults.hasOwnProperty(a1)) {
    if (validationResults[a1].hasOwnProperty("warnings")) {
      validationResults[a1].warnings.push(message);
    }
    else {
      validationResults[a1].warnings = [message];
    }
  }
  else {
    validationResults[a1] = {
      position: position,
      warnings: [message],
    };
  }
};
