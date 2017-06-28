function getQiime2FormatSpec_(sheetData) {
  // TODO: this isn't the best place to put this type of validation.
  // There isn't a hook yet to error if there are missing data rows
  // for a file format, so use an ad-hoc check for now.
  if (sheetData.length < 2) {
    var ui = SpreadsheetApp.getUi();
    ui.alert("Missing data",
             "This sheet must have at least two rows in order to be validated. " +
             "The first row contains the header and subsequent rows contain data.",
             ui.ButtonSet.OK);
    return null;
  }

  var axisLabelRegex = /[^\/\\*<>?|$]/ig;

  var formatSpec = {
    format: "QIIME 2 mapping file",

    // TODO: update when blank lines and comments are supported
    headerRowIdx: 0,
    dataStartRowIdx: 1,

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

  // TODO: update when blank lines and comments are supported
  var idColumnLabel = sheetData[0][0];

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
