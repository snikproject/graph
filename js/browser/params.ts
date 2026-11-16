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

/** Parse browser URL GET parameters. */
function parseParams(): Params {
	const url = new URL(window.location.href);
	const defaults = {
		sparql: config.ontology.sparql.endpoint,
		instances: config.ontology.sparql.instances,
	};
	// TypeScript interfaces don't exist on runtime, keep in sync with Params interface.
	const paramKeys = new Set(["empty", "benchmark", "instances", "virtual", "class", "json", "sparql", "graph", "sub", "gpu"]);
	const unknown = new Set(Array.from(url.searchParams.keys())).difference(paramKeys);
	if (unknown.size > 0) {
		log.warn("Unknown GET parameters: " + Array.from(unknown).join(", "));
	}
	return Object.assign(defaults, {
		empty: parseFlag(url.searchParams.get("empty")),
		benchmark: parseFlag(url.searchParams.get("benchmark")),
		// load and show instances when loading from endpoint, not only classes
		...(url.searchParams.get("instances") && { instances: parseFlag(url.searchParams.get("instances")) }),
		gpu: parseFlag(url.searchParams.get("gpu")),
		virtual: parseFlag(url.searchParams.get("virtual")), // create "virtual triples" to visualize connections like domain-range
		class: url.searchParams.get("class"),
		json: url.searchParams.get("json"),
		...(url.searchParams.get("sparql") && { sparql: url.searchParams.get("sparql") }), // don't overwrite default with null
		graph: url.searchParams.get("graph"),
		sub: url.searchParams.get("sub"),
	});
}

export const params = parseParams();
