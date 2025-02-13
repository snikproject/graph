import { config } from "../config/config";
import { loadGraphFromSparql } from "../loadGraphFromSparql";
import { loadGraphFromJsonFile, loadLayoutFromJsonObject } from "./load";
import { Search } from "../search/search";
import * as layout from "../layout";
import * as sparql from "../utils/sparql";
import { progress } from "../animation/progress";
import log from "loglevel";
import { getElementById } from "../utils/htmlHelpers";
import { initHelp } from "../help";
import { addBenchmarkOverlay } from "./benchmark";
import { Graph } from "./graph";
import type { ViewJson } from "./save.ts";
import { View } from "./view";

interface Params {
	empty: boolean;
	benchmark: boolean;
	instances: boolean;
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
	const paramKeys = new Set(["empty", "benchmark", "instances", "virtual", "class", "json", "sparql", "graph", "sub"]);
	const unknown = new Set(Array.from(url.searchParams.keys())).difference(paramKeys);
	if (unknown.size > 0) {
		log.warn("Unknown GET parameters: " + Array.from(unknown).join(", "));
	}
	return Object.assign(defaults, {
		empty: parseFlag(url.searchParams.get("empty")),
		benchmark: parseFlag(url.searchParams.get("benchmark")),
		// load and show instances when loading from endpoint, not only classes
		...(url.searchParams.get("instances") && { instances: parseFlag(url.searchParams.get("instances")) }),
		virtual: parseFlag(url.searchParams.get("virtual")), // create "virtual triples" to visualize connections like domain-range
		class: url.searchParams.get("class"),
		json: url.searchParams.get("json"),
		...(url.searchParams.get("sparql") && { sparql: url.searchParams.get("sparql") }), // don't overwrite default with null
		graph: url.searchParams.get("graph"),
		sub: url.searchParams.get("sub"),
	});
}

/**
 * Apply parameters and load graph.
@param graph - the graph to apply the params to
@param params - parameter object */
async function applyParams(graph: Graph, params: Params): Promise<void> {
	try {
		if (params.benchmark) {
			addBenchmarkOverlay(graph.cy);
		}

		if (params.empty) {
			log.info(`Parameter "empty" detected. Skip loading and display file load prompt.`);
			const loadArea = document.getElementById("loadarea");
			const center = document.createElement("center");
			loadArea.appendChild(center);
			center.innerHTML += `<button id="load-button" style="font-size:10vh;margin-top:20vh">Datei Laden
      <input id="load-input" type="file" style="display:none"></input>
      </button>`;
			const loadInput = document.getElementById("load-input");
			const button = document.getElementById("load-button");
			button.onclick = () => {
				loadInput.click();
			};
			loadInput.addEventListener("change", (event) => {
				loadArea.removeChild(center);
				graph.cy.resize(); // fix mouse cursor position, see https://stackoverflow.com/questions/23461322/cytoscape-js-wrong-mouse-pointer-position-after-container-change
				loadGraphFromJsonFile(graph)(event);
			});
			return;
		}
		if (params.json) {
			log.info(`Loading from JSON URL ` + params.json);
			const json = await (await fetch(params.json)).json();
			graph.cy.add(json);
			layout.run(graph.cy, layout.eulerTight);
			return;
		}
		log.debug("Loading from SPARQL Endpoint " + params.sparql);
		config.ontology.sparql.endpoint = params.sparql;
		const graphs: string[] = [];
		if (config.ontology.snik) {
			// We can only load specific subgraphs of SNIK using the "sub" GET parameter.
			// Attention: This is different from the SNIK subontology filters, which use the Cytoscape node "source" data element to filter at runtime without reloading.
			let subs: string[] = params.sub?.split(",") || [];
			if (subs.length === 0) {
				// no override specified, use default SNIK values
				subs = [...config.ontology.snik.helperGraphs, ...config.ontology.snik.defaultSubOntologies];
			}
			graphs.push(...subs.map((g) => sparql.SNIK.PREFIX + g));
		} else if (params.graph) {
			graphs.push(params.graph);
			config.ontology.sparql.graph = params.graph;
		} else if (config.ontology.sparql.graph) {
			graphs.push(config.ontology.sparql.graph);
		}
		console.debug(`Loading graph with${params.instances ? "" : "out"} instances.`);
		{
			await loadGraphFromSparql(graph.cy, graphs, params.instances, params.virtual);
		}
		graph.instancesLoaded = params.instances;

		// hide "rdf:type"-edges
		Graph.setVisible(graph.cy.edges("[p='http://www.w3.org/1999/02/22-rdf-syntax-ns#type']"), false);
		if (config.ontology?.initialView) {
			const json: ViewJson = config.ontology.initialView;
			loadLayoutFromJsonObject(json, View.activeState().graph);
		}
		// This old code path is never run because we have an initial view with predefined positions for SNIK.
		// Keep it for now as a way to quickly visualize additions, such as the new bb2 subontology.
		// Can also be adapted to other graphs then SNIK and HITO that are too large to show at once initially without the effort of specifying initial layout positions.
		else if (config.ontology?.snik?.center) {
			await layout.runCached(graph.cy, layout.euler, config.ontology.snik.defaultSubOntologies, false); // todo: use the correct subs
			Graph.setVisible(graph.cy.elements(), false);
			// restrict visible nodes at start to improve performance and clarity
			const center = graph.cy.nodes(`node[id='${config.ontology.snik.center}']`);
			Graph.setVisible(center, true);
			for (let i = 0; i < config.ontology.snik.centerDepth; i++) {
				graph.showStarMultiplexed()(graph.cy.elements(":visible"));
			}
			await layout.run(graph.cy, layout.eulerTight);
			graph.cy.elements().unselect();
			graph.cy.center(center);
			graph.cy.fit(graph.cy.elements(":visible"));
			Graph.setVisible(center, true);
			graph.starMode = true;
		} else {
			await layout.run(graph.cy, layout.euler);
		}

		if (params.class) {
			log.info(`Parameter "class" detected. Centering on URI ${params.class}.`);
			// shouldn't be needed in theory due to the await in front of layout.run/runCached but is needed in practice
			setTimeout(() => graph.presentUri(params.class), 300);
		}
	} catch (e) {
		log.error(e);
		log.error("Error initializing SNIK Graph " + e);
	}
}

/** Fill the initial Graph based on the URL GET parameters.
@param graph - the initial graph */
export async function fillInitialGraph(graph: Graph): Promise<void> {
	// page title
	document.title = config.ontology.title ?? "Ontology Graph";

	// overlay legend
	document.getElementById("overlay-legend").innerHTML = config.ontology.legend;

	// GET parameters
	await progress(async () => {
		const params = parseParams();
		await applyParams(graph, params);
		new Search(getElementById("search") as HTMLFormElement);
		initHelp();
	});
	initHelp();
}
