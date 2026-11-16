/** Manages browser URL GET parameters.*/
import { config } from "../config/config";
import log from "loglevel";

export interface Params {
	empty: boolean;
	benchmark: boolean;
	instances: boolean;
	gpu: boolean;
	virtual: boolean;
	class: string;
	json: string;
	sparql: string;
	graph: string;
	sub: string;
}

/** A flag is a GET parameter with a boolean value.
Allow setting a flag without a value, for example <https://www.snik.eu/graph?instances>.
In this case the empty string is returned, see <https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/get>.
The alternative is <https://www.snik.eu/graph?instances=true> but all other values are treated as false.
This is needed in case one wants to override a flag that is active by default through the configuration. */
function parseFlag(f: string): boolean {
	return f === "" || f === "true";
}

/** Parse browser URL GET parameters.
 * The sparql and instances defaults are getters so that they are read lazily,
 * after loadConfigJson has merged config.json into the configuration. */
function parseParams(): Params {
	const url = new URL(window.location.href);
	// TypeScript interfaces don't exist on runtime, keep in sync with Params interface.
	const paramKeys = new Set(["empty", "benchmark", "instances", "virtual", "class", "json", "sparql", "graph", "sub", "gpu"]);
	const unknown = new Set(Array.from(url.searchParams.keys())).difference(paramKeys);
	if (unknown.size > 0) {
		log.warn("Unknown GET parameters: " + Array.from(unknown).join(", "));
	}
	return {
		get sparql(): string {
			return url.searchParams.get("sparql") || config.ontology.sparql.endpoint; // don't overwrite default with null
		},
		// load and show instances when loading from endpoint, not only classes
		get instances(): boolean {
			return url.searchParams.get("instances") ? parseFlag(url.searchParams.get("instances") as string) : config.ontology.sparql.instances;
		},
		empty: parseFlag(url.searchParams.get("empty")),
		benchmark: parseFlag(url.searchParams.get("benchmark")),
		gpu: parseFlag(url.searchParams.get("gpu")),
		virtual: parseFlag(url.searchParams.get("virtual")), // create "virtual triples" to visualize connections like domain-range
		class: url.searchParams.get("class"),
		json: url.searchParams.get("json"),
		graph: url.searchParams.get("graph"),
		sub: url.searchParams.get("sub"),
	};
}

export const params = parseParams();
