# snik-cytoscape.js
Visualization of the snik-ontology.

## Installation
Git clone or download to a webserver or local directory of your choice and run index.html in a browser.
If the website and the SPARQL endpoint are on different domains, you may need to bypass CORS.

## Requirements
Optimized for PC with mouse, does not work well on mobile devices.
Uses JavaScript ES6 including ES6 modules.
Use babel to transpile to ES5 if you want to support older browsers.

#### Folder structure
`lib` contains external libraries that are not available on a cdn. `js` contains self created javascript files. `data` contains the graph with layout information,
The root folder contains all the HTML files.
