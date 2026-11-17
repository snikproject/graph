import * as util from "./util";
import { View, type ViewState } from "./view";
import * as layout from "../layout";
import { config } from "../config/config";
import { GoldenLayout, type LayoutConfig, type ContentItem, type Stack } from "golden-layout";
import "golden-layout/dist/css/goldenlayout-base.css";
import "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";
import "../../css/goldenlayout.css";

/** The currently active (focused) content item.
 * Golden Layout 2 removed the selectedItem property that version 1 had, so it is tracked manually. */
let activeContentItem: ContentItem | null = null;

/** @returns the currently active (focused) content item. */
export function getActiveContentItem(): ContentItem | null {
	return activeContentItem;
}

/** The stack header height depending on the viewport width, with breakpoints matching the media queries in css/goldenlayout.css.
 *  Golden Layout writes this value from the layout config as an inline style onto .lm_header, so it cannot be overridden from CSS. */
const headerHeight = () => (window.innerWidth >= 3000 ? 32 : window.innerWidth >= 2000 ? 28 : 24);

/** Create, configure and return a GoldenLayout instance.
 *  @returns the created GoldenLayout instance */
export function goldenLayout(): GoldenLayout {
	const layoutConfig: LayoutConfig = {
		dimensions: { headerHeight: headerHeight() },
		root: {
			type: "stack",
			content: [],
		},
	};

	const viewLayout = new GoldenLayout(layoutConfig);
	const stacks: Array<Stack> = [];

	// Golden Layout 2 has no typed stackCreated event anymore but still emits it as an unknown bubbling event
	// whose first argument is the event with the created stack as its target.
	(viewLayout as any).on("stackCreated", (event) => {
		const stack = event.target as Stack;
		stacks.push(stack);
		const template = util.getElementById("goldenlayout-header");
		const zoomButtons = document.importNode((template as any).content, true);
		// Add the zoomButtons to the header
		stack.header.controlsContainerElement.prepend(zoomButtons);

		const stackState = () => stack.getActiveComponentItem()?.container.state as unknown as ViewState;
		const cy = () => stackState().cy;
		const controls = stack.header.controlsContainerElement;
		const separateColours = () => View.getMenu().separateColours() && !stackState().graph.starMode;
		const data: Array<[string, () => void]> = [
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
					layout.run(cy(), layout.euler, config.ontology?.snik?.defaultSubOntologies, separateColours(), true);
				},
			],
			[
				".tightlayoutsign",
				() => {
					layout.run(cy(), layout.eulerTight, config.ontology?.snik?.defaultSubOntologies, separateColours(), true);
				},
			],
			// The compound layout does not work with separate colours so set the latter always to false.
			[
				".compoundlayoutsign",
				() => {
					layout.run(cy(), layout.cose, config.ontology?.snik?.defaultSubOntologies, false, true);
				},
			],
		];
		for (const datum of data) {
			controls.querySelector(datum[0])!.addEventListener("click", datum[1]);
		}

		// Track the active content item for View.activeView(), replacing Golden Layout 1's selectItem.
		activeContentItem = stack.getActiveComponentItem() ?? null;
		stack.on("activeContentItemChanged", (item) => {
			activeContentItem = item;
		});
	});
	// Golden Layout derives the header height from the layout config and writes it as an inline style onto .lm_header
	// on every resize, so viewport width changes have to be pushed through the resolved layout config again.
	const applyHeaderHeight = () => {
		(viewLayout.layoutConfig.dimensions as { headerHeight: number }).headerHeight = headerHeight();
		for (const stack of stacks) {
			(stack.header as any).updateTabSizes();
		}
		viewLayout.setSize(window.innerWidth, window.innerHeight);
	};
	for (const breakpoint of [2000, 3000]) {
		window.matchMedia(`(min-width: ${breakpoint}px)`).addEventListener("change", applyHeaderHeight);
	}

	(viewLayout as any).init();
	return viewLayout;
}
