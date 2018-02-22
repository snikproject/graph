# snik-cytoscape.js
Visualization of the snik-ontology. Can also be used to generate Cytoscape Desktop graph files. Browse the code documentation [here](https://imise.github.io/snik-cytoscape.js/index.html)!

## Installation
Git clone or download to a webserver or local directory of your choice, run init and then open index.html in a browser.
If the website and the SPARQL endpoint are on different domains, you may need to bypass CORS.
On Windows, rewrite init to a batch script and please create a pull request for other Windows users.
## Usage Requirements
Optimized for PC with mouse, does not work well on mobile devices.

* Source: Browser with ES6 and ES6 module support
* Transpiled: IE 11, Firefox 30+, Chrome 20+, Opera 20+, Safari 4+ (older browsers and versions may work but are not guaranteed)

#### Folder structure
`lib` contains external libraries that are not available on a cdn. `js` contains self created javascript files. `data` contains the graph with layout information,
The root folder contains all the HTML files.

## Development

### Development Requirements

* a command line interface, e.g. a Linux shell
* npm installed and the paths configured so that it can be executed via `npm`

### Setup
1. clone this repository
2. ./init

### Publish

Execute the setup step once.
Each time there are changes you want to publish and the tests are successfull, go on the server and do:

1. `git pull`
2. `npm run build`

### Code Style
Specified in the ESlint config file `.eslintrc.json`.

## Scripts
* `npm run test` runs the mocha tests
* `npm run build` transpiles the code for browsers without full ES6 support, used by index-babel.html
* `npm run jsdoc` generates the API documentation

### Pure JavaScript Development
If you don't like to use npm and babel you can use a pure JavaScript workflow for development but then your browser needs to support the source requirements (some browsers need experimental flags activated).

For example, in Firefox 57, go to `about:config` and set `dom.moduleScripts.enabled=true`.

### Development with Tooling

* At first checkout, run `npm install` to download the necessary NPM modules.
* To execute the Mocha unit tests, run `npm run test`.
* For production or if you develop on an browser without ES 6 module support, run `npm run build` and then open `index-babel.html`.
