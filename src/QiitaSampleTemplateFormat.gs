function getQiitaSampleTemplateFormatSpec_(sheetData) {
  var requiredFields = ["sample_name"];
  var requiredEbiFields = ["collection_timestamp", "physical_specimen_location", "taxon_id", "description", "scientific_name"];
  var requiredCentralizedFields = ["sample_type", "physical_specimen_remaining", "dna_extracted", "latitude", "longitude", "host_subject_id"];

  return {
    format: "Qiita sample template",
    ignoredRowIdxs: [],
    headerValidation: [
      {
        validator: findMissingValues_,
        args: [requiredFields, "errors", "fields", [0, 0]]
      },
      {
        validator: findMissingValues_,
        args: [requiredEbiFields, "warnings", "fields", [0, 0], "These fields are required if you intend to submit your data to EBI through Qiita."]
      },
      {
        validator: findMissingValues_,
        args: [requiredCentralizedFields, "warnings", "fields", [0, 0], "These fields are required if you intend to make your data public on the centralized Qiita server."]
      },
      {
        validator: findDuplicates_,
        args: ["Duplicate field"]
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
        "sample_name": [
          {
            validator: findDuplicates_,
            args: ["Duplicate sample name"]
          },
          {
            validator: findInvalidCharacters_,
            args: [/[a-z0-9.]/ig, "errors", "sample name", "Only MIENS-compliant characters are allowed."]
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
        "collection_timestamp": [
          {
            validator: findInvalidDateTimes_,
            args: ["MM/DD/YY HH:mm", '"MM/DD/YY HH:mm"']
          },
          {
            validator: findLeadingTrailingWhitespace_,
            args: []
          }
        ],
        "taxon_id": [
          {
            validator: findNegativeIntegers_,
            args: ["taxon_id"]
          },
          {
            validator: findLeadingTrailingWhitespace_,
            args: []
          }
        ],
        "physical_specimen_remaining": getYesNoFieldValidators_("physical_specimen_remaining"),
        "dna_extracted": getYesNoFieldValidators_("dna_extracted"),
        "latitude": [
          {
            validator: findOutOfRange_,
            args: [-90.0, 90.0, "latitude"]
          },
          {
            validator: findLeadingTrailingWhitespace_,
            args: []
          }
        ],
        "longitude": [
          {
            validator: findOutOfRange_,
            args: [-180.0, 180.0, "longitude"]
          },
          {
            validator: findLeadingTrailingWhitespace_,
            args: []
          }
        ],
      }
    }
  };
};

function getYesNoFieldValidators_(field) {
  return [
    {
      validator: findInvalidValues_,
      args: [{"y": true, "n": true}, field]
    },
    {
      validator: findLeadingTrailingWhitespace_,
      args: []
    }
  ];
};
