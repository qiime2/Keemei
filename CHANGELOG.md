# Keemei changelog

**Note on versioning:** the version numbers used here match the version numbers displayed to users in the Chrome Web Store. Sometimes there are gaps between release versions (e.g., version 2 jumps to version 5). This happens because each separate upload of Keemei to the web store increments the version number, and sometimes multiple uploads are necessary before a release is finalized (e.g., if the release is reviewed by an add-ons advisor and updates are required before it can go public). Therefore, the version numbering used here in the changelog and tagged GitHub releases will match the public release version displayed in the web store.

## Development version

## Version 5 (2015-06-17)

Minor alpha release with several usability enhancements.

### Features
* Valid cells (i.e., those without any errors or warnings) are no longer colored green as this information wasn't important to display. The green coloring could actually detract from the ease of locating invalid cells ([#58](https://github.com/biocore/Keemei/issues/58))
* Users are notified when a sheet is completely valid (i.e., no cells have errors or warnings) via a pop-up box ([#57](https://github.com/biocore/Keemei/issues/57))
* Error and warning messages are prefixed with a label to indicate their type (e.g., "Warning: Empty cell") ([#31](https://github.com/biocore/Keemei/issues/31))
* Cells with leading/trailing whitespace characters are now flagged with a warning ([#4](https://github.com/biocore/Keemei/issues/4))

## Version 2 (2015-04-14)
Initial alpha release.
