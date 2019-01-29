# snik-cytoscape.js
Visualization of the snik-ontology using the Cytoscape.js graph library. Can also be used to generate Cytoscape Desktop graph files. Browse the code documentation [here](https://imise.github.io/snik-cytoscape.js/index.html)!

## Usage Requirements
Optimized for PC with mouse, does not work well on mobile devices. Internet Explorer is not supported.

### index-dev.html
This is the development version where you can just edit the JavaScript files and see the changes directly on page reload.
This version is deployed at http://www.snik.eu/graph/index-dev.html and sometimes at http://www.snik.eu/pgraph (including experimental changes).
Requires a browser with ES6 module support:

* Firefox [54-59] with `dom.moduleScripts.enabled=true` in `about:config`, Firefox 60+ otherwise
* Safari 10.1
* Chrome 61
* Edge 16

Chrome needs the "--allow-file-access-from-files" parameter to load modules locally but still fails to load them from files in version 69.0.3497.100, so for developing with Chrome you need a local web server.

### index-prod.html
This is the transpiled version that is deployed at http://www.snik.eu/graph. Seeing the changes requires a `npm run build`, so it is not recommended for development.

* Firefox 50+
* Chrome 54+
* Opera 41+
* Safari 10+
* Edge 12+

If you notice different behaviour on your browser, i.e. your browser is newer and doesn't work or older and does work, please create an issue.

## Development

### Setup
1. `git clone` this repository
2. `npm install`
3. copy `js/config.dist.js` to `js/config.js`
4. link or copy `index-prod.html` or `index-dev.html` to index.html

If the website and the SPARQL endpoint are on different domains, you may need to bypass CORS.

### Publish

Execute the setup step one and then run `npm run build`.
If you want the newest changes from the GitHub repository, execute `git pull` first. The newest version may be unstable, however, so for production it is safer to use a release.

### Update

1. `git pull`
2. `npm update`
3. `npm run build`
4. if there are new keys in the config file, you may need to copy `js/config.dist.js` to `js/config.js` again

Make sure it runs locally before updating on the server, see releasechecklist.md.

### Code Style
Specified in the ESlint config file `.eslintrc.json`.
Use the [Cytoscape.js notation](http://js.cytoscape.org/#notation/functions) for JSDoc types and generic parameters, such as "ele" for "a collection of a single element (node or edge)".
Instead of "eles", "cy.collection" may be used as JSDoc type.

### Scripts
* `npm run test` runs the mocha tests
* `npm run build` transpiles the code for browsers without full ES6 support, used by index-babel.html
* `npm run jsdoc` generates the API documentation

### LogLevels
* `trace`: very verbose information for debugging  
* `debug`: information for debugging
* `info`: generally useful information, not only for developers (default)
* `warn`: for problems that are recoverable
* `error`: for errors that shut down the application

## Adaptation

If you like SNIK Graph and want to use it with different data, please open an issue.
While the main part is written generally, there .
