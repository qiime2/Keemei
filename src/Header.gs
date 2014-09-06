function validateHeader(sheet) {
  var headerRange = getHeaderRange(sheet);
  resetRange(headerRange);
  
  var headerLocations = getHeaderLocations(headerRange);
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
    var topLeftCell = headerRange.getCell(1, 1);
    var message = "Missing required columns: " + missingHeaders.join(", ");
    markCell(topLeftCell, Status.ERROR, message);
  }
  
  for (var header in headerLocations) {
    if (headerLocations.hasOwnProperty(header)) {
      var locations = headerLocations[header];
      
      if (locations.length > 1) {
        for (var i = 0; i < locations.length; i++) {
          var cell = headerRange.getCell(1, locations[i]);
          var message = "Duplicate column";
          markCell(cell, Status.ERROR, message);
        }
      }
      
      if (requiredHeaders.hasOwnProperty(header)) {
        var requiredLocation = requiredHeaders[header];
        
        for (var i = 0; i < locations.length; i++) {
          var location = locations[i];
          
          if (location != requiredLocation[0]) {
            var cell = headerRange.getCell(1, location);
            var message = "Misplaced column; must be the " + requiredLocation[1] + " column";
            markCell(cell, Status.ERROR, message);
          }
        }
      }
      
      // #SampleID is an invalid column header name, so we'll only check header names
      // if they aren't required headers. Assume the required header names are valid.
      if (!requiredHeaders.hasOwnProperty(header) && isInvalidHeaderName(header)) {
        for (var i = 0; i < locations.length; i++) {
          var cell = headerRange.getCell(1, locations[i]);
          var message = "Invalid character(s) in column header name";
          markCell(cell, Status.WARNING, message);
        }
      }
    }
  }
};

function getHeaderRange(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn());
};

function getHeaderLocations(headerRange) {
  var numColumns = headerRange.getNumColumns();
  var values = headerRange.getValues();
  
  var valueLocations = {};
  for (var i = 0; i < numColumns; i++) {
    var value = values[0][i];
    var location = i + 1;
    
    if (valueLocations.hasOwnProperty(value)) {
      valueLocations[value].push(location);
    }
    else {
      valueLocations[value] = [location];
    }
  }
  
  return valueLocations;
};

/**
 * Taken and modified from http://stackoverflow.com/a/8653681
 *
 * TODO: this will fail with numbers. Should explicitly convert to string first!
 */
function isInvalidHeaderName(name) {
  return !name.match(/^[a-z][a-z0-9_]*$/i);
};
