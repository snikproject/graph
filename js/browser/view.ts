import { Graph } from "./graph";
import { fillInitialGraph } from "./init";
import { ContextMenu } from "./contextmenu";
import { nodeCommands } from "./contextmenuNodes";
import { edgeCommands } from "./contextmenuEdges";
import { goldenLayout, getActiveContentItem } from "./viewLayout";
import { toJSON } from "./state";
import log from "loglevel";
import { ContentItem, type ComponentItem } from "golden-layout";
import { Menu, menu } from "./menu";
import * as language from "../lang/language";

let viewCount: number = 0; // only used for the default titles, don't decrement on destroy to prevent title conflicts

let firstFinished = null; // following instances need to wait for the first to load
let viewLayout = goldenLayout();

/** Helper function that traverses the component tree.
 *  @param x - the component to traverse
 *  @param depth - recursive depth */
function traverse(x: ContentItem, depth: number): Array<ContentItem> {
	const removeTabsArray: Array<ContentItem> = [];
	if (ContentItem.isComponentItem(x) && x.componentType !== "Main Graph") {
		removeTabsArray.push(x);
		return removeTabsArray;
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
	static mainView: View = null;
	static readonly partViews = new Set<View>();

	static views(): Array<View> {
		return [this.mainView, ...this.partViews];
	}

	/** Returns the state of the active (focussed) view.
	@returns The state of the active (focussed) view. */
	static activeState(): ViewState {
		return (getActiveContentItem() as ComponentItem | null)?.container.state as unknown as ViewState;
	}

	/** Returns the active (focussed) view.
	@returns The active (focussed) view. */
	static activeView(): any {
		return getActiveContentItem();
	}

	/** Make this the main view and reuse the existing menu singleton or create it if it doesn't exist.
	Called on startup and after a session load, which recreates the views without calling fill(). */
	private makeMainView(): void {
		View.mainView = this;
		this.menu = menu ?? new Menu();
	}

	/** Fill the initial graph or copy over from the main view if it is not the first. */
	async fill(): Promise<void> {
		const graph = this.state.graph;
		if (View.mainView === null) {
			this.makeMainView();
			firstFinished = fillInitialGraph(graph);
			await firstFinished;
			log.debug(`Main view ${this.state.title} loaded with ${graph.cy.elements().size()} elements.`);
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
		const partialGraph = language.getString("partial-graph") ?? "Partial Graph";
		// if custom name, check for and prevent duplication
		if (title !== undefined && viewCount > 0) {
			View.views().forEach((part: View) => {
				if (part.state.title === title) {
					title = partialGraph + " " + View.views().length;
					return;
				}
			});
		}

		//find initial title of the new View
		title = title ?? (viewCount === 0 ? "Main Graph" : partialGraph + " " + viewCount);
		viewCount++;
		// @ts-expect-error is be completed later
		this.state = { title };

		const itemConfig = {
			title: title,
			type: "component",
			componentType: title,
			componentState: this.state,
			isClosable: View.mainView !== null,
		};

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const thisView = this; // supply this to callback
		if (View.mainView !== null) {
			View.partViews.add(this);
		}
		// Golden Layout 2 throws when a component type is registered twice so only register new titles.
		if (!viewLayout.getRegisteredComponentTypeNames().includes(title)) {
			viewLayout.registerComponent(title, function (container) {
				thisView.element = container.getElement();
				thisView.element.appendChild(thisView.cyContainer);
				container.on("destroy", () => {
					View.partViews.delete(thisView);
				});
			});
		}
		// Session loading recreates the views without calling fill(), so the first loaded view becomes the new main view here.
		// This has to happen after the isClosable check and part view registration so that the new main view is not closeable.
		if (!initialize && View.mainView === null) {
			this.makeMainView();
		}

		(viewLayout as any).root.contentItems[0].addItem(itemConfig);

		const graph = new Graph(thisView.cyContainer);
		const cy = graph.cy;

		this.state.graph = graph;
		this.state.cy = cy;

		this.initialized = initialize ? this.fill() : Promise.resolve();
		this.initialized.then(() => {
			const options = toJSON().options;
			this.state.graph.applyStyle(options.dayMode, options.coloredEdges, options.showProperty);
			this.recreateContextMenus();
		});
	}

	/** Close all tabs except the first one. */
	static reset(): void {
		const removeTabsArray = traverse((viewLayout as any).root, 0);
		for (const content of removeTabsArray) {
			content.remove();
		}
		View.partViews.clear();
		// the layout is recreated, so the main view is gone and the next created view becomes the new main view
		// the menu singleton is intentionally kept and reused by the new main view
		View.mainView = null;
		viewCount = 0;
		viewLayout.destroy();
		viewLayout = goldenLayout();
	}

	static getMenu(): Menu {
		return View.mainView.menu;
	}
}
