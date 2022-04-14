import { Graph } from "./graph";
import { fillInitialGraph } from "./main";
import { ContextMenu } from "./contextmenu";
import { goldenLayout, ViewComponent } from "./viewLayout";
import { toJSON } from "./state";
import log from "loglevel";
import { ComponentItemConfig, ContentItem, LayoutConfig, ComponentContainer } from "golden-layout";

let viewCount: number = 0; // only used for the name, don't decrement on destroy to prevent name conflicts

let firstFinished = null; // following instances need to wait for the first to load
let viewLayout = goldenLayout();

/** Helper function that traverses the component tree.
 *  @param x - the component to traverse
 *  @param depth - recursive depth */
function traverse(x: ContentItem, depth: number): Array<ContentItem> {
	const removeTabsArray: Array<ContentItem> = [];
	if (x.type === "component") {
		const config = x as unknown as ComponentItemConfig;
		if (config.componentName !== "Gesamtmodell") {
			removeTabsArray.push(x);
			return removeTabsArray;
		}
	}
	for (const item of x.contentItems) {
		removeTabsArray.push(...traverse(item, ++depth));
	}
	return removeTabsArray;
}

export interface State {
	title: string;
	graph: Graph;
	name: string;
	cy: cytoscape.Core;
}

export class View {
	initialized: Promise<void>;
	state: State;
	readonly cyContainer: HTMLDivElement = document.createElement("div");
	element: HTMLElement;
	cxtMenu: ContextMenu;
	static mainView = null;
	static readonly partViews = new Set<View>();

	static views(): Array<View> {
		return [this.mainView, ...this.partViews];
	}

	/** Returns the state of the active (focussed) view.
	@returns The state of the active (focussed) view. */
	static activeState(): State {
		return (viewLayout as any).selectedItem?.getActiveContentItem()?.config?.componentState;
	}

	/** Returns the active (focussed) view.
	@returns The active (focussed) view. */
	static activeView(): any {
		return (viewLayout as any).selectedItem?.getActiveContentItem();
	}

	/** Fill the initial graph or copy over from the main view if it is not the first. */
	async fill(): Promise<void> {
		const graph = this.state.graph;
		if (View.mainView === null) {
			View.mainView = this;
			firstFinished = fillInitialGraph(graph);
			await firstFinished;
			log.debug(`Main view ${this.state.name} loaded with ${graph.cy.elements().size()} elements.`);
		} else {
			await firstFinished;
			graph.cy.add(View.mainView.state.cy.elements()); // don't load again, copy from first view
			log.debug(`Create view ${this.state.title} with ${graph.cy.elements().size()} hidden elements copied from ${View.mainView.state.title}.`);
			const elements = graph.cy.elements();
			Graph.setVisible(elements, false);
			Graph.setVisible(elements.edgesWith(elements), false);
			elements.removeClass("source"); // discard path source highlighting from the old graph
			graph.starMode = true;
			/*
      const source = this.mainView.state.graph.getSource();
      console.log(source);
      console.log(graph.assimilate(source));
      if(source) {graph.setSource(graph.assimilate(source));}
      */
		}
	}

	/**
	 * Create an empty graph and add it to the state of this view along with its Cytoscape.js instance.
	 * @param initialize - if initialize is true or not given, the graph is copied from the main view or, if that doesn't exist, from the SPARQL endpoint
	 * @param title - optional view title
	 */
	constructor(initialize: boolean = true, title?: string) {
		//find initial title of the new View
		title = title ?? (viewCount++ === 0 ? "Gesamtmodell" : "Teilmodell " + (viewCount - 1));
		// @ts-expect-error is be completed later
		this.state = { title, name: "unnamed" };

		const itemConfig: ComponentItemConfig = {
			title: title,
			type: "component",
			componentName: title,
			componentType: "ViewComponent",
			componentState: this.state,
			isClosable: View.mainView !== null,
		};

		const thisView = this; // supply this to callback
		if (View.mainView !== null) {
			View.partViews.add(this);
		}
		viewLayout.registerComponent(title, function (container) {
			//thisView.cyContainer = document.createElement("div");
			thisView.element = container.getElement()[0];
			container.getElement()[0].appendChild(thisView.cyContainer);
			container.on("destroy", () => {
				View.partViews.delete(thisView);
			});
		});

		(viewLayout as any).root.contentItems[0].addChild(itemConfig);

		const graph = new Graph(thisView.cyContainer);
		const cy = graph.cy;

		this.state.graph = graph;
		this.state.cy = cy;

		this.initialized = initialize ? this.fill() : Promise.resolve();
		this.initialized.then(() => {
			this.state.graph.invert(toJSON().options.dayMode);
			this.cxtMenu = new ContextMenu(this.state.graph);
		});
	}

	/** Close all tabs except the first one. */
	static reset(): void {
		/*		const removeTabsArray = traverse(viewLayout.root, 0);
		for (const content of removeTabsArray) {
			content.remove();
		}
		View.partViews.clear();
		viewCount = 0;
		viewLayout.destroy();
		viewLayout = goldenLayout();*/
	}
}
