# Keemei

[![Join the chat at https://gitter.im/biocore/Keemei](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/biocore/Keemei?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

*Validate bioinformatics metadata in Google Sheets*

Keemei (canonically pronounced *key may*) is an open-source, BSD-licensed tool for validating common bioinformatics metadata file formats stored in [Google Sheets](http://www.google.com/sheets/about/). It is written in [Google Apps Script](https://developers.google.com/apps-script/) for easy integration with Google Sheets.

Keemei currently supports [QIIME's](http://qiime.org/) metadata mapping file format (as defined [here](http://qiime.org/documentation/file_formats.html#metadata-mapping-files)). Support will be added in the future for additional metadata file formats used in bioinformatics (e.g., formats defined by [Qiita](https://github.com/biocore/qiita), [SourceTracker](http://sourceforge.net/projects/sourcetracker/), and [MG-RAST](https://metagenomics.anl.gov/)).

**Note:** Keemei is currently under active development and undergoing internal testing. Once complete, an initial public release will be installable as a [Google Sheets add-on](https://developers.google.com/apps-script/add-ons/).

## Getting started

To get started with Keemei, [browse the docs](https://github.com/biocore/Keemei/wiki).

## Getting involved

Keemei is intended to be an open development effort, so if you'd like to get involved, get in touch on [Gitter](https://gitter.im/biocore/Keemei) or the [issue tracker](https://github.com/biocore/Keemei/issues).

## Licensing

Keemei is available under the new BSD license. See [LICENSE](LICENSE) for more details.

Keemei uses the [SheetConverter](https://sites.google.com/site/scriptsexamples/custom-methods/sheetconverter) library, which is available under the 2-clause BSD license. See [licenses/SheetConverter.txt](licenses/SheetConverter.txt) for more details. The SheetConverter library is distributed with Keemei because [Google discourages the use of libraries in add-ons](https://developers.google.com/apps-script/add-ons/publish). Instead, they recommend copying the library code into the add-on and using it directly.

## Credits

Keemei was developed by [Jai Ram Rideout](http://caporasolab.us/people/jai-rideout) ([@jairideout](https://github.com/jairideout)) in the [Caporaso Lab](http://caporasolab.us). See the full list of Keemei's contributors [here](https://github.com/biocore/Keemei/graphs/contributors).
