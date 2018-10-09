# snik-cytoscape.js
Visualization of the snik-ontology using the Cytoscape.js graph library. Can also be used to generate Cytoscape Desktop graph files. Browse the code documentation [here](https://imise.github.io/snik-cytoscape.js/index.html)!

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

* development on Linux or Mac OS is preferred. If you use Windows you need to make sure all the tools (git, wget, npm, a text editor that handles different line endings and UTF8 encoding) are installed and the paths are properly configured
* a Linux compatible command line interface, e.g. a Linux shell or Git Bash on Windows
* npm installed and the paths configured so that it can be executed via `npm`
* wget installed
* a browser that supports JavaScript ES6, modules included, is recommended, so you don't have to transpile for every change

### Setup
1. clone this repository
2. npm install
3. copy config.dist.js to config.js
4. link or copy index-prod.html or index-dev.html to index.html

### Publish

Execute the setup step one and then run `npm run build`.
If you want the newest changes from the GitHub repository, execute:

1. `git pull`
2. `npm run build`

### Code Style
Specified in the ESlint config file `.eslintrc.json`.
Use the [Cytoscape.js notation](http://js.cytoscape.org/#notation/functions) for JSDoc types and generic parameters, such as "ele" for "a collection of a single element (node or edge)".
Instead of "eles", "cy.collection" may be used as JSDOC type.

## Scripts
* `npm run test` runs the mocha tests
* `npm run build` transpiles the code for browsers without full ES6 support, used by index-babel.html
* `npm run jsdoc` generates the API documentation

### Pure vs transpiled development
I recommend the pure JavaScript workflow for development by opening index-dev.html but then your browser needs to support the source requirements.
Fortunately, the require ES2015 features are implemented by all major browsers for a while except the Internet Explorer but that one doesn't work anyways even with transpilation.
Modules can be used in the browser versions of at least Safari 10.1, Chrome 61, Firefox 60 and Edge 16.

In Firefox versions [54-59], go to `about:config` and set `dom.moduleScripts.enabled=true`.
Chrome needs the "--allow-file-access-from-files" parameter to load modules locally.

If your users have those browsers, you can stay with pure JavaScript and don't need the `npm run build`.

### Unit Tests

* To execute the Mocha unit tests, run `npm run test`.