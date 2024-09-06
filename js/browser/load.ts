/** Module for loading files both locally from the server and via upload from the client.*/
import { View } from "./view";
import type { ViewJson, Session } from "./save";
import { ViewJsonType } from "./save"; //eslint-disable-line no-duplicate-imports
import { config } from "../config/config";
import { fromJSON } from "./state";
import { VERSION } from "./util";
import log from "loglevel";
import { Graph } from "./graph";
import type { NodeCollection, NodeSingular, Position } from "cytoscape";

/**
Uploads a JSON file from the user.
@param event - a file input change event
@param callback - the code to execute */
function uploadJson(event: Event, callback: (_o: object) => any): void {
	const file = (event.target as HTMLInputElement).files[0];
	const reader = new FileReader();

	reader.onload = () => callback(JSON.parse(reader.result as string));
	reader.readAsText(file);
}
/**
 * Clear the graph and load the contents of the Cytoscape.js JSON file in it.
 * @param graph - the graph instance to load into
 * @param json - Cytoscape.js/Cytoscape JSON format graph object
 */
function loadGraphFromJson(graph: Graph, json): void {
	const cy = graph.cy;
	cy.elements().remove();
	cy.json(json);
	cy.elements().addClass("unfiltered");
	const visibleFraction = (1.0 * graph.cy.elements(":visible").size()) / graph.cy.elements().size();
	const starMode = visibleFraction < 0.8;
	log.debug("Load Graph from File: Visible fraction: " + visibleFraction + " set star mode to " + starMode);
	if (graph.cy.nodes(":child").size() > 0) {
		(document.getElementById("combineMatchModeBox") as any).checked = true;
	}
	graph.starMode = starMode;
	const visible = cy.nodes(":visible");
	cy.center(visible);
	cy.fit(visible);
	cy.elements().removeClass("highlighted");
	cy.elements().removeClass("source");
}

/**
Curried function.
Load a layouted graph from the JSON file specified by the given file input change event.
@param graph - the graph to load the file into
@returns a function that loads the graph from a file input change event
*/
export const loadGraphFromJsonFile = (graph: Graph) => (event: Event) => {
	uploadJson(event, (json) => {
		loadGraphFromJson(graph, json);
	});
};

/** Loads the contents of all views from a JSON file.
@param event - a file input change event
*/
export async function loadSessionFromJsonFile(event: Event): Promise<void> {
	if (config.multiview.warnOnSessionLoad && !confirm("This will override the current session. Continue?")) {
		return;
	}
	uploadJson(event, async (json: Session) => {
		// compare versions of file and package.json and warn if deprecated
		if (
			json.state.version !== VERSION &&
			!confirm(`Your file was saved in version ${json.state.version}, but SNIK Graph has version ${VERSION}, so it may not work properly. Continue anyway?`)
		) {
			return;
		}
		View.reset();
		const mainView = new View(false);
		const promises = [mainView.initialized];

		// First graph is an instance of Graph from graph.js; the second one is the graph attribute from the Cytoscape JSON format.
		loadGraphFromJson(mainView.state.graph, json.mainGraph.graph);
		View.activeView().setTitle(json.mainGraph.title);
		for (let i = 0; i < json.tabs.length; i++) {
			const view = new View(false);
			promises.push(view.initialized);
			loadGraphFromJson(view.state.graph, json.tabs[i].graph);
			View.activeView().setTitle(json.tabs[i].title);
		}
		await Promise.all(promises);
		fromJSON(json.state); // update changed values, keep existing values that don't exist in the save file
	});
}
/**
 * Checks prerequisites for loading a view or layout to avoid redundancy in the respective functions.
 * @param type - what format the input data should be in
 * @param json - the input data
 * @returns - version and type of input correct
 */
function checkVersion(type: ViewJsonType, json: any): boolean {
	let ok: boolean = true;
	if (
		json.version !== VERSION &&
		!confirm(`Your file was saved in version ${json.version}, but SNIK Graph has version ${VERSION}, so it may not work properly. Continue anyway?`)
	) {
		ok = false;
	} else if (json.type === undefined) {
		alert(`Unknown file format, aborting.`);
		ok = false;
	} else if (json.type !== type) {
		alert(`Your file was saved as ${json.type}, but you are trying to load a ${type}, aborting.`);
		ok = false;
	}
	return ok;
}

/** Loads a stored view from a JSON file.
@param event - a file input change event */
export function loadView(event: Event): void {
	uploadJson(event, (json: ViewJson) => {
		// compare versions of file and package.json and warn if deprecated
		if (!checkVersion(ViewJsonType.VIEW, json)) {
			return;
		}

		const view = new View(false);
		loadGraphFromJson(view.state.graph, json.graph);
		View.activeView().setTitle(json.title);
	});
}

export function loadLayoutFromJsonObject(json: ViewJson, graph: Graph) {
	// compare versions of file and package.json and warn if deprecated
	if (!checkVersion(ViewJsonType.LAYOUT, json)) {
		return;
	}
	const cy = graph.cy;

	// Calling the existing presetLayout function would be much shorter then all the code below but takes 50% longer due to the large amount of nodes that are processed unnecessarily.
	// presetLayout() also does not hide nodes and displays warnings when the coverage is below a high treshold, so we reimplement a preset layout here optimized for a small amount of nodes.
	// layout.presetLayout(cy,json.graph);
	cy.batch(() => {
		const nodes: NodeCollection = cy.collection();
		nodes.merge(
			//@ts-expect-error compiler doesnt know JSON objects
			json.graph.flatMap((jsonNode: Array<any>) => {
				const position: Position = {
					x: jsonNode[1].x,
					y: jsonNode[1].y,
				};
				const cytoNode: NodeSingular = cy.nodes("node[id='" + jsonNode[0] + "']").first();
				cytoNode.unlock();
				cytoNode.position(position);
				//cytoNode.lock();

				return cytoNode;
			})
		);
		// hide all nodes and edges except the nodes (and edges between them) included in the file
		const toHide: NodeCollection = cy.nodes().unmerge(nodes);
		// workaround for https://github.com/snikproject/graph/issues/426 caused by https://github.com/cytoscape/cytoscape.js-euler/issues/24
		// Separate the position of the hidden nodes for later unhiding because some layouts may freeze the browser if all are positioned at the same coordinate.
		// On an Intel i9 12900k there seems to be no difference in Network "finish" time (around 1 second).
		// Without this workaround, CTRL+ALT+R and then tight layout may freeze the browser.
		toHide.forEach((node, i) => {
			node.position({ x: (1 + (i % 20)) * 100, y: i * 2 });
		});
		const elements = nodes.union(nodes.edges());
		Graph.setVisible(elements, true);
		Graph.setVisible(toHide, false);
		cy.elements().unselect();
		cy.center(nodes);
		cy.fit(nodes);
		console.log("Loaded %d visible nodes into the graph. Hid %d nodes.", nodes.size(), toHide.size());
	});
	// todo: fit view to visible elements, not make it so far away
	// todo: check performance
	// todo: make it working when manually loading a file, not only on init
}

/** Loads a stored layout from a JSON file.
@param event - a file input change event */
export function loadLayout(event: Event): void {
	console.groupCollapsed("Loading JSON Layout file into View.");
	uploadJson(event, (json: ViewJson) => {
		const view: View = new View(true, json.title);
		loadLayoutFromJsonObject(json, view.state.graph);
	});
	console.info("Finished loading layout from file.");
	console.groupEnd();
}

/**
Add an upload entry to the file menu.
@param parent - the parent element of the menu
@param i18n - internationalization key
@param description - the text of the menu item
@param func - the function to be executed when the user clicks on the menu entry
@param as - the file menu in the form of anchor elements that get styled by CSS
//param optionsFromJson a function that loads session options, such as whether day mode is activated
*/
function addLoadEntry(parent: Element, i18n: string, description: string, func: EventListener, as: Array<HTMLAnchorElement>): void {
	const a = document.createElement("a");
	as.push(a);
	a.classList.add("dropdown-entry");
	a.setAttribute("tabindex", "-1");
	parent.appendChild(a);
	const input = document.createElement("input");
	input.type = "file";
	input.style.display = "none";
	a.appendChild(input);
	const inner = document.createElement("span");
	inner.innerText = description;
	inner.setAttribute("data-i18n", i18n);
	a.appendChild(inner);
	// click event needs to trigger at the hidden input element so that it opens the file chooser dialog
	a.addEventListener("click", () => input.click());
	// completed file chooser dialog triggers change event
	input.addEventListener("change", func);
	// TODO: use optionsFromJson
}

/**
Add upload entries to the file menu.
Cannot use the simpler default menu creation method because file upload only works with an input.
@param graph - the graph instance to load into
@param parent - the parent element of the menu
@param as - the file menu in the form of anchor elements that get styled by CSS */
export function addFileLoadEntries(graph: Graph, parent: HTMLElement, as: Array<HTMLAnchorElement>): void {
	addLoadEntry(parent, "load-view", "Load Partial Graph into Session", loadView, as);
	addLoadEntry(parent, "load-layout", "Load Layout of Partial Graph into Session", loadLayout, as);
	addLoadEntry(parent, "load-session", "Load Session", loadSessionFromJsonFile, as);
}
