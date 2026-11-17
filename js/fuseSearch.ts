/** Fuzzy search with fuse.js.*/
import * as sparql from "./sparql";
import { SPARQL_PREFIXES } from "./sparqlPrefixes";
import { config } from "./config/config";
import Fuse, { type FuseResult, type IFuseOptions } from "fuse.js";
import log from "loglevel";
import { timer } from "./timer";

export interface Item {
	uri: string;
	l: Array<string>;
	def?: string;
}
let index: Fuse<Item> = null;

const options: IFuseOptions<Item> = {
	shouldSort: true,
	// gives too loose matches
	//useTokenSearch: true,
	//tokenMatch: 'all',
	threshold: 0.25,
	minMatchCharLength: 3,
	location: 0,
	ignoreLocation: true,
	distance: 100,
	keys: [
		{ name: "l", weight: 0.7 },
		{ name: "def", weight: 0.3 },
	],
};

interface IndexBinding {
	uri: { value: string };
	l: { value: string };
	def?: { value: string };
}

interface IndexRow {
	c: { value: string };
	l?: { value: string };
	def?: { value: string };
}

/** Merge separate label, alias, close-match and definition queries into the shape of the old aggregate query. */
function mergeIndexRows(rows: Array<Array<IndexRow>>, definitions: Array<IndexRow>): Array<IndexBinding> {
	const map = new Map<string, { l: Set<string>; def?: string }>();
	for (const row of rows.flat()) {
		const item = map.get(row.c.value) ?? { l: new Set<string>() };
		map.set(row.c.value, item);
		if (row.l) {
			item.l.add(row.l.value);
		}
	}
	for (const row of definitions) {
		const item = map.get(row.c.value);
		if (item && row.def) {
			item.def ??= row.def.value;
		}
	}
	return [...map].map(([uri, item]) => ({ uri: { value: uri }, l: { value: [...item.l].join("|") }, ...(item.def && { def: { value: item.def } }) }));
}

/** Local Oxigraph plans the UNION of class and instance labels very poorly, so ask for each part separately. */
async function localIndexBindings(): Promise<Array<IndexBinding>> {
	const from = `FROM <${config.ontology.sparql.graph}>`;
	const rows = (await Promise.all([
		sparql.select(`${SPARQL_PREFIXES} SELECT ?c ?l ${from} { ?c a owl:Class; rdfs:label ?l. }`),
		sparql.select(`${SPARQL_PREFIXES} SELECT ?c ?l ${from} { ?c a ?t. ?t a owl:Class. ?c rdfs:label ?l. }`),
		sparql.select(`${SPARQL_PREFIXES} SELECT ?c ?l ${from} { ?c skos:altLabel ?l. }`),
		config.searchCloseMatch
			? sparql.select(`${SPARQL_PREFIXES} SELECT ?c ?l ${from} { ?c skos:closeMatch|^skos:closeMatch ?cm. ?cm rdfs:label|skos:altLabel ?l. }`)
			: [],
		sparql.select(`${SPARQL_PREFIXES} SELECT ?c ?def ${from} { ?c skos:definition ?def. }`),
	])) as Array<Array<IndexRow>>;
	return mergeIndexRows(rows.slice(0, 4), rows[4]);
}

/** Create fulltext index from SPARQL endpoint.
@returns the index items for testing*/
export async function createIndex(): Promise<Array<object>> {
	if (typeof window !== "undefined") {
		console.groupCollapsed("Create Fuse.js index");
	}
	const indexTimer = timer("Create Fuse search index");
	log.debug("Create Fuse Search Index with searchCloseMatch = " + config.searchCloseMatch);
	const sparqlQuery = `${SPARQL_PREFIXES}
  select
  (?c as ?uri)
  (group_concat(distinct(str(?l));separator="|") as ?l)
  (group_concat(distinct(str(?def));separator="|") as ?def)
  from <${config.ontology.sparql.graph}>
  {
    {
     {?c a owl:Class.} UNION {?c a [a owl:Class]}
     ?c rdfs:label ?l.
    }
    UNION {?c skos:altLabel ?l.}
    ${config.searchCloseMatch ? "UNION {?c skos:closeMatch|^skos:closeMatch ?cm. ?cm rdfs:label|skos:altLabel ?l.}" : ""}
    OPTIONAL {?c skos:definition ?def.}
  }
  GROUP BY ?c`;
	const bindings = (sparql.useLocal() ? await localIndexBindings() : await sparql.select(sparqlQuery)) as Array<IndexBinding>;
	const items: Array<Item> = [];
	for (const b of bindings) {
		const suffix = b.uri.value.replace(/.*\//, "");
		const item: Item = {
			uri: b.uri.value,
			l: [...b.l.value.split("|"), suffix],
		};
		items.push(item);
		item.l = [...new Set(item.l)]; // remove duplicates

		if (b.def?.value) {
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
		try {
			await createIndex();
		} catch {
			return []; // select() already logged the error, retry on the next search
		}
	}
	const result = index.search(userQuery);
	return result;
}
