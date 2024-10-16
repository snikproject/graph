/** Entry point.*/
import { Graph } from "./graph";
import { config } from "../config/config";
import { initLog } from "./log";
import { View } from "./view";
import MicroModal from "micromodal";
import log from "loglevel";
import type { NodeCollection } from "cytoscape";

const clipboard: string[] = [];

/** Relegate keypresses to the active view. */
function initKeyListener(): void {
	document.documentElement.addEventListener("keydown", (e: KeyboardEvent) => {
		// prevent keydown listener from firing on input fields
		// See https://stackoverflow.com/questions/40876422/jquery-disable-keydown-in-input-and-textareas
		const el = e.target as Element;
		if (!el || el.nodeName !== "BODY") {
			return;
		}

		const layoutState = View.activeState();
		if (!layoutState) {
			return;
		}
		if (e.code === "Delete" || e.code === "Backspace") {
			// backspace (for mac) or delete key
			layoutState.cy.remove(":selected");
		}
		// Copy
		if (e.code === "KeyS" || e.code === "KeyC") {
			const selected = layoutState.cy.nodes(":selected");
			if (selected.size() === 0) {
				return;
			} // do nothing when nothing selected
			clipboard.length = 0;
			clipboard.push(...selected.map((node) => node.id()));
			log.debug(`Copied ${clipboard.length} elements from ${layoutState.title}.`);
			log.info("Partial graph copied!");
		}
		// Paste
		if (e.code === "KeyP" || e.code === "KeyV") {
			layoutState.cy.startBatch();
			layoutState.cy.elements().unselect();
			const nodes = layoutState.graph.getElementsByIds(clipboard) as unknown as NodeCollection;
			Graph.setVisible(nodes, true);

			layoutState.cy.endBatch();

			const visibleNodes = layoutState.cy.nodes(".unfiltered").not(".hidden");
			const edges = nodes.edgesWith(visibleNodes);
			const pasted = nodes.union(edges);
			Graph.setVisible(pasted, true);
			pasted.select(); // select all pasted nodes so that they are more visible above the other nodes

			layoutState.cy.fit(layoutState.cy.elements(".unfiltered").not(".hidden")); // needs to be outside the batch to fit correctly
			log.debug(`Pasted ${clipboard.length} elements into ${layoutState.title}.`);
			log.info("Partial graph inserted!");
		}
	});
}

/** Entry point. Is run when DOM is loaded. */
async function main(): Promise<void> {
	//@ts-expect-error mainCalled manually added
	if (window.mainCalled) {
		log.warn("main() is called multiple times for unknown reasons. Ignoring.");
		return;
	}
	//@ts-expect-error mainCalled manually added
	window.mainCalled = true;
	console.groupCollapsed("Initializing");
	console.time("Initializing");

	initLog();
	initKeyListener();
	MicroModal.init({ openTrigger: "data-custom-open" });

	for (let i = 0; i < config.multiview.initialTabs; i++) {
		const view = new View();
		await view.initialized;
	}

	console.timeEnd("Initializing");
	console.groupEnd();
}

document.addEventListener("DOMContentLoaded", main);
