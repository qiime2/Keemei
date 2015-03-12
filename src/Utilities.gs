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
  var conv = SheetConverter.init(ss.getSpreadsheetTimeZone(),
                                 ss.getSpreadsheetLocale());
  return conv.convertRange(range);
};
