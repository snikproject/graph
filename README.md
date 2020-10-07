# snik-cytoscape.js
Visualization of the snik-ontology using the Cytoscape.js graph library. Can also be used to generate Cytoscape Desktop graph files. Browse the code documentation [here](https://imise.github.io/snik-cytoscape.js/index.html)!

## Usage Requirements
Optimized for PC with mouse, does not work well on mobile devices. Internet Explorer is not supported.

### index.html
This is the development version where you can just edit the JavaScript files and see the changes directly on page reload.
This version is deployed at http://www.snik.eu/graph/index.html and sometimes at http://www.snik.eu/pgraph (including experimental changes).
Requires a browser with ES6 module support:

* Firefox [54-59] with `dom.moduleScripts.enabled=true` in `about:config`, Firefox 60+ otherwise
* Safari 10.1
* Chrome 61
* Edge 16

## Development

### Setup
1. `git clone` this repository
2. `npm install`
3. copy `js/config.dist.js` to `js/config.js`

If the website and the SPARQL endpoint are on different domains, you may need to bypass CORS.

### Browser Settings 
These are only needed if you access index.html locally over the file prototocol, that is without using a web server, for example as `file:///home/konrad/projekte/snik/cytoscape/index.html`.

* Firefox needs `security.fileuri.strict_origin_policy;false` in `about:config`
* Chrome needs the "--allow-file-access-from-files" parameter to load modules locally but still fails to load them from files in version 69.0.3497.100, so for developing with Chrome you need a local web server, for example via `python -m http.server`.

### Publish

Execute the setup step one but use `npm install --only=prod`.
If you want the newest changes from the GitHub repository, follow the master branch. The newest version may be unstable, however, so for production it is safer to check out the newest release.

### Update

1. `git pull`
2. `npm update`
3. if there are new keys in the config file, you may need to copy `js/config.dist.js` to `js/config.js` again

Make sure it runs locally before updating on the server, see releasechecklist.md.

### Code Style
Specified in the ESlint config file `.eslintrc.json`.
Use the [Cytoscape.js notation](http://js.cytoscape.org/#notation/functions) for JSDoc types and generic parameters, such as "ele" for "a collection of a single element (node or edge)".
Instead of "eles", "cy.collection" may be used as JSDoc type.

### TypeScript

The code is vanilla ES6 JavaScript, only the JSDoc comments contain TypeScript types.
Use the `typecheck` script to use TypeScript as a static type checker.

### Scripts
* `npm run test` runs the mocha tests
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
