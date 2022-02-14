# SNIK Graph

![build](https://github.com/snikproject/snik-graph/actions/workflows/build.yml/badge.svg)
[![License: GNU GPLv3](https://img.shields.io/badge/license-GPL-blue)](LICENSE)
![TypeScript](https://badges.aleen42.com/src/typescript.svg)
[![Vite](https://badges.aleen42.com/src/vitejs.svg)](https://vitejs.dev/)

Visualization of the SNIK ontology using the Cytoscape.js graph library.
Live at <https://www.snik.eu/graph> and <https://snikproject.github.io/snik-graph/index.html>.
<!--Browse the code documentation [here](https://snikproject.github.io/snik-graph/index.html)!-->

## Installation and Preview

### Node

	git clone https://github.com/snikproject/snik-graph.git
    npm install
    cp js/config.dist.ts js/config.ts
    npm run preview

Open <http://localhost:3000/> in a browser.

### Docker

	git clone https://github.com/snikproject/snik-graph.git
    docker build . -t snik-graph
	docker run --network="host" snik-graph
	
Open <http://localhost:8043/> in a browser.

## Usage Requirements
Optimized for PC with mouse, does not work well on mobile devices.
Requires a browser with [ES6 module support](https://caniuse.com/es6-module).

## Documentation

* [User Manual](https://www.snik.eu/graph/html/manual.html)
* [Layout Help](https://www.snik.eu/graph/html/layoutHelp.html)
* [Troubleshooting](https://www.snik.eu/graph/html/troubleshooting.html)
* [SNIK Project Homepage](https://www.snik.eu/)
* generate API documentation in the `docs` folder with `npm run doc`

## Development

### Setup

If the website and the SPARQL endpoint are on different domains, you may need to bypass CORS.

### Publish

SNIK Graph is automatically built from the master branch using a GitHub action.
Build locally with `npm run build`.
If you want the newest changes from the GitHub repository, follow the master branch. The newest version may be unstable, however, so for production it is safer to check out the newest release.

### Update

1. `git pull`
2. `npm update`
3. if there are new keys in the config file, you may need to copy `js/config.dist.js` to `js/config.js` again

Make sure it runs locally before updating on the server, see releasechecklist.md.

### Code Style
Specified in the [ESlint](.eslintrc.json) and [Prettier](.prettierrc) configuration files.
Husky will apply Prettier formating on every commit.

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

## License
SNIK Graph has a noncommercial license with copyleft, the *Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International*, see LICENCE for details.
We want to encourage reuse, modification, derivation and distribution as much as possible, so if that license is a problem for you please contact [Prof. Winter](www.people.imise.uni-leipzig.de/alfred.winter) and we try our best to find a solution.


