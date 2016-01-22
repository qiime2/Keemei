# Keemei changelog

**Note on versioning:** the version numbers used here match the version numbers displayed to users in the Chrome Web Store. Sometimes there are gaps between release versions (e.g., version 2 jumps to version 5). This happens because each separate upload of Keemei to the web store increments the version number, and sometimes multiple uploads are necessary before a release is finalized (e.g., if the release is reviewed by an add-ons advisor and updates are required before it can go public). Therefore, the version numbering used here in the changelog and tagged GitHub releases will match the public release version displayed in the web store.

## Development version

### Features
* Improved error message clarity for misplaced columns in QIIME mapping files ([#63](https://github.com/biocore/Keemei/issues/63))

### Bug fixes
* Fixed issue where cell background colors and notes would remain as display artifacts when re-validating or clearing validation status of a sheet with a smaller data range ([#64](https://github.com/biocore/Keemei/issues/64))
* Removed broken link from "About" dialog

## Version 6 (2016-01-19)

Initial beta release.

### Features
* Added sidebar interface to display validation report and locate invalid cells ([#7](https://github.com/biocore/Keemei/issues/7))
* Added support for validating SRGD files (e.g., for use in [geneGIS](http://genegis.org/)) ([#51](https://github.com/biocore/Keemei/issues/51))

### Performance enhancements
* Keemei is now ~10x faster and supports validating much larger sheets than was previously possible ([#29](https://github.com/biocore/Keemei/issues/29))

### Bug fixes
* Improved error message for invalid column names. Previous message was misleading because it indicated the header contained invalid characters, but headers have more complicated rules. These rules are now stated in the error message ([#61](https://github.com/biocore/Keemei/issues/61))
* Validation of currency-formatted numbers (e.g., `(42.45)`) and other number/date formats now works as expected. Previous behavior was to mark as an empty cell if a cell's display value could not be computed by the [SheetConverter](https://sites.google.com/site/scriptsexamples/custom-methods/sheetconverter) library. Now uses the recently added `Range.getDisplayValues()` API in favor of SheetConverter, which also has improved performance ([#28](https://github.com/biocore/Keemei/issues/28))

## Version 5 (2015-06-17)

Minor alpha release with several usability enhancements.

### Features
* Valid cells (i.e., those without any errors or warnings) are no longer colored green as this information wasn't important to display. The green coloring could actually detract from the ease of locating invalid cells ([#58](https://github.com/biocore/Keemei/issues/58))
* Users are notified when a sheet is completely valid (i.e., no cells have errors or warnings) via a pop-up box ([#57](https://github.com/biocore/Keemei/issues/57))
* Error and warning messages are prefixed with a label to indicate their type (e.g., "Warning: Empty cell") ([#31](https://github.com/biocore/Keemei/issues/31))
* Cells with leading/trailing whitespace characters are now flagged with a warning ([#4](https://github.com/biocore/Keemei/issues/4))

## Version 2 (2015-04-14)
Initial alpha release.
