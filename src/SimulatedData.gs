function createSimulatedData() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(
    "Please confirm",
    "This script will create up to 12 sheets of simulated data in the current spreadsheet. " +
    "It is recommended to run the script in a new/disposable spreadsheet. The script " +
    "will run for several minutes and may time out. If it does, rerun the script and it will " +
    "continue from where it left off. Are you sure you want to continue?",
    ui.ButtonSet.YES_NO);

  if (result == ui.Button.YES) {
    simulateData_(100, 24, [0.0, 0.01, 0.1, 0.5]);
    simulateData_(1000, 24, [0.0, 0.01, 0.1, 0.5]);
    simulateData_(10000, 24, [0.0, 0.01, 0.1, 0.5]);
  }
};

function simulateData_(numRows, numColumns, errorProportions) {
  var spreadsheet = SpreadsheetApp.getActive();
  var validData = simulateValidData_(numRows, numColumns);

  for (var i = 0; i < errorProportions.length; i++) {
    var errorProportion = errorProportions[i];
    var sheetName = Utilities.formatString("%dx%d, %f\% errors", numRows, numColumns, errorProportion * 100);

    var sheet = spreadsheet.getSheetByName(sheetName);
    if (sheet === null) {
      // It's faster to do a deep copy of `validData` then re-generate
      // `validData` in each iteration.
      var data = copyData_(validData);

      var numInvalidCells = (numRows * numColumns) * errorProportion;
      var randomIndices = getRandomIndices_(numRows, numColumns, numInvalidCells);
      for (var j = 0; j < randomIndices.length; j++) {
        var randomIndex = randomIndices[j];
        var rowIdx = randomIndex[0];
        var columnIdx = randomIndex[1];
        data[rowIdx][columnIdx] = randomErrorTransform_(data[rowIdx][columnIdx]);
      }

      var sheet = spreadsheet.insertSheet(sheetName);
      var range = sheet.getRange(1, 1, numRows, numColumns);
      range.setValues(data);
      SpreadsheetApp.flush();
    }
  }
};

var BARCODES = function() {
  var chars = ["A", "C", "G", "T"];
  var barcodeLength = 8;

  var choices = []
  for (var i = 0; i < barcodeLength; i++) {
    choices.push(chars);
  }

  // This is recursive -- consider faster/lazy implementation
  // if runtime/memory becomes an issue.
  return cartesian_(choices).map(
    function(currentValue, index, array) {
      return currentValue.join("");
    }
  );
}();

// modified from http://stackoverflow.com/a/15310051/3776794
function cartesian_(arg) {
    var r = [], max = arg.length-1;
    function helper(arr, i) {
        for (var j=0, l=arg[i].length; j<l; j++) {
            var a = arr.slice(0); // clone arr
            a.push(arg[i][j]);
            if (i==max)
                r.push(a);
            else
                helper(a, i+1);
        }
    }
    helper([], 0);
    return r;
};

function simulateValidData_(numRows, numColumns) {
  if ((numRows - 1) > BARCODES.length) {
    throw Utilities.formatString("Not enough unique barcodes of length %d for %d rows", BARCODES[0].length, numRows - 1);
  }

  var grid = [];
  var header = ["#SampleID", "BarcodeSequence", "LinkerPrimerSequence"];
  var numOptionalColumns = numColumns - 4;
  for (var i = 1; i <= numOptionalColumns; i++) {
    header.push(Utilities.formatString("Column%d", i));
  }
  header.push("Description");
  grid.push(header);

  for (var i = 0; i < numRows - 1; i++) {
    var row = [];
    row.push(Utilities.formatString("Sample%d", i + 1));
    row.push(BARCODES[i]);
    row.push("GTGCCAGCMGCCGCGGTAA");

    // Columns with no variation in value.
    for (var j = 1; j <= numOptionalColumns / 2; j++) {
      row.push(Utilities.formatString("Column%d data", j));
    }

    // Columns with only unique values. Not using strictly numeric data
    // because Google Sheets will always coerce to numeric when added to sheet,
    // and leading/trailing whitespace errors won't be flagged because
    // leading/trailing whitespace is stripped during coercion. For the
    // purposes of this benchmark it doesn't matter whether we use strings or
    // numbers because Keemei *always* validates the display values, which are
    // strings.
    for (var j = (numOptionalColumns / 2) + 1; j <= numOptionalColumns; j++) {
      row.push(Utilities.formatString("Data%d", i + 1));
    }

    // Use sample ID in Description column.
    row.push(row[0]);
    grid.push(row);
  }
  return grid;
};

// Deep copy because `data` is a 2D array of strings.
function copyData_(data) {
  var copy = [];
  for (var i = 0; i < data.length; i++) {
    copy.push(data[i].slice());
  }
  return copy;
};

// Generate random indices without replacement. Indices
// will not index into the header.
function getRandomIndices_(numRows, numColumns, count) {
  var seen = {};
  for (var i = 0; i < count; i++) {
    while (true) {
      // modified from http://stackoverflow.com/a/5915122/3776794
      var rowIdx = Math.floor(Math.random() * numRows);
      // Skip header.
      if (rowIdx === 0) {
        continue;
      }
      var columnIdx = Math.floor(Math.random() * numColumns);
      var key = Utilities.formatString("%d,%d", rowIdx, columnIdx);
      if (!seen.hasOwnProperty(key)) {
        seen[key] = [rowIdx, columnIdx];
        break;
      }
    }
  }

  var indices = [];
  for (var key in seen) {
    if (seen.hasOwnProperty(key)) {
      indices.push(seen[key]);
    }
  }

  assert_(indices.length === count)
  return indices;
};

// modified from http://stackoverflow.com/a/15313435/3776794
function assert_(condition) {
    if (!condition) {
        throw "Assertion failed";
    }
};

var ERROR_TRANSFORMS = [
  // empty cell
  function(value) {return "";},

  // leading/trailing whitespace
  function(value) {return value + "\t ";},

  /*
   * Substitute first character with invalid character.
   * $ is invalid across all QIIME mapping file columns.
   * We replace a character instead of appending to keep
   * barcodes the same length, otherwise additional cells
   * could be marked invalid in rare cases. Replacing a
   * character instead of appending has the chance to
   * introduce duplicate barcodes/sample IDs but this won't
   * inflate the number of invalid cells since the duplicate
   * cells are intended to be marked invalid by this transform.
   */
  function(value) {return "$" + value.substring(1);}
];

function randomErrorTransform_(value) {
  var transform = ERROR_TRANSFORMS[Math.floor(Math.random() * ERROR_TRANSFORMS.length)];
  return transform(value);
};
