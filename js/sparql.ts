/** Functions for querying the SNIK SPARQL endpoint. */
import { config } from "./config/config";
import log from "loglevel";

export const SNIK = {
	GRAPH_BB: "http://www.snik.eu/ontology/bb",
	PREFIX: "http://www.snik.eu/ontology/", //problem: different prefixes for different partial ontologie,
};

const TIMEOUT = 30_000; // milliseconds

/** Whether queries are answered by the local RDF snapshot instead of the remote endpoint. */
export function useLocal(): boolean {
	return config.ontology.sparql.local;
}

/** Fetch a SPARQL URL, failing on timeouts and HTTP errors. */
async function sparqlFetch(url: string): Promise<Response> {
	const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
	if (!response.ok) {
		throw new Error(`SPARQL endpoint returned HTTP status ${response.status} ${response.statusText}.`);
	}
	return response;
}

//ASK queries should also work but better use {@link ask} instead as it is more convenient. // ask does not exist anymore
/** Query public SNIK SPARQL endpoint with a SELECT query.
Throws an error if the endpoint cannot be reached, the response has an error status code or the response is not valid SPARQL JSON.
@param query - A valid SPARQL query.
@param graph - An optional SPARQL graph.
@param endpoint - An optional SPARQL endpoint. May override FROM statements.
@returns A promise of a set of SPARQL select result bindings.
*/
export async function select(query: string, graph?: string, endpoint: string = config.ontology.sparql.endpoint): Promise<Array<object>> {
	if (useLocal()) {
		try {
			const { localSelect } = await import("./sparqlLocal");
			return await localSelect(query, graph);
		} catch (err) {
			log.warn("Local RDF query failed, falling back to the SPARQL endpoint.", err);
			config.ontology.sparql.local = false;
		}
	}
	const browser = typeof window !== "undefined";
	let url = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
	if (graph) {
		url += "&default-graph-uri=" + encodeURIComponent(graph);
	}
	try {
		const json = await (await sparqlFetch(url)).json();
		const bindings: Array<object> = json.results?.bindings;
		if (!bindings) {
			throw new Error("SPARQL endpoint returned a response without result bindings.");
		}
		if (browser) {
			console.groupCollapsed("SPARQL " + query.split("\n", 1)[0] + "...");
		}
		//is never entered on our data with limitation to 99
		if (browser && bindings.length < 100) {
			console.table(
				bindings.map((b) =>
					Object.keys(b).reduce((result, key) => {
						result[key] = b[key].value;
						return result;
					}, {})
				)
			);
		}
		log.debug(query);
		log.debug(url);
		if (browser) {
			console.groupEnd();
		}
		return bindings;
	} catch (err) {
		log.error(`Error executing SPARQL query:\n${query}\nURL: ${url}\n${err}`);
		throw err;
	}
}

/** Query the public SNIK SPARQL endpoint with a describe query, which describes a single resource.
@param uri - A resource URI
@param graphOpt - An optional SPARQL graph.
@returns A promise of the SPARQL describe result as text.
*/
export async function describe(uri: string, graphOpt?: string): Promise<string> {
	if (useLocal()) {
		try {
			const { localDescribe } = await import("./sparqlLocal");
			return await localDescribe(uri);
		} catch (err) {
			log.warn("Local RDF describe failed, falling back to the SPARQL endpoint.", err);
			config.ontology.sparql.local = false;
		}
	}
	const query = "describe <" + uri + ">";
	const url =
		config.ontology.sparql.endpoint +
		"?query=" +
		encodeURIComponent(query) +
		"&format=text" +
		(graphOpt ? "&default-graph-uri=" + encodeURIComponent(graphOpt) : "");

	try {
		return await (await sparqlFetch(url)).text();
	} catch (err) {
		throw new Error(`Error executing SPARQL query ${query}: ${err}`);
	}
}
