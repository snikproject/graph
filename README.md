# SNIK Graph

[![build](https://github.com/snikproject/graph/actions/workflows/build.yml/badge.svg)](https://github.com/snikproject/graph/actions/workflows/build.yml)
[![License: GNU GPLv3](https://img.shields.io/badge/license-GPL-blue)](LICENSE)
![TypeScript](https://badges.aleen42.com/src/typescript.svg)
[![Vite](https://badges.aleen42.com/src/vitejs.svg)](https://vitejs.dev/)
[![Paper](https://img.shields.io/badge/Paper_DOI-10.21105/jose.00180-blue)](https://doi.org/10.21105/jose.00180)
[![Zenodo record](https://zenodo.org/badge/DOI/10.5281/zenodo.11997333.svg)](https://doi.org/10.5281/zenodo.11997333)

Visualization of the SNIK ontology using the Cytoscape.js graph library.
Live at <https://www.snik.eu/graph> (stable) and <https://snikproject.github.io/graph/index.html> (master branch).
Browse the code documentation [here](https://snikproject.github.io/graph/doc/).

## Installation and Preview

### Node

    git clone https://github.com/snikproject/graph.git
    cd graph
    npm install
    cp js/config/config.dist.ts js/config/config.ts
    npm run dev 

Open the displayed local link in a browser.

### Developing On Windows

Developing on Windows is not recommended but possible with the following adaptions:

* Instead of `cp js/config/config.dist.ts js/config/config.ts`, do `copy js\config\config.dist.ts js\config\config.ts` or use the Explorer to copy the file.
* lint-staged fails on Windows with "Current directory is not a git directory!". Skip the Husky commit hook with `git commit --no-verify`.

### Docker

    git clone https://github.com/snikproject/graph.git
    cd graph
    docker build . -t snik-graph
    docker run --network="host" snik-graph

Open <http://localhost:8043/> in a browser.

When using SNIK Graph as a Git submodule, use `docker build -f Dockerfile.submodule .. -t snik-graph` instead, so that Git commit information can be included in the about dialogue, otherwise the build fails.

## Usage Requirements
Optimized for PC with mouse, does not work well on mobile devices.
Requires a browser with [ES6 module support](https://caniuse.com/es6-module).

## Documentation

* [Developer Documentation](https://snikproject.github.io/graph/doc)
* [User Manual](https://www.snik.eu/graph/html/manual.html)
* [Layout Help](https://www.snik.eu/graph/html/layoutHelp.html)
* [Troubleshooting](https://www.snik.eu/graph/html/troubleshooting.html)
* [SNIK Project Homepage](https://www.snik.eu/)
* generate API documentation in the `docs` folder with `npm run doc`

## Configuration
SNIK Graph visualizes SNIK by default and is optimized for it but you can configure it to visualize other ontologies as well.
You can use the GET parameters on any running instance to filter and tweak the view in small ways without needing to use the UI.
For more complex operations, such as using your own ontology with SNIK Graph, you can use the configuration files to run your own instance.

> [!NOTE]
> When forking, please change the `git` configuration keys - for example in the [README](README.md) and [default config](./js/config/config.dist.ts).
> If you want to use your own ontology, you need to change the `ontology` configuration, see below.

### GET Parameters

All GET parameters are optional and must be lower case.
Flags are disabled by default and not need a value, for example <https://www.snik.eu/graph?empty&benchmark>.
Default parameter values are specified in `js/config.dist.ts`.
Values for keys starting with `ontology` are specified in the ontology config included in the config, by default `js/config/config.snik.ts`.

|**Flag**|**Description**|
|--------|-------------|
|empty|Skip initial graph loading and show button to load a local [Cytoscape.js JSON](https://js.cytoscape.org/#notation/elements-json) file.|
|benchmark|Add an overlay with performance statistics such as FPS and number of classes.|
|instances|Load and show instances when loading from SPARQL endpoint, not only classes.|
|virtual|Create "virtual triples" to visualize connections like domain-range.|

|**Parameter**|**Type**|**Config Key**|**Default**|**Description**|
|-------------|--------|--------------|-----------|---------------|
|class|URI|||Center and highlight the given class, e.g. <https://www.snik.eu/graph?clazz=http://www.snik.eu/ontology/bb/Management>. Skips the default view.|
|json|URL|||Skip initial graph loading and instead load a [Cytoscape.js JSON](https://js.cytoscape.org/#notation/elements-json) object from the given URL.|
|sparql|URL|ontology.sparql.endpoint|<https://www.snik.eu/sparql>|SPARQL endpoint to load the graph from|
|graph|URI|ontology.sparql.graph|<https://www.snik.eu/ontology>|SPARQL RDF graph or RDF graph group|
|sub|comma-separated list|helperGraphs + defaultSubOntologies|meta,bb,bb2,ob,ciox,he,it4it,limes-exact,match|List of subgraphs to load, only applies to SNIK.|

### Config Files

Using the configuration files, you can change the behaviour of SNIK Graph in major ways.
To adapt the configuration to your own ontology, check out the [HITO config](./js/config/config.hito.ts) as an example as well.

The instance specific configuration is defined in `js/config/config.ts`.
It exports a `config` object with key-value pairs.
The top-level keys are:
|**Key**|**Description**|**Example**|
|-------|---------------|-----------|
| `nodeSize`| Height and width of a node in pixels | `39` |
| `activeOptions` | Initially active style options, choose a subset of: `["showproperty","day", "edgecolor"]`; partially described in [the manual](./html/manual.html). | `["edgecolor"]` |
| `searchCloseMatch` | When searching for a resource, also show resources connected to it by `skos:closeMatch`. | `true` |
| `logLevelConsole` | Only used for mobile, desktop will always use `cxttapstart` | `"debug" as LogLevelDesc` |
| `logLevelDisplay` | Only used for mobile, desktop will always use `cxttapstart` | `"info" as LogLevelDesc` |
| `logLevelMemory` | Only used for mobile, desktop will always use `cxttapstart` | `"debug" as LogLevelDesc` |
| `layoutCacheMinRecall` | Preset layout minimum recall required to have it applied. | `0.95` |
| `layoutCacheMinPrecision` | Preset layout minimum precision required to have it applied. | `0.5` |
| `language` | Default language of the interface, choose either `"de"` or `"en"`. | `"en"` |
| `download` | Configuration regarding resolution of image downloads. ||
| `ontology` | Configuration regarding the ontology used in SNIK Graph. ||
| `multiview` | Configuration regarding tabs. ||
| `git` | Configuration regarding the GitHub repository connection. ||

#### `download`

Changes the resolution of downloaded images.
Specify an `image` object with the following properties:
|**Key**|**Description**|**Example**|
|-------|---------------|-----------|
| `image.max.width` | Max width of downloaded (high-res) images. | `5000` |
| `image.max.height` | Max height of downloaded (high-res) images. | `4000` |
| `image.standard.width` | Standard width of downloaded images. | `1920` |
| `image.standard.height` | Standard height of downloaded images. | `1080` |

#### `ontology`

> [!TIP]
> This is probably what you want to change when using your own ontology.

This configuration is rather complex and one of the reasons why we still use a TypeScript file and not a yaml file of some sorts for configuration. 
In the current [default configuration](./js/config/config.dist.ts), we import either a [snik config](./js/config/config.snik.ts) or a [hito config](./js/config/config.hito.ts) for the SNIK and HITO ontologies, respectively.
Consult these two files for more examples on this part of the config.

When writing your own ontology config, you can either do that in the `config.ts` itself (not recommended), or also write a separate file (recommended).

The subkeys are:
|**Key**|**Description**|**Example**|
|-------|---------------|-----------|
| `id` | ID used in code to identify which ontology is being used, for possibly better integration of a specific ontology (like SNIK). *This seems to be unused.* | `"snik"` |
| `name` | Name of the ontology in the docs. | `"SNIK"` |
| `name` | Name of the ontology in the docs. | `"SNIK"` |
| `initialView` | Object (probably JSON) which is loaded as the initial view. Consult [snik](./js/config/initialView/snik.json) and [hito](./js/config/initialView/hito.json) as examples. ||
| `snik` | SNIK-specific configuration. Only used for SNIK. Probably `null` if not the default. See below. | `null` |
| `style` | How to apply shapes and colors to the resources. See below. ||
| `sparql` | SPARQL-Queries to get triples (edges) and classes (nodes). See below. ||

##### SNIK-specific configuration

##### Style your own ontology

##### SPARQL-Config for custom ontology
|**Key**|**Description**|**Example**|
|-------|---------------|-----------|
| `endpoint` | SPARQL endpoint to use. Sends queries to this server. | `"https://www.snik.eu/sparql"` |
| `graph` | Base URI / SPARQL graph to use. | `""http://www.snik.eu/ontology"` |
| `instances` | Whether to display instances of classes. May not work. | `false` |
| `queries` | SPARQL-queries to query for classes and triples. See below. ||

> [!NOTE]
> TODO. For now, consult the files in the `js/config` directory for this part.

#### `multiview`

|**Key**|**Description**|**Example**|
|-------|---------------|-----------|
| `initialTabs` | How many tabs are open at the start. | `1` |
| `warnOnSessionLoad` | When loading a new session, warn that this will override the old one. | `true` |

#### `git`

We rely on GitHub for automatically assigning accounts and labels to issues (which can be reported through the app).
Here are the keys we use, **most of which you should probably change when running your own instance**.

> [!CAUTION]
> Please do not leave them at their default values when forking.

|**Key**|**Description**|**Example**|
|-------|---------------|-----------|
| `defaultIssueAssignee` | When reporting an issue through the application, this person is automatically assigned. | `"KonradHoeffner"` |
| `issueLabels` | We auto-assign some labels in the application and reference them by config keys. If you have different labels in your repository, change these values. | `{ bug: "bug", confirmLink: "link", deleteTriple: "deletetriple", deleteClass: "deleteclass" }` |
| `repo` | Assign the `ontology` repository and `application` repository to create the issues in. Please consult the following table for where each repo is used. | `{ ontology: "https://github.com/snikproject/ontology", application: "https://github.com/snikproject/graph" }` |

A more in-depth description of the issue labels, and where each type is created:
|**Key**|**Repository**|**Description**|**Example**|
|-------|--------------|---------------|-----------|
| `bug` | `application` | When a bug is reported through the UI, this label is assigned to the issue. | `"bug"` |
| `confirmLink` | `ontology` | When a limes link is being confirmed (right-click an edge; applies only to the very few, if any, remaining unconfirmed edges), this label is assigned to the issue created for the confirmation. | `"link"` |
| `deleteTriple` | `ontology` | When a user says a triple should be deleted (right-click any edge), this label is assigned to the issue requesting deletion. | `"deletetriple"` |
| `deleteClass` | `ontology` | When a user says a class should be deleted (right-click any node), this label is assigned to the issue requesting deletion. | `"deleteclass"` |

## Development

### Scripts
* `npm run dev` dev server
* `npm run build` build into `dist`
* `npm run preview` serve the `dist` folder
* `npm run test` run unit tests
* `npm run doc` generate API documentation
* `npm run prepare` automatically run on `npm install`, prepare Husky Prettier commit hook

### Update
1. `git pull`
2. `npm update`
3. if there are new keys in the config file, you may need to copy `js/config/config.dist.ts` to `js/config/config.ts` again

Make sure it runs locally before updating on the server, see releasechecklist.md.

### Code Style
Specified in the [configuration files of oxlint](oxlintrc.json) and [Prettier](.prettierrc).

#### Formatting
[Prettier](https://prettier.io/) guarantees consistent formatting without time-intensive manual efforts.
On `npm install`, [Husky](https://github.com/typicode/husky) sets up a Git hook for you to automatically apply Prettier on every commit.
Staged files are identified by [lint-staged](https://github.com/okonet/lint-staged).
If the automatic formatting Hook fails, for example currently on Windows, please always manually run `npx prettier js -w --cache` before commiting.
If you use an IDE you may automate this by applying Prettier on save.

#### Linting
There should be no errors and as few warnings as possible.
Can be integrated into IDEs and editors like Atom.

- `npm run lint`
- Some errors can be fixed automatically via `npm run fix`.

#### Typechecking

SNIK Graph is written in TypeScript but Vite does not perform any type checking, which you can run manually with `npm run typecheck`.
This can help uncover some otherwise hard to find bugs.

### LogLevels
* `trace`: very verbose information for debugging
* `debug`: information for debugging
* `info`: generally useful information, not only for developers (default)
* `warn`: for problems that are recoverable
* `error`: for errors that shut down the application

### Internationalization (i18n)

We support English (full), German (mostly) and Persian (partly).
Feel free to contribute a PR with a new language by copying and adapting `js/lang/en.ts`, importing it in `js/lang/language.ts` and adding it to the `strings` constant there.

## Adaptation
If you like SNIK Graph and want to use it with different data, please open an issue.
If the website and the SPARQL endpoint are on different domains, you may need to [enable CORS in the SPARQL endpoint](http://vos.openlinksw.com/owiki/wiki/VOS/VirtTipsAndTricksCORsEnableSPARQLURLs).

## Citation information, meta data and archiving
If you want to cite SNIK Graph, please refer to our [publication in the Journal of Open Source Education (JOSE)](https://doi.org/10.21105/jose.00180).
Citation info and meta data is documented in CITATION.cff, which is also used by Zenodo to populate the metadata of the [Zenodo record](https://doi.org/10.5281/zenodo.11997333) for each SNIK Graph release.

## FAQ

### The devs told me a bug was fixed but it still occurs
Browsers may hold an old version of SNIK Graph in the cache.
Go to "Help" -> "About SNIK Graph" to see if you have the newest version and if not delete your browser cache.
If it still occurs, please update the issue if one already exists, if not please file an new issue using "Help" -> "Submit Feedback about the Visualization".

## License
SNIK Graph has a license with copyleft, the [GPLv3](LICENSE) for details.
We want to encourage reuse, modification, derivation and distribution as much as possible, so if that license is a problem for you please contact [Prof. Winter](https://www.people.imise.uni-leipzig.de/alfred.winter) and we try our best to find a solution.
