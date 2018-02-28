function runDatasetSizeBenchmarks() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(
    "Please confirm",
    "This script expects simulated data to have been created in the current spreadsheet. " +
    "The script will create a sheet of benchmark results. The script will run for several minutes " +
    "and may time out. If it does, rerun the script and it will continue from where it left off. " +
    "Are you sure you want to continue?",
    ui.ButtonSet.YES_NO);

  if (result == ui.Button.NO) {
    return;
  }

  var spreadsheet = SpreadsheetApp.getActive();

  var rowCounts = {};
  var columnCounts = {};
  var percentErrors = {}
  var sheets = spreadsheet.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var sheetName = sheet.getName();
    var simulatedDataRegex = /^(\d+)x(\d+), (\d+% errors)$/;
    if (simulatedDataRegex.test(sheetName)) {
      var match = simulatedDataRegex.exec(sheetName);
      var numRows = match[1];
      var numColumns = match[2];
      var percentError = match[3];
      rowCounts[numRows] = true;
      columnCounts[numColumns] = true;
      percentErrors[percentError] = true;
    }
  }

  // Depends on core Keemei API.
  rowCounts = Object.keys(rowCounts).sort(naturalCompare_);
  columnCounts = Object.keys(columnCounts).sort(naturalCompare_);
  if (columnCounts.length > 1) {
    ui.alert("Simulated data error",
             "Benchmarks assume constant number of columns in simulated data sheets.",
             ui.ButtonSet.OK);
    return;
  }
  var numColumns = parseInt(columnCounts[0], 10);
  percentErrors = Object.keys(percentErrors).sort(naturalCompare_);

  var resultsSheetName = "Dataset size benchmark results";
  var resultsSheet = spreadsheet.getSheetByName(resultsSheetName);
  if (resultsSheet === null) {
    resultsSheet = spreadsheet.insertSheet(resultsSheetName, 0);

    var header = [["Number of rows"].concat(percentErrors)];
    var range = resultsSheet.getRange(1, 1, header.length, header[0].length);
    range.setValues(header);

    var numRowsColumn = [];
    for (var i = 0; i < rowCounts.length; i++) {
      numRowsColumn.push([rowCounts[i]]);
    }

    var range = resultsSheet.getRange(2, 1, numRowsColumn.length, numRowsColumn[0].length);
    range.setValues(numRowsColumn);
    SpreadsheetApp.flush();
  }

  var percentErrors = resultsSheet.getRange(1, 2, 1, resultsSheet.getLastColumn() - 1).getDisplayValues()[0];
  for (var i = 2; i <= resultsSheet.getLastRow(); i++) {
    var row = resultsSheet.getRange(i, 1, 1, resultsSheet.getLastColumn()).getDisplayValues()[0];
    var rowCount = row[0];
    for (var j = 0; j < percentErrors.length; j++) {
      var percentError = percentErrors[j];
      var errorProportionRegex = /^(\d+)% errors$/;
      var match = errorProportionRegex.exec(percentError);
      var errorProportion = parseFloat(match[1]) / 100;

      var sheetName = Utilities.formatString("%sx%s, %s", rowCount, numColumns, percentError);
      var sheet = spreadsheet.getSheetByName(sheetName);
      if (sheet === null) {
        throw Utilities.formatString("Sheet '%s' does not exist, cannot perform benchmarks against it", sheetName);
      }

      var runtime = row[j + 1];
      if (runtime === "") {
        // Depends on core Keemei API.
        var report = validate_(getQiime1FormatSpec_, sheet);

        var numInvalidCells = Object.keys(report.validationResults).length;
        var expectedNumInvalidCells = (parseInt(rowCount, 10) * numColumns) * errorProportion;
        assert_(numInvalidCells === expectedNumInvalidCells);

        // Convert from milliseconds to seconds.
        runtime = report.runtime / 1000;
        var range = resultsSheet.getRange(i, j + 2);
        range.setValue(runtime);
        SpreadsheetApp.flush();
      }
    }
  }

  var charts = resultsSheet.getCharts();
  for (var i = 0; i < charts.length; i++) {
    resultsSheet.removeChart(charts[i]);
  }

  var range = resultsSheet.getDataRange();
  var chartBuilder = resultsSheet.newChart()
      .addRange(range)
      .setPosition(resultsSheet.getLastRow() + 2, 1, 0, 0)
      // List of advanced options:
      // https://developers.google.com/chart/interactive/docs/gallery/linechart?csw=1#configuration-options
      //
      // Can't find docs for `hasLabelsColumn` but it's an important one
      // because we want the first column to be treated as discrete labels.
      .setOption("hasLabelsColumn", true)
      .asLineChart()
      .setPointStyle(Charts.PointStyle.MEDIUM)
      .setXAxisTitle("Number of rows")
      .setYAxisTitle("Runtime (seconds)");
  resultsSheet.insertChart(chartBuilder.build());
};

function runRuleSizeBenchmarks() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(
    "Please confirm",
    "This script expects simulated data to have been created in the current spreadsheet. " +
    "The script will create a sheet of benchmark results. The script will run for a few minutes. " +
    "Are you sure you want to continue?",
    ui.ButtonSet.YES_NO);

  if (result == ui.Button.NO) {
    return;
  }

  var spreadsheet = SpreadsheetApp.getActive();
  var validDataSheet = spreadsheet.getSheetByName("1000x24, 0% errors");
  assert_(validDataSheet !== null);

  var resultsSheetName = "Rule size benchmark results";
  var resultsSheet = spreadsheet.getSheetByName(resultsSheetName);
  if (resultsSheet !== null) {
    spreadsheet.deleteSheet(resultsSheet);
  }
  resultsSheet = spreadsheet.insertSheet(resultsSheetName, 0);
  SpreadsheetApp.flush();

  var resultsData = [["Number of rules", "Runtime"]];
  var ruleCounts = [0, 1, 10, 100, 1000];
  for (var i = 0; i < ruleCounts.length; i++) {
    var numRules = ruleCounts[i];
    var formatSpecFunction = buildFormatSpecFunction_(numRules);
    var report = validate_(formatSpecFunction, validDataSheet);

    var numInvalidCells = Object.keys(report.validationResults).length;
    assert_(numInvalidCells === 0);

    // Convert from milliseconds to seconds.
    var runtime = report.runtime / 1000;
    resultsData.push([numRules, runtime]);
  }
  var range = resultsSheet.getRange(1, 1, resultsData.length, resultsData[0].length);
  range.setValues(resultsData);
  SpreadsheetApp.flush();

  var chartBuilder = resultsSheet.newChart()
      .addRange(range)
      .setPosition(resultsSheet.getLastRow() + 2, 1, 0, 0)
      // List of advanced options:
      // https://developers.google.com/chart/interactive/docs/gallery/linechart?csw=1#configuration-options
      //
      // Can't find docs for `hasLabelsColumn` but it's an important one
      // because we want the first column to be treated as discrete labels.
      .setOption("hasLabelsColumn", true)
      .asLineChart()
      .setPointStyle(Charts.PointStyle.MEDIUM)
      .setLegendPosition(Charts.Position.NONE)
      .setXAxisTitle("Number of rules")
      .setYAxisTitle("Runtime (seconds)");
  resultsSheet.insertChart(chartBuilder.build());
};

function buildFormatSpecFunction_(numRules) {
  var rules = [];
  for (var i = 0; i < numRules; i++) {
    rules.push(
      {
        // Depends on core Keemei API.
        validator: findInvalidCharacters_,
        args: [/[a-z0-9_.#\-+% ;:,\/]/ig, "errors", "metadata"]
      }
    );
  }

  return function(sheetData) {
    return {
      format: "Rule size benchmarking",
      headerRowIdx: 0,
      dataStartRowIdx: 1,
      headerValidation: rules,
      columnValidation: {
        "default": rules,
        columns: {}
      }
    };
  };
};
