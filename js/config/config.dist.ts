/** Configuration template with default values.
Copy to js/config/config.ts after checkout and adapt to your preferences.
*/

import type { LogLevelDesc } from "loglevel";
import snikConf from "./config.snik";
//import hitoConf from "./config.hito";

export const config = {
	defaultSubOntologies: ["meta", "bb", "ob", "ciox", "he", "it4it", "bb2"],
	allSubOntologies: ["meta", "bb", "ob", "ciox", "he", "he-unconsolidated", "it4it", "bb2"],
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
	// Change this when you want to use a different ontology. Refer to ./config.snik.ts and ./config.hito.ts for examples.
	ontology: snikConf,
	multiview: {
		initialTabs: 1,
		warnOnSessionLoad: true,
	},
	git: {
		defaultIssueAssignee: "KonradHoeffner", // if you fork, please change
		issueLabels: {
			bug: "bug",
			confirmLink: "link",
			deleteTriple: "deletetriple",
			deleteClass: "deleteclass",
		},
		repo: {
			ontology: "https://github.com/snikproject/ontology",
			application: "https://github.com/snikproject/graph",
		},
	},
};
