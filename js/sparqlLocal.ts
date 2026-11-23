/** Local SPARQL engine backed by the SNIK ontology repository.
The public functions mirror the subset of {@link ./sparql} used by the application but return SPARQL JSON bindings. */
import init, { Store, namedNode } from "oxigraph/web.js";
import wasmUrl from "oxigraph/web_bg.wasm?url";
import log from "loglevel";

const PREFIX = "http://www.snik.eu/ontology/";
/** Ontology file base; override with SPARQL_ONTOLOGY_BASE for a local mirror. */
const BASE = (import.meta.env.SPARQL_ONTOLOGY_BASE || "https://raw.githubusercontent.com/snikproject/ontology/master/").replace(/\/?$/, "/");
const FILES = [
	{ file: "meta.ttl", graph: "meta", format: "text/turtle" },
	{ file: "bb.ttl", graph: "bb", format: "text/turtle" },
	{ file: "ob.ttl", graph: "ob", format: "text/turtle" },
	{ file: "ciox.ttl", graph: "ciox", format: "text/turtle" },
	{ file: "he.ttl", graph: "he", format: "text/turtle" },
	{ file: "it4it.ttl", graph: "it4it", format: "text/turtle" },
	{ file: "bb2.ttl", graph: "bb2", format: "text/turtle" },
	{ file: "limes.nt", graph: "limes-exact", format: "application/n-triples" },
	{ file: "match.nt", graph: "match", format: "application/n-triples" },
].map((file) => ({ ...file, url: BASE + file.file }));
const GRAPHS = FILES.map((file) => PREFIX + file.graph);
const FILE_BY_GRAPH = new Map(FILES.map((file) => [PREFIX + file.graph, file]));
const PREFIXES = {
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	rdfs: "http://www.w3.org/2000/01/rdf-schema#",
	owl: "http://www.w3.org/2002/07/owl#",
	skos: "http://www.w3.org/2004/02/skos/core#",
	xsd: "http://www.w3.org/2001/XMLSchema#",
	meta: PREFIX + "meta/",
	sniko: PREFIX,
};
const FROM = /\bFROM\s+(NAMED\s+)?<([^>]+)>/gi;

let storePromise: Promise<Store> | undefined;
const loadedGraphs = new Map<string, Promise<void>>();
let logged = false;

async function createStore(): Promise<Store> {
	await init({ module_or_path: wasmUrl });
	return new Store();
}

function getStore(): Promise<Store> {
	storePromise ??= createStore().catch((error) => {
		storePromise = undefined; // allow a later retry, e.g. after a transient network error
		throw error;
	});
	return storePromise;
}

/** Load an ontology graph on first use. Concurrent queries share the same promise. */
function loadGraph(iri: string): Promise<void> {
	const file = FILE_BY_GRAPH.get(iri);
	if (!file) {
		return Promise.resolve();
	}
	let promise = loadedGraphs.get(iri);
	if (!promise) {
		promise = (async () => {
			const response = await fetch(file.url);
			if (!response.ok) {
				throw new Error(`Could not load ontology file ${file.url}: HTTP ${response.status}.`);
			}
			(await getStore()).load(await response.text(), { format: file.format, to_graph_name: namedNode(iri) });
			log.debug(`Loaded local RDF graph ${iri}.`);
		})().catch((error) => {
			loadedGraphs.delete(iri); // allow a later retry, e.g. after a transient network error
			throw error;
		});
		loadedGraphs.set(iri, promise);
	}
	return promise;
}

/** Expand a graph IRI from a FROM clause to the ontology named graphs. */
function expand(iri: string): Array<string> {
	const matches = GRAPHS.filter((graph) => graph === iri || graph.startsWith(iri + "/") || iri === PREFIX);
	return matches.length > 0 ? matches : [iri];
}

/** Add missing prefixes and rewrite the Virtuoso-specific `DISTINCT(?var)` syntax. */
function normalize(query: string): string {
	const declared = new Set([...query.matchAll(/\bPREFIX\s+([\w-]+):/gi)].map((match) => match[1].toLowerCase()));
	const prefix = Object.entries(PREFIXES)
		.filter(([name]) => !declared.has(name))
		.map(([name, iri]) => `PREFIX ${name}: <${iri}>`)
		.join("\n");
	const queryWithoutFrom = query.replace(/\bFROM\s+NAMED\s+<[^>]+>/gi, "").replace(/\bFROM\s+<[^>]+>/gi, "");
	return `${prefix}\n${queryWithoutFrom}`.replace(/\bSELECT\s+DISTINCT\s*\((\?\w+)\)/gi, "SELECT DISTINCT $1");
}

/** Convert an RDF/JS term to the SPARQL JSON binding shape expected by the application. */
function binding(term): object {
	if (term.termType === "Literal") {
		const result: Record<string, string> = { type: term.language ? "literal" : "typed-literal", value: term.value };
		if (term.language) {
			result["xml:lang"] = term.language;
		}
		if (term.datatype?.value && term.datatype.value !== "http://www.w3.org/2001/XMLSchema#string") {
			result.datatype = term.datatype.value;
		}
		return result;
	}
	return { type: term.termType === "NamedNode" ? "uri" : "bnode", value: term.value };
}

/** Execute a SELECT query against the ontology snapshot. */
export async function localSelect(query: string, graph?: string): Promise<Array<object>> {
	const defaultGraphs = new Set<string>();
	const namedGraphs = new Set<string>();
	for (const [, named, iri] of query.matchAll(FROM)) {
		for (const expanded of expand(iri)) {
			(named ? namedGraphs : defaultGraphs).add(expanded);
		}
	}
	if (graph) {
		defaultGraphs.add(graph);
	}
	if (defaultGraphs.size === 0 && namedGraphs.size === 0) {
		GRAPHS.forEach((iri) => defaultGraphs.add(iri));
	}
	await Promise.all([...defaultGraphs, ...namedGraphs].map(loadGraph));
	const store = await getStore();
	if (!logged) {
		log.info(`Loaded local RDF snapshot with ${store.size} quads.`);
		logged = true;
	}
	const result = store.query(normalize(query), {
		default_graph: [...defaultGraphs].map(namedNode),
		use_default_graph_as_union: true,
		...(namedGraphs.size > 0 && { named_graphs: [...namedGraphs].map(namedNode) }),
	});
	if (!Array.isArray(result)) {
		throw new Error("Local SPARQL query did not return SELECT bindings.");
	}
	return result.map((row) => Object.fromEntries([...row].map(([name, term]) => [name, binding(term)])));
}
