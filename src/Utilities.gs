function isSheetEmpty_(sheet) {
  return sheet.getLastRow() == 0 && sheet.getLastColumn() == 0;
};

// modified from http://stackoverflow.com/a/4579228/3776794
function startsWith_(str, substr) {
  return str.lastIndexOf(substr, 0) === 0;
};
