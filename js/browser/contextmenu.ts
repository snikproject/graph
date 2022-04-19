/** Creates the circular context menu that can be opened on top of a node/edge.
Needs to be initialized before it can be used via the default export function.*/
import { nodeCommands } from "./contextmenuNodes";
import { edgeCommands } from "./contextmenuEdges";
import { flatHelp } from "../help";
import cytoscape from "cytoscape";
//{ Collection, EdgeSingular, NodeSingular, SingularElementReturnValue } from "cytoscape";
import contextMenus from "cytoscape-context-menus";
import type { Graph } from "./graph";
cytoscape.use(contextMenus);
import "cytoscape-context-menus/cytoscape-context-menus.css";
import "cytoscape-context-menus/assets/submenu-indicator-default.svg";
import log from "loglevel";
import { sub } from "../rdf";

// cytoscape-context-menus extension does not have type hints
export interface MenuItem {
	content: string;
	id: string;
	selector?: "node" | "node:compound" | "edge";
	submenu?: Array<MenuItem>;
	onClickFunction?(event: Event | { target: any }): void;
}

const config = { menuItems: [] as Array<MenuItem>, evtType: "cxttap taphold" };

/** context menu for nodes and edges */
export class ContextMenu {
	graph: Graph;

	/**
	 * Add a logging wrapper to a context menu command.
	 * @param  cmd - the context menu command to wrap if it isn't already wrapped
	 * @param  messageFunction - a function that describes the element */
	static logWrap(cmd: { onClickFunction; content }, messageFunction: (ele: Element) => any): void {
		if (!cmd.onClickFunction || cmd.onClickFunction.wrapped) {
			return;
		}

		const tmp = cmd.onClickFunction;
		cmd.onClickFunction = (ele: Element) => {
			log.debug("Context Menu: Operation " + cmd.content + " on " + messageFunction(ele));
			tmp(ele);
		};
		cmd.onClickFunction.wrapped = true;
	}

	static ontoWikiUrl(uri) {
		return "https://www.snik.eu/ontowiki/view/?r=" + uri + "&m=" + sub(uri);
	}

	/** Fill the context menu and register it with configuration, which will show it for the node and edge selectors.
  The extension itself is already registered through the plain HTML/JS import in index.html,
  which makes available cy.contextMenus().
  @param graph - the graph that the context menu applies to */
	constructor(graph: Graph) {
		this.graph = graph;
		log.debug("Register Context Menu.");
		config.menuItems = [...nodeCommands(graph), ...edgeCommands(graph)];
		config.menuItems.forEach((menu) => ContextMenu.addTooltip(menu));
		// @ts-expect-error provided by cytoscape-context-menus
		graph.cy.contextMenus(config);
	}

	/** Add tooltips to all menu entries.
	 *  @param cxtMenu - a context menu without tooltips */
	static addTooltip(cxtMenu: any): void {
		(cxtMenu.submenu ?? []).forEach(ContextMenu.addTooltip);
		cxtMenu.tooltipText = flatHelp[cxtMenu.id] || flatHelp[cxtMenu.id.replace("edge-", "")]; // may be undefined
	}
}
