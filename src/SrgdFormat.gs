function getSrgdFormatSpec_(sheetData) {
  return {
    format: "SRGD",
    headerRowIdx: 0,
    dataStartRowIdx: 1,
    headerValidation: [
      {
        validator: findMissingSrgdFields_,
        args: [[0, 0]]
      },
      {
        validator: findDuplicates_,
        args: ["Duplicate field. Only loci (L_YourLocusName) fields can be duplicates", isLocusField_]
      },
      {
        validator: findEmpty_,
        args: ["errors"]
      },
      {
        validator: findLeadingTrailingWhitespace_,
        args: []
      }
    ],
    columnValidation: {
      "default": [
        {
          validator: findLeadingTrailingWhitespace_,
          args: []
        }
      ],
      columns: {
        "Sample_ID": [
          {
            validator: findDuplicates_,
            args: ["Duplicate sample ID"]
          },
          {
            validator: findEmpty_,
            args: ["errors"]
          },
          {
            validator: findLeadingTrailingWhitespace_,
            args: []
          }
        ],
        "Latitude": [
          {
            validator: findOutOfRange_,
            args: [-90.0, 90.0, "Latitude"]
          },
          {
            validator: findEmpty_,
            args: ["errors"]
          },
          {
            validator: findLeadingTrailingWhitespace_,
            args: []
          }
        ],
        "Longitude": [
          {
            validator: findOutOfRange_,
            args: [-180.0, 180.0, "Longitude"]
          },
          {
            validator: findEmpty_,
            args: ["errors"]
          },
          {
            validator: findLeadingTrailingWhitespace_,
            args: []
          }
        ],
        "X": getProjectedCoordinateValidators("X"),
        "Y": getProjectedCoordinateValidators("Y"),
        "Date_Time": [
          {
            validator: findInvalidSrgdDateTimeFields_,
            args: []
          },
          {
            validator: findLeadingTrailingWhitespace_,
            args: []
          }
        ]
      }
    }
  };
};

function getProjectedCoordinateValidators(field) {
  return [
    {
      validator: findOutOfRange_,
      args: [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Utilities.formatString("%s (projected coordinate)", field)]
    },
    {
      validator: findEmpty_,
      args: ["errors"]
    },
    {
      validator: findLeadingTrailingWhitespace_,
      args: []
    }
  ];
};

function findMissingSrgdFields_(valueToPositions, position) {
  var invalidCells = {};
  var errors = [];

  if (!valueToPositions.hasOwnProperty("Sample_ID")) {
    errors.push(["Missing required Sample_ID field"]);
  }

  var hasLatitude = valueToPositions.hasOwnProperty("Latitude");
  var hasLongitude = valueToPositions.hasOwnProperty("Longitude");
  var hasX = valueToPositions.hasOwnProperty("X");
  var hasY = valueToPositions.hasOwnProperty("Y");

  var mixedErrorMessage = ["Cannot combine Latitude/Longitude fields with X/Y fields"];
  if (hasLatitude && hasLongitude) {
    if (hasX || hasY) {
      errors.push(mixedErrorMessage);
    }
  }
  else if (hasX && hasY) {
    if (hasLatitude || hasLongitude) {
      errors.push(mixedErrorMessage);
    }
  }
  else {
    errors.push(["Must provide either Latitude and Longitude OR X and Y fields"]);
  }

  var hasSex = valueToPositions.hasOwnProperty("Sex");
  var hasHaplotype = valueToPositions.hasOwnProperty("Haplotype");

  var hasLoci = false;
  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value)) {
      if (isLocusField_(value)) {
        hasLoci = true;
        break;
      }
    }
  }

  if (!(hasSex || hasHaplotype || hasLoci)) {
    errors.push(["Must provide at least one Sex, Haplotype, or loci (L_YourLocusName) field"]);
  }

  if (errors.length > 0) {
    invalidCells[getA1Notation_(position)] = {
      "position": position,
      "errors": errors
    };
  }

  return invalidCells;
};

function isLocusField_(value) {
  return startsWith_(value, "L_") && value.substring(2).length > 0;
};

function findInvalidSrgdDateTimeFields_(valueToPositions) {
  var invalidCells = {};
  var message = ["Must be a valid date/time in ISO 8601 format"];

  for (var value in valueToPositions) {
    // moment(..., true) indicates strict parsing.
    if (valueToPositions.hasOwnProperty(value) &&
        (value.length > 0) &&
        !moment(value, moment.ISO_8601, true).isValid()) {
      var positions = valueToPositions[value];
      for (var i = 0; i < positions.length; i++) {
        invalidCells[getA1Notation_(positions[i])] = {
          "position": positions[i],
          "errors": [message]
        };
      }
    }
  }

  return invalidCells;
};
