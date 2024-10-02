import { config } from "../config/config";
import { loadGraphFromSparql } from "../loadGraphFromSparql";
import { loadGraphFromJsonFile, loadLayoutFromJsonObject } from "./load";
import { Menu } from "./menu";
import { Search } from "./search";
import * as layout from "../layout";
import * as sparql from "../sparql";
import { progress } from "./progress";
import log from "loglevel";
import * as util from "./util";
import { initHelp } from "../help";
import { addBenchmarkOverlay } from "./benchmark";
import { Graph } from "./graph";
import type { ViewJson } from "./save.ts";
import { View } from "./view";

interface Params {
	empty: boolean;
	clazz: string;
	jsonUrl: string;
	endpoint: string;
	instances: boolean;
	virtual: boolean;
	rdfGraph: string;
	sub: string;
	benchmark: boolean;
}

/** Parse browser URL POST parameters. */
function parseParams(): Params {
	const url = new URL(window.location.href);
	const defaults = {
		endpoint: config.ontology.sparql.endpoint,
		instances: config.ontology.sparql.instances,
	};
	return Object.assign(defaults, {
		empty: url.searchParams.get("empty") !== null,
		clazz: url.searchParams.get("class"),
		jsonUrl: url.searchParams.get("json"),
		...(url.searchParams.get("sparql") && { endpoint: url.searchParams.get("sparql") }), // don't overwrite default with null
		// load and show instances when loading from endpoint, not only class
		// specify either without value ...&instances or as ...&instances=true
		...(url.searchParams.get("instances") !== null && { instances: url.searchParams.get("instances") === "" || url.searchParams.get("instances") === "true" }),
		virtual: url.searchParams.get("virtual") !== null, // create "virtual triples" to visualize connections like domain-range
		rdfGraph: url.searchParams.get("graph"),
		sub: url.searchParams.get("sub"),
		benchmark: url.searchParams.get("benchmark") !== null,
	});
}

/**
 * Apply parameters.
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
		if (params.jsonUrl) {
			log.info(`Loading from JSON URL ` + params.jsonUrl);
			const json = await (await fetch(params.jsonUrl)).json();
			graph.cy.add(json);
			layout.run(graph.cy, layout.eulerTight);
			return;
		}
		log.debug("Loading from SPARQL Endpoint " + params.endpoint);
		config.ontology.sparql.endpoint = params.endpoint; // loadGraphFromSparql loads from config.ontology.sparql.endpoint
		const graphs: string[] = [];
		if (config.ontology.isSnik) {
			// We can only load specific subgraphs of SNIK using the "sub" GET parameter.
			// Attention: This is different from the SNIK subontology filters, which use the Cytoscape node "source" data element to filter at runtime without reloading.
			let subs: string[] = params.sub?.split(",") || [];
			if (subs.length === 0) {
				// no override specified, use default SNIK values
				subs = [...config.helperGraphs, ...config.defaultSubOntologies];
			}
			graphs.push(...subs.map((g) => sparql.SNIK.PREFIX + g));
		} else if (params.rdfGraph) {
			graphs.push(params.rdfGraph);
			config.ontology.sparql.graph = params.rdfGraph;
		} else if (config.ontology.sparql.graph) {
			graphs.push(config.ontology.sparql.graph);
		}
		console.debug(`Loading graph with${params.instances ? "" : "out"} instances.`);
		{
			await loadGraphFromSparql(graph.cy, graphs, params.instances, params.virtual);
		}
		graph.instancesLoaded = params.instances;
		// eslint-disable-next-line ban-ts-comment Needed to easily swap different config files, ts-expect-error not suitable when defined
		// @ts-ignore Needed to easily swap different config files, we handle it not existing here
		if (config.ontology?.initialView) {
			const json: ViewJson = {
				// eslint-disable-next-line ban-ts-comment Needed to easily swap different config files, ts-expect-error not suitable when defined
				// @ts-ignore Needed to easily swap different config files, we handle it not existing here
				version: config.ontology.initialView.version,
				// eslint-disable-next-line ban-ts-comment Needed to easily swap different config files, ts-expect-error not suitable when defined
				// @ts-ignore Needed to easily swap different config files, we handle it not existing here
				title: config.ontology.initialView.title,
				// eslint-disable-next-line ban-ts-comment Needed to easily swap different config files, ts-expect-error not suitable when defined
				// @ts-ignore Needed to easily swap different config files, we handle it not existing here
				type: config.ontology.initialView.type,
				// eslint-disable-next-line ban-ts-comment Needed to easily swap different config files, ts-expect-error not suitable when defined
				// @ts-ignore Needed to easily swap different config files, we handle it not existing here
				graph: config.ontology.initialView.graph,
			};
			loadLayoutFromJsonObject(json, View.activeState().graph);
		} else if (config.ontology.isSnik) {
			await layout.runCached(graph.cy, layout.euler, config.defaultSubOntologies, false); // todo: use the correct subs
			Graph.setVisible(graph.cy.elements(), false);
			// restrict visible nodes at start to improve performance
			// use default: star around bb:ChiefInformationOfficer
			const start = graph.cy.nodes("node[id='http://www.snik.eu/ontology/bb/ChiefInformationOfficer']");
			graph.showStar(start);
			await layout.run(graph.cy, layout.eulerTight);
			graph.cy.elements().unselect();
			graph.cy.center(start);
			graph.cy.fit(graph.cy.elements(":visible"));
			Graph.setVisible(start, true);
			graph.starMode = true;
		} else {
			await layout.run(graph.cy, layout.euler);
		}

		if (params.clazz) {
			log.info(`Parameter "class" detected. Centering on URI ${params.clazz}.`);
			// shouldn't be needed in theory due to the await in front of layout.run/runCached but is needed in practice
			setTimeout(() => graph.presentUri(params.clazz), 300);
		}
	} catch (e) {
		log.error(e);
		log.error("Error initializing SNIK Graph " + e);
	}
}

/** Fill the initial Graph based on the URL GET parameters.
@param graph - the initial graph */
export async function fillInitialGraph(graph: Graph): Promise<void> {
	await progress(async () => {
		const params = parseParams();
		await applyParams(graph, params);
		new Search(util.getElementById("search") as HTMLFormElement);
		initHelp();
	});
	initHelp();
}
