import * as util from "./util";
import { View, ViewState } from "./view";
import * as layout from "../layout";
import { ComponentContainer, EventEmitter, GoldenLayout, LayoutConfig, Stack } from "golden-layout";
import log from "loglevel";

/** Create, configure and return a GoldenLayout instance.
 *  @returns the created GoldenLayout instance */
export function goldenLayout(): GoldenLayout {
	const layoutConfig: LayoutConfig = {
		root: {
			type: "stack",
			content: [],
		},
	};

	const viewLayout = new GoldenLayout();
	viewLayout.loadLayout(layoutConfig);

	const stack: Stack = viewLayout.rootItem as Stack;
	const template = util.getElementById("goldenlayout-header");
	const zoomButtons = document.importNode(template, true);
	// Add the zoomButtons to the header
	stack.header.controlsContainerElement.prepend(zoomButtons);
	// TODO: update stack on focus change

	viewLayout.addEventListener("stackHeaderClick", (event) => {
		// TODO TP: This event is not firing despite following the docs. Please investigate and fix.
		log.info("SELECTION CHANGED");
		log.info(event);
	});

	viewLayout.on("tabCreated", function (...tabs: EventEmitter.TabParam) {
		// When a tab is selected then select its stack. For unknown reasons this is not default behaviour of GoldenLayout.
		// What happens when a tab is moved out of a stack? Testing showed no problems but this should be investigated for potential bugs.
		tabs[0].setActive(true);

		const stackState = () => stack.getActiveComponentItem().toConfig().componentState as ViewState;
		const cy = () => stackState().cy;
		const controls = stack.header.controlsContainerElement;
		const separateSubs = () => View.getMenu().separateSubs() && !stackState().graph.starMode;
		const data = new Map([
			[
				".plussign",
				() => {
					cy().zoom(cy().zoom() * 1.2);
				},
			],
			[
				".minussign",
				() => {
					cy().zoom(cy().zoom() / 1.2);
				},
			],
			[
				".addsign",
				() => {
					new View();
				},
			],
			[
				".recalculatesign",
				() => {
					layout.run(cy(), layout.euler, (layoutConfig as any).defaultSubOntologies, separateSubs(), true);
				},
			],
			[
				".tightlayoutsign",
				() => {
					layout.run(cy(), layout.eulerTight, (layoutConfig as any).defaultSubOntologies, separateSubs(), true);
				},
			],
			// The compound layout does not work with separate subs so set the latter always to false.
			[
				".compoundlayoutsign",
				() => {
					layout.run(cy(), layout.cose, (layoutConfig as any).defaultSubOntologies, false, true);
				},
			],
		]);
		for (const datum of data) {
			controls.querySelector(datum[0]).addEventListener("click", datum[1]);
		}
	});

	viewLayout.registerComponentFactoryFunction("view", (container: ComponentContainer): View => {
		log.warn("Oh nO!");
		const view = new View();
		view.element = container.element[0];
		container.element.appendChild(view.cyContainer);
		container.on("destroy", () => {
			View.partViews.delete(view);
		});
		return view;
	});

	return viewLayout;
}
