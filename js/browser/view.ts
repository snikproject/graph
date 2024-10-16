import { Graph } from "./graph";
import { fillInitialGraph } from "./init";
import { ContextMenu } from "./contextmenu";
import { nodeCommands } from "./contextmenuNodes";
import { edgeCommands } from "./contextmenuEdges";
import { goldenLayout } from "./viewLayout";
import { toJSON } from "./state";
import log from "loglevel";
import type { ComponentItemConfig, ContentItem, Stack } from "golden-layout";
import { Menu } from "./menu";

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
		if (config.title !== "Main Graph") {
			removeTabsArray.push(x);
			return removeTabsArray;
		}
	}
	for (const item of x.contentItems) {
		removeTabsArray.push(...traverse(item, ++depth));
	}
	return removeTabsArray;
}

export interface ViewState {
	title: string;
	graph: Graph;
	cy: cytoscape.Core;
}

/** Tab that shows a graph. */
export class View {
	initialized: Promise<void>;
	state: ViewState;
	readonly cyContainer: HTMLDivElement = document.createElement("div");
	element: HTMLElement;
	cxtMenu: ContextMenu;
	menu: Menu = null;
	static mainView = null;
	static readonly partViews = new Set<View>();

	static views(): Array<View> {
		return [this.mainView, ...this.partViews];
	}

	/** Returns the state of the active (focussed) view.
	@returns The state of the active (focussed) view. */
	static activeState(): ViewState {
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
			this.menu = new Menu();
			firstFinished = fillInitialGraph(graph);
			await firstFinished;
			log.debug(`Main view loaded with ${graph.cy.elements().size()} elements.`);
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

	/** Recreates the context menus. Needed for language switching. */
	recreateContextMenus(): void {
		const menuItems = [...nodeCommands(this.state.graph), ...edgeCommands(this.state.graph)];
		this.cxtMenu = new ContextMenu(this.state.graph, menuItems);
	}

	/**
	 * Create an empty graph and add it to the state of this view along with its Cytoscape.js instance.
	 * @param initialize - if initialize is true or not given, the graph is copied from the main view or, if that doesn't exist, from the SPARQL endpoint
	 * @param title - optional view title
	 */
	constructor(initialize: boolean = true, title?: string) {
		/*******************
		 * Tab Title Stuff *
		 ******************/
		// if custom name, check for and prevent duplication
		if (title !== "undefined" && viewCount > 0) {
			View.views().forEach((part: View) => {
				if (part && part.state.title === title) {
					title = "Teilmodell " + View.views().length;
				}
			});
		}
		//find initial title of the new View
		title = title ?? (viewCount === 0 ? "Main Graph" : "Partial Graph " + viewCount);
		viewCount++;

		/*********************
		 * Manage view.state *
		 *********************
		 *
		 * (and adding to partViews-list)
		 */
		if (View.mainView !== null) {
			View.partViews.add(this);
		}
		// will be completed later
		// creating graph now will break cytoscape
		this.state = {
			title: title,
			graph: undefined,
			cy: undefined,
		};

		/***********************
		 * Golden Layout Stuff *
		 **********************/
		// Stack where Tabs are added to
		const stack = viewLayout.rootItem as Stack;
		const itemConfig: ComponentItemConfig = {
			title: title,
			type: "component",
			componentType: "view",
			componentState: this.state,
			isClosable: View.mainView !== null,
		};
		stack.addItem(itemConfig);

		/********************************
		 * Complete Managing view.state *
		 ********************************/
		const graph = new Graph(this.cyContainer);
		this.state.graph = graph;
		this.state.cy = graph.cy;

		/******************************
		 * Stuff After Initialization *
		 *****************************/
		this.initialized = initialize ? this.fill() : Promise.resolve();
		this.initialized.then(() => {
			const options = toJSON().options;
			this.state.graph.applyStyle(options.dayMode, options.edgesColorized, options.showProperty);
			this.recreateContextMenus();
		});
	}

	/** Close all tabs except the first one. */
	static reset(): void {
		const removeTabsArray = traverse(viewLayout.rootItem, 0);
		for (const content of removeTabsArray) {
			content.remove();
		}
		View.partViews.clear();
		viewCount = 0;
		viewLayout.destroy();
		viewLayout = goldenLayout();
	}

	static getMenu(): Menu {
		return View.mainView.menu;
	}
}
