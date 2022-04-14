import * as util from "./util";
import { View } from "./view";
import * as layout from "../layout";
import { GoldenLayout, LayoutConfig, ComponentItemConfig, ComponentContainer } from "golden-layout";
import log from "loglevel";
import "golden-layout/dist/css/goldenlayout-base.css";
import "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";
import "../../css/goldenlayout.css";

export class ViewComponent {
	rootElement: HTMLElement;

	constructor(public container: ComponentContainer) {
		this.rootElement = container.element;
		this.rootElement.innerHTML = "<div></div>";
		this.resizeWithContainerAutomatically = true;
	}
}

/** Create, configure and return a GoldenLayout instance.
 *  @returns the created GoldenLayout instance */
export function goldenLayout(): GoldenLayout {
	const layoutConfig: LayoutConfig = {
		//		settings: { selectionEnabled: true },
		root: {
			type: "row",
			content: [
				{
					title: "My Component 1",
					type: "component",
					componentType: "ViewComponent",
					width: 50,
				} as ComponentItemConfig,
				{
					title: "My Component 2",
					type: "component",
					componentType: "ViewComponent",
					// componentState: { text: 'Component 2' }
				} as ComponentItemConfig,
			],
		},
	};

	const viewLayout: GoldenLayout = new GoldenLayout(layoutConfig);
	viewLayout.registerComponent("ViewComponent", ViewComponent);

	// TODO: update stack on focus change

	viewLayout.on("selectionChanged ", (event) => {
		// TODO TP: This event is not firing despite following the docs. Please investigate and fix.
		log.info("SELECTION CHANGED");
		log.info(event);
	});

	viewLayout.on("itemCreated", function (e) {
		if (!e.target.isStack) {
			return;
		}
		const stack = e.target;
		console.log("Creating a stack", stack);
		//(viewLayout as any).selectItem(stack); // doesnt work with goldenlayout2
		const template = util.getElementById("goldenlayout-header");
		const zoomButtons = document.importNode((template as any).content, true);
		// Add the zoomButtons to the header
		console.log(stack.header.controlsContainerElement);
		//(stack as any).header.controlsContainerElement.childNodes.prepend(zoomButtons); // stack.header undefined with goldenlayout2
		// When a tab is selected then select its stack. For unknown reasons this is not default behaviour of GoldenLayout.
		// What happens when a tab is moved out of a stack? Testing showed no problems but this should be investigated for potential bugs.
		/*
		(stack as any).on("activeContentItemChanged", () => {
			(viewLayout as any).selectItem(stack);
		});
*/
		const stackState = () => (stack as any).getActiveContentItem().config.componentState;
		const cy = () => stackState().cy;
		//		const controls = (stack as any).header.controlsContainer[0];
		const separateSubs = () => View.mainView.state.graph.menu.separateSubs() && !stackState().graph.starMode;
		const data = [
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
		];
		/*for (const datum of data) {
			controls.querySelector(datum[0]).addEventListener("click", datum[1]);
		}*/
	});
	viewLayout.init();
	return viewLayout;
}
