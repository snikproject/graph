/** Configuration template with default values.
Copy to js/config.ts after checkout and adapt to your preferences.
*/

import type { LogLevelDesc } from "loglevel";

export const config = {
	defaultSubOntologies: ["meta", "bb", "ob", "ciox", "he", "it4it"],
	allSubOntologies: ["meta", "bb", "ob", "ciox", "he", "he-unconsolidated", "it4it"],
	loadJsonLayoutAsInitialView: true, // ViewJson of type ViewJsonType.LAYOUT located in js/initialLayout.json
	color: new Map([
		["ciox", "rgb(80,255,250)"],
		["meta", "rgb(255,80,80)"],
		["ob", "rgb(255,173,30)"],
		["bb", "rgb(30,152,255)"],
		["he", "rgb(150,255,120)"],
		["it", "rgb(204, 0, 204)"],
		["it4it", "rgb(255, 255, 0)"],
	]),
	nodeSize: 39,
	helperGraphs: ["limes-exact", "match"],
	activeOptions: ["edgecolor"], // initially active options, choose a subset of: ["dev", "ext","day", "edgecolor"]
	searchCloseMatch: true, // true is rejected because of the high estimated time by the SPARQL endpoint because of too many optional clauses
	// only used for mobile, desktop will always use cxttapstart
	logLevelConsole: "debug" as LogLevelDesc,
	logLevelDisplay: "info" as LogLevelDesc,
	logLevelMemory: "debug" as LogLevelDesc,
	layoutCacheMinRecall: 0.95,
	layoutCacheMinPrecision: 0.5,
	language: "en",
	download: {
		image: {
			max: { width: 5000, height: 4000 },
			standard: { width: 1920, height: 1920 },
		},
	},
	sparql: {
		endpoint: "https://www.snik.eu/sparql",
		graph: "http://www.snik.eu/ontology",
		// the file containing the information on which node to use which shape on.
		// SNIK and HITO options contained in this repository, directory "js/browser/datasource/(snik|hito).ts"
		coloringConfigurationFile: "js/browser/datasource/snik.ts",
		instances: false,
		isSnik: true,
		// How to identify relations to display
		// A SPARQL query is run:
		// (a) ... { ?c ?r ?d } { ?c a owl:Class } { ?d a owl:Class }
		// (b) ... { ?c ?r ?d } { ?c xx:someIdVal ?x } { ?d xx:someIdVal ?y }
		// Either value "owl:class" for option (a) or an id (e.g. "hito:internalId" or "https://hitontology.eu/ontology/internalId") for option (b)
		// For SNIK and probably many others (like DBPedia), this should be "a owl:Class". For HITO this should be "hito:internalId".
		classId: "a owl:Class",
	},
	multiview: {
		initialTabs: 1,
		warnOnSessionLoad: true,
	},
	git: {
		defaultIssueAssignee: "KonradHoeffner", // if you fork, please change
		issueLabels: {
			confirmLink: "link",
			editNode: "",
			editEdge: "",
			deleteEdge: "deletetripel",
			deleteNode: "deleteclass",
		},
		repo: {
			ontology: "https://github.com/snikproject/ontology",
			application: "https://github.com/snikproject/graph",
		},
	},
};
