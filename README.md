# snik-cytoscape.js
Visualization of the snik-ontology.

## Installation
Git clone or download to a webserver or local directory of your choice and run index.html in a browser.
If the website and the SPARQL endpoint are on different domains, you may need to bypass CORS.

## Requirements
Optimized for PC with mouse, does not work well on mobile devices.
Requires a browser with JavaScript support, uses ES6 constants.

#### Verified Browsers
- Firefox 48

#### Folder structure
`lib` contains external libraries. `js` contains self created javascript files. `data` contains the graph with layout information, either the public (snik.cyjs) or the private (snik-ciox.cyjs) version.
The root folder contains all the HTML files.
