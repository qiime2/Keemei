function validateHeader_(sheet, state) {
  var headerRange = getHeaderRange_(sheet);
  var headerLocations = getValueToPositionsMapping_(headerRange);
  var requiredHeaders = {
    "#SampleID": [1, "first"],
    "BarcodeSequence": [2, "second"],
    "LinkerPrimerSequence": [3, "third"],
    "Description": [sheet.getLastColumn(), "last"]
  };

  var missingHeaders = [];
  for (var requiredHeader in requiredHeaders) {
    if (requiredHeaders.hasOwnProperty(requiredHeader)) {
      if (!headerLocations.hasOwnProperty(requiredHeader)) {
        missingHeaders.push(requiredHeader);
      }
    }
  }

  if (missingHeaders.length > 0) {
    var message = "Missing required columns: " + missingHeaders.join(", ");
    updateState_(state, {row: 1, column: 1}, Status.ERROR, message);
  }

  for (var header in headerLocations) {
    if (headerLocations.hasOwnProperty(header)) {
      var locations = headerLocations[header];

      if (locations.length > 1) {
        for (var i = 0; i < locations.length; i++) {
          var message = "Duplicate column";
          updateState_(state, locations[i], Status.ERROR, message);
        }
      }

      if (requiredHeaders.hasOwnProperty(header)) {
        var requiredLocation = requiredHeaders[header];

        for (var i = 0; i < locations.length; i++) {
          var location = locations[i];

          if (location.column != requiredLocation[0]) {
            var message = "Misplaced column; must be the " + requiredLocation[1] + " column";
            updateState_(state, location, Status.ERROR, message);
          }
        }
      }

      // #SampleID is an invalid column header name, so we'll only check header names
      // if they aren't required headers. Assume the required header names are valid.
      if (!requiredHeaders.hasOwnProperty(header) && isInvalidHeaderName_(header)) {
        for (var i = 0; i < locations.length; i++) {
          var message = "Invalid character(s) in column header name";
          updateState_(state, locations[i], Status.WARNING, message);
        }
      }
    }
  }
};

/**
 * Taken and modified from http://stackoverflow.com/a/8653681
 *
 * TODO: this will fail with numbers. Should explicitly convert to string first!
 */
function isInvalidHeaderName_(name) {
  return !name.match(/^[a-z][a-z0-9_]*$/i);
};
