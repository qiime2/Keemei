# keemei

[![Join the chat at https://gitter.im/jairideout/Keemei](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jairideout/Keemei?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

*Validate QIIME metadata in Google Sheets*

keemei (canonically pronounced *key may*) is an open-source, BSD-licensed tool for validating [QIIME](http://qiime.org/) metadata stored in [Google Sheets](http://www.google.com/sheets/about/). It is written in [Google Apps Script](https://developers.google.com/apps-script/) for easy integration with Google Sheets.

## Why keemei?

keemei provides an easy and interactive way to validate QIIME metadata from within Google Sheets. It is meant to *complement* the suite of metadata validation tools already available in QIIME by giving first-class support to users storing their metadata in Google Sheets.

Since validation is performed within Google Sheets, metadata creation, updates, and validation can happen *all in the same place*. keemei also provides an easy-to-use interface to help quickly locate, understand, and fix validation errors. These features are especially useful when there is a large amount of metadata, with many collaborators making frequent updates throughout the lifetime of the project. Additionally, collaborators involved in metadata curation may not always have access to a QIIME installation, so keemei provides an accessible way to perform validation.

keemei's validation rules are based on QIIME's [metadata mapping file format description](http://qiime.org/documentation/file_formats.html#metadata-mapping-files). It provides validation similar to QIIME's `check_id_map.py`/[`validate_mapping_file.py`](http://qiime.org/scripts/validate_mapping_file.html) command-line scripts. QIIME's [`load_remote_mapping_file.py`](http://qiime.org/scripts/load_remote_mapping_file.html) script can be used to load Google Sheets that have been validated by keemei.

## Installation

Once an initial release is published, keemei will be installable as a Google Sheets [add-on](https://developers.google.com/apps-script/add-ons/). Installation and usage instructions will be provided at that time.

## Getting help

To get help with keemei, post an issue on the [issue tracker](https://github.com/jairideout/keemei/issues).

## Getting involved

keemei is currently under active development. It is intended to be an open development effort, so if you'd like to get involved, please get in touch on the [issue tracker](https://github.com/jairideout/keemei/issues)!

## Licensing

keemei is available under the new BSD license. See [LICENSE](LICENSE) for more details.
