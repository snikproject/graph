import { config } from "../config";
import { loadGraphFromSparql } from "../loadGraphFromSparql";
import { loadGraphFromJsonFile } from "./load";
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
		endpoint: config.sparql.endpoint,
		instances: config.sparql.instances,
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
		config.sparql.endpoint = params.endpoint; // loadGraphFromSparql loads from config.sparql.endpoint
		const graphs: string[] = [];
		if (config.sparql.isSnik) {
			let subs: string[] = [];
			if (params.sub) {
				subs = params.sub.split(",");
			}
			if (subs.length === 0) {
				// either not present or empty value
				subs = [...config.helperGraphs, ...config.defaultSubOntologies];
			}
			graphs.push(...subs.map((g) => sparql.SNIK.PREFIX + g));
		} else if (params.rdfGraph) {
			graphs.push(params.rdfGraph);
			config.sparql.graph = params.rdfGraph;
		}
		console.debug(`Loading graph with${params.instances ? "" : "out"} instances.`);
		{
			await loadGraphFromSparql(graph.cy, graphs, params.instances, params.virtual);
		}
		graph.instancesLoaded = params.instances;
		if (config.sparql.isSnik) {
			await layout.runCached(graph.cy, layout.euler, config.defaultSubOntologies, false); // todo: use the correct subs
			Graph.setVisible(graph.cy.elements(), false);
			// restrict visible nodes at start to improve performance
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
		graph.menu = new Menu();
		new Search(util.getElementById("search") as HTMLFormElement);
		initHelp();
	});
	initHelp();
}
