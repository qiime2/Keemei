function getQiime2FormatSpec_(sheetData) {
  var axisLabelRegex = /[^\/\\*<>?|$]/ig;

  var formatSpec = {
    format: "QIIME 2 metadata file",
    ignoredRowIdxs: getQiime2IgnoredRowIdxs_(sheetData),
    headerValidation: [
      {
        validator: findDuplicates_,
        args: ["Duplicate column label"]
      },
      {
        validator: findInvalidCharacters_,
        args: [axisLabelRegex, "errors", "column label"]
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
      columns: {}
    }
  };

  var idColumnLabel = sheetData[getHeaderRowIdx_(sheetData, formatSpec.ignoredRowIdxs)][0];

  formatSpec.columnValidation.columns[idColumnLabel] = [
    {
      validator: findDuplicates_,
      args: ["Duplicate identifier"]
    },
    {
      validator: findInvalidCharacters_,
      args: [axisLabelRegex, "errors", "identifier"]
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

  return formatSpec;
};

function getQiime2IgnoredRowIdxs_(sheetData) {
  var ignored = new Array(sheetData.length);
  for (var i = 0; i < sheetData.length; i++) {
    var row = sheetData[i];

    // Special case for QIIME 1 backwards compatibility.
    if ((i == 0) && (row[0] === '#SampleID')) {
      continue;
    }

    // We can only validate comment lines because it isn't
    // possible to export a Google Sheet as TSV with blank
    // lines (i.e. only spaces in the line) -- tab delimiters
    // are always included in the exported row, so the row
    // won't be ignored when QIIME 2 loads the file.
    if (startsWith_(row[0], "#")) {
      ignored[i] = true;
    }
  }
  return ignored;
};
