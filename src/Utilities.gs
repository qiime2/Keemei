function isSheetEmpty_(sheet) {
  return sheet.getLastRow() == 0 && sheet.getLastColumn() == 0;
};

// modified from http://stackoverflow.com/a/4579228/3776794
function startsWith_(str, substr) {
  return str.lastIndexOf(substr, 0) === 0;
};

// modified from https://sites.google.com/site/scriptsexamples/custom-methods/sheetconverter
function getFormattedValues_(range) {
  // ensure the spreadsheet config overrides the script's
  var ss = range.getSheet().getParent();

  // this used to be SheetConverter.init(...) when using the SheetConverter library.
  // since library usage is discouraged in add-ons, we've included the SheetConverter
  // source code in this project and access it differently.
  var conv = init(ss.getSpreadsheetTimeZone(), ss.getSpreadsheetLocale());
  return conv.convertRange(range);
};
