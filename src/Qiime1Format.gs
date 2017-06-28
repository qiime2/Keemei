function getQiime1FormatSpec_(sheetData) {
  var requiredHeaders = {
    "#SampleID": [0, "first"],
    "BarcodeSequence": [1, "second"],
    "LinkerPrimerSequence": [2, "third"],
    "Description": [sheetData[0].length - 1, "last"]
  };

  return {
    format: "QIIME 1 mapping file",
    headerRowIdx: 0,
    dataStartRowIdx: getQiime1DataStartRowIdx_(sheetData),
    headerValidation: [
      {
        validator: findMissingValues_,
        args: [Object.keys(requiredHeaders), "errors", "columns", [0, 0]]
      },
      {
        validator: findDuplicates_,
        args: ["Duplicate column"]
      },
      {
        // #SampleID is an invalid column header name, so we'll only check header names
        // if they aren't required headers. Assume the required header names are valid.
        validator: findInvalidQiime1Columns_,
        args: [requiredHeaders]
      },
      {
        validator: findMisplacedQiime1Columns_,
        args: [requiredHeaders]
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
          validator: findInvalidCharacters_,
          args: [/[a-z0-9_.\-+% ;:,\/]/ig, "warnings", "metadata"]
        },
        {
          validator: findEmpty_,
          args: ["warnings"]
        },
        {
          validator: findLeadingTrailingWhitespace_,
          args: []
        }
      ],
      columns: {
        "#SampleID": [
          {
            validator: findDuplicates_,
            args: ["Duplicate sample ID"]
          },
          {
            validator: findInvalidCharacters_,
            args: [/[a-z0-9.]/ig, "warnings", "sample ID", "Only MIENS-compliant characters are allowed."]
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
        "BarcodeSequence": [
          {
            validator: findDuplicates_,
            args: ["Duplicate barcode sequence"]
          },
          {
            validator: findUnequalLengths_,
            args: ["Barcode"]
          },
          {
            // Check against IUPAC standard DNA characters (case-insensitive).
            validator: findInvalidCharacters_,
            args: [/[acgt]/ig, "errors", "barcode sequence", "Only IUPAC standard DNA characters are allowed."]
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
        "LinkerPrimerSequence": getPrimerValidators_(),
        "ReversePrimer": getPrimerValidators_()
      }
    }
  };
};

function getPrimerValidators_() {
  return [
    {
      // Check against IUPAC DNA characters (case-insensitive). Allow commas
      // since comma-separated primers are valid.
      validator: findInvalidCharacters_,
      args: [/[acbdghkmnsrtwvy,]/ig, "errors", "primer sequence", "Only IUPAC DNA characters are allowed."]
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

function getQiime1DataStartRowIdx_(sheetData) {
  for (var i = 1; i < sheetData.length; i++) {
    if (!startsWith_(sheetData[i][0], "#")) {
      break;
    }
  }
  return i;
};

function findInvalidQiime1Columns_(valueToPositions, ignoredValues) {
  var invalidCells = {};
  var message = [
    Utilities.formatString("Invalid column header name. Only alphanumeric and underscore characters are allowed. The first character must be a letter.")
  ];

  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value) &&
        !ignoredValues.hasOwnProperty(value) &&
        (value.match(/^[a-z][a-z0-9_]*$/ig) === null)) {
      var positions = valueToPositions[value];
      for (var i = 0; i < positions.length; i++) {
        invalidCells[getA1Notation_(positions[i])] = {
          "position": positions[i],
          "warnings": [message]
        };
      }
    }
  }

  return invalidCells;
};

function findMisplacedQiime1Columns_(valueToPositions, requiredHeaders) {
  var invalidCells = {};
  for (var value in valueToPositions) {
    if (valueToPositions.hasOwnProperty(value)) {
      var positions = valueToPositions[value];

      if (requiredHeaders.hasOwnProperty(value)) {
        var requiredLocation = requiredHeaders[value];
        var message = [Utilities.formatString("Misplaced column; \"%s\" must be the %s column", value, requiredLocation[1])];

        for (var i = 0; i < positions.length; i++) {
          var position = positions[i];

          if (position[1] != requiredLocation[0]) {
            invalidCells[getA1Notation_(position)] = {
              "position": position,
              "errors": [message]
            };
          }
        }
      }
    }
  }

  return invalidCells;
};
