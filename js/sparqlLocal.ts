/** Local SPARQL engine backed by the SNIK ontology repository.
The public functions mirror the subset of {@link ./sparql} used by the application but return rows of RDF/JS terms. */
import type { NamedNode, Quad, Store } from "oxigraph/node.js";
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
const FROM = /\bFROM\s+(NAMED\s+)?<([^>]+)>/gi;

let storePromise: Promise<Store> | undefined;
let namedNode: (value: string) => NamedNode;
const loadedGraphs = new Map<string, Promise<void>>();
let logged = false;

/** Oxigraph ships separate browser and Node builds; Vite replaces `import.meta.env.SSR` at build time so only one is bundled. */
async function createStore(): Promise<Store> {
	if (import.meta.env.SSR) {
		const node = await import("oxigraph/node.js");
		namedNode = node.namedNode;
		return new node.Store();
	}
	const { default: init, Store, namedNode: makeNode } = await import("oxigraph/web.js");
	namedNode = makeNode;
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

/** Remove FROM clauses; they are passed to Oxigraph as dataset arguments instead. */
function withoutFrom(query: string): string {
	return query.replace(/\bFROM\s+NAMED\s+<[^>]+>/gi, "").replace(/\bFROM\s+<[^>]+>/gi, "");
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
		expand(graph).forEach((iri) => defaultGraphs.add(iri));
	}
	if (defaultGraphs.size === 0 && namedGraphs.size === 0) {
		GRAPHS.forEach((iri) => defaultGraphs.add(iri));
	}
	// A GRAPH pattern without FROM NAMED should still see the ontology graphs.
	if (namedGraphs.size === 0 && /\bGRAPH\b/i.test(query)) {
		GRAPHS.forEach((iri) => namedGraphs.add(iri));
	}
	await Promise.all([...defaultGraphs, ...namedGraphs].map(loadGraph));
	const store = await getStore();
	if (!logged) {
		log.info(`Loaded local RDF snapshot with ${store.size} quads.`);
		logged = true;
	}
	const result = store.query(withoutFrom(query), {
		default_graph: [...defaultGraphs].map(namedNode),
		use_default_graph_as_union: true,
		...(namedGraphs.size > 0 && { named_graphs: [...namedGraphs].map(namedNode) }),
	});
	if (!Array.isArray(result)) {
		throw new Error("Local SPARQL query did not return SELECT bindings.");
	}
	return result.map((row) => Object.fromEntries(row));
}

/** Describe a resource from the local snapshot as N-Triples, including incoming and outgoing triples. */
export async function localDescribe(uri: string): Promise<string> {
	await Promise.all(GRAPHS.map(loadGraph));
	const store = await getStore();
	const options = { default_graph: GRAPHS.map(namedNode), use_default_graph_as_union: true };
	const outgoing = store.query(`CONSTRUCT { <${uri}> ?p ?o } WHERE { <${uri}> ?p ?o }`, options);
	const incoming = store.query(`CONSTRUCT { ?s ?p <${uri}> } WHERE { ?s ?p <${uri}> }`, options);
	if (!Array.isArray(outgoing) || !Array.isArray(incoming)) {
		throw new Error("Local SPARQL describe did not return triples.");
	}
	return ([...outgoing, ...incoming] as Array<Quad>).map((quad) => `${quad.subject} ${quad.predicate} ${quad.object} .`).join("\n");
}
