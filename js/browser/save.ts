/** Lets the user save files generated from the loaded graph. */
import type { ViewJson, Session } from "./interface";
import { config } from "../config";
import { toJSON } from "./state";
import { View, type State } from "./view";
import { VERSION } from "./util";
import type { Graph } from "./graph";
import log from "loglevel";
import c from "cytoscape";
import svg from "cytoscape-svg";
c.use(svg);

const a = document.createElement("a"); // reused for all saving, not visible to the user
document.body.appendChild(a);
a.style.display = "none";

/**
Create a JSON file out of a JSON data string and lets the user save it.
Based on https://stackoverflow.com/questions/19327749/javascript-blob-fileName-without-link
@param data - a JSON object
@param fileName - the name of the saved file
*/
export function saveJson(data: object, fileName: string): void {
	const json = JSON.stringify(data); // unprettified variant
	const blob = new Blob([json], { type: "application/json" });
	const url = window.URL.createObjectURL(blob);
	a.href = url;
	a.download = fileName;
	a.click();
	window.URL.revokeObjectURL(url);
	log.debug("JSON File saved: " + fileName);
}

/**
Lets the user save a file.
Based on https://stackoverflow.com/questions/19327749/javascript-blob-fileName-without-link
@param url - a URL that resolves to a file
@param fileName - the name of the saved file
*/
export function saveUrl(url: string, fileName: string): void {
	a.href = url;
	a.download = fileName;
	a.click();
	window.URL.revokeObjectURL(url);
	log.debug("File saved: " + fileName);
}

/** Saves the whole layouted graph as a Cytoscape JSON file.
 *  @param graph - the graph to save */
export function saveGraph(graph): void {
	const json = graph.cy.json();
	delete json.style; // the style gets corrupted on export due to including functions, the default style will be used instead
	saveJson(json, "snik.json");
}

export interface TabContent {
	title: string;
	/** Cytoscape.js graph as JSON */
	graph: any;
}

/** Saves the contents of all views as a custom JSON file. */
export function saveSession(options): void {
	const mainGraph = {
		title: View.mainView.state.title,
		graph: View.mainView.state.cy.json(),
		options,
	};
	delete mainGraph.graph.style; // the style gets corrupted on export due to including functions, the default style will be used instead

	const session: Session = { tabs: [], state: toJSON(), mainGraph };

	for (const view of View.partViews) {
		const tabContent = {
			title: view.state.title,
			graph: view.state.cy.json() as { style },
		};
		delete tabContent.graph.style; // the style gets corrupted on export due to including functions, the default style will be used instead
		session.tabs.push(tabContent);
	}
	saveJson(session, "snik-session.json");
}

/** Saves the contents of the current view as a custom JSON file.
 *  @param state - a GoldenLayout view state */
export function saveView(state: State): void {
	const json: ViewJson = {
		version: VERSION,
		title: state.title,
		graph: state.cy.json(),
	};
	//@ts-expect-error compiler doesnt know graph.style
	delete json.graph.style; // the style gets corrupted on export due to including functions, the default style will be used instead
	saveJson(json, "snik-view.json");
}

/**
Save the graph as a PNG (lossless compression).
@param graph - the graph to save as PNG
@param dayMode - whether day mode is active
@param full - Iff true, include the whole graph, otherwise only include what is inside the canvas boundaries.
@param highRes - Iff true, generate a high resolution picture using the maximum width and height from config.js.
Otherwise, either use the native resolution of the canvas (full=false) or the standard resolution (full=true) from config.js.
@returns nothing
*/
export function savePng(graph: Graph, dayMode: boolean, full: boolean, highRes: boolean): void {
	const options = {
		bg: dayMode ? "white" : "black", // background according to color mode
		full: full,
		maxWidth: undefined,
		maxHeight: undefined,
	};

	if (highRes) {
		options.maxWidth = config.download.image.max.width;
		options.maxHeight = config.download.image.max.height;
	} else if (full) {
		options.maxWidth = config.download.image.standard.width;
		options.maxHeight = config.download.image.standard.height;
	}

	const image = graph.cy.png(options);
	saveUrl(image, "snik.png");
}

/**
Save the graph as a SVG (vector format).
@param graph - the graph to save as SVG
@param dayMode - whether day mode is active
@param full - Iff true, include the whole graph, otherwise only include what is inside the canvas boundaries.
@returns nothing
*/
export function saveSvg(graph: Graph, dayMode: boolean, full: boolean = true): void {
	const options = {
		full,
		scale: 1,
		bg: dayMode ? "white" : "black", // background according to color mode
	};
	// @ts-expect-error provided by cytoscape-svg
	const data = graph.cy.svg(options);
	const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
	const url = window.URL.createObjectURL(blob);
	saveUrl(url, "snik.svg");
}
