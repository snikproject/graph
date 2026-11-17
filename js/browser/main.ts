/** Entry point.*/
import { Graph } from "./graph";
import { config } from "../config/config";
import { initLog } from "./log";
import { View } from "./view";
import MicroModal from "micromodal";
import log from "loglevel";

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
		// Let the browser and operating system handle combinations such as Ctrl+S (save) or Ctrl+P (print).
		if (e.ctrlKey || e.metaKey || e.altKey) {
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
			const selected = layoutState.cy.elements(":selected");
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
			const eles = layoutState.graph.getElementsByAllMeansNecessary(clipboard);
			Graph.setVisible(eles, true);

			layoutState.cy.endBatch();

			const visibleNodes = layoutState.cy.nodes(".unfiltered").not(".hidden");
			const edges = eles.nodes().edgesWith(visibleNodes);
			const pasted = eles.union(edges);
			Graph.setVisible(pasted, true);
			pasted.select(); // select all pasted nodes so that they are more visible above the other nodes

			layoutState.cy.fit(layoutState.cy.elements(".unfiltered").not(".hidden")); // needs to be outside the batch to fit correctly
			log.debug(`Pasted ${clipboard.length} elements into ${layoutState.title}.`);
			log.info("Partial graph inserted!");
		}
	});
}

/** Registers global handlers for uncaught errors and unhandled promise rejections
 * so that they are surfaced to the user (Notyf toast via the decorated loglevel)
 * and captured in the log for bug reports instead of failing silently. */
function initGlobalErrorHandlers(): void {
	window.addEventListener("error", (event: ErrorEvent) => {
		log.error(`Uncaught error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
	});
	window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
		const reason = event.reason;
		log.error(`Unhandled promise rejection: ${reason instanceof Error ? (reason.stack ?? reason.message) : String(reason)}`);
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
	initGlobalErrorHandlers();
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
