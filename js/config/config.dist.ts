/** Configuration template with default values.
Copy to js/config/config.ts after checkout and adapt to your preferences.
*/

import type { LogLevelDesc } from "loglevel";
import ontologyConf from "./config.snik";
//import ontologyConf from "./config.hito";

export const config = {
	nodeSize: 39,
	activeOptions: ["edgecolor"], // initially active options, choose a subset of: ["showproperty", "day", "edgecolor"]
	searchCloseMatch: true,
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
	ontology: ontologyConf,
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
