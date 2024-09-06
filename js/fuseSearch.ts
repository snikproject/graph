/** Fuzzy search with fuse.js.*/
import * as sparql from "./sparql";
import { config } from "./config";
import Fuse, { type FuseResult } from "fuse.js";
import log from "loglevel";
import { timer } from "./timer";

export interface Item {
	uri: string;
	l: Array<string>;
	def?: string;
}
let index: Fuse<Item> = null;

const options = {
	shouldSort: true,
	tokenize: true,
	threshold: 0.25,
	maxPatternLength: 40,
	minMatchCharLength: 3,
	matchAllTokens: true,
	location: 0,
	ignoreLocation: true,
	distance: 100,
	id: "uri",
	keys: [
		{ name: "l", weight: 0.7 },
		{ name: "def", weight: 0.3 },
	],
};

interface IndexBinding {
	uri: { value: string };
	l: { value: string };
	def: { value: string };
}

/** Create fulltext index from SPARQL endpoint.
@returns the index items for testing*/
export async function createIndex(): Promise<Array<object>> {
	if (typeof window !== "undefined") {
		console.groupCollapsed("Create Fuse.js index");
	}
	const indexTimer = timer("Create Fuse search index");
	log.debug("Create Fuse Search Index with searchCloseMatch = " + config.searchCloseMatch);
	const sparqlQuery = `select
  ?c as ?uri
  group_concat(distinct(str(?l));separator="|") as ?l
  group_concat(distinct(str(?def));separator="|") as ?def
  from <${config.ontology.sparql.graph}>
  {
    {
     {?c a owl:Class.} UNION {?c a [a owl:Class]}
     ?c rdfs:label ?l.
    }
    UNION {?c skos:altLabel ?l.}
    ${config.searchCloseMatch ? "UNION {?c skos:closeMatch|^skos:closeMatch ?cm. ?cm rdfs:label|skos:altLabel ?l.}" : ""}
    OPTIONAL {?c skos:definition ?def.}
  }`;
	const bindings = (await sparql.select(sparqlQuery)) as Array<IndexBinding>;
	const items: Array<Item> = [];
	for (const b of bindings) {
		const suffix = b.uri.value.replace(/.*\//, "");
		const item: Item = {
			uri: b.uri.value,
			l: [...b.l.value.split("|"), suffix],
		};
		items.push(item);
		item.l = [...new Set(item.l)]; // remove duplicates

		if (b.def.value) {
			item.def = b.def.value;
		}
	}
	index = new Fuse(items, options);
	indexTimer.stop(items.length + " items");
	if (typeof window !== "undefined") {
		console.groupEnd();
	}
	return items; // for testing
}

/** Searches the Fuse index for resources with a similar label.
@param userQuery - search query as given by a user
@returns the class URIs found.
*/
export async function search(userQuery: string): Promise<Array<FuseResult<Item>>> {
	if (!index) {
		await createIndex();
	}
	const result = index.search(userQuery);
	return result;
}
