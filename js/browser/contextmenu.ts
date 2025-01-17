/** Creates the circular context menu that can be opened on top of a node/edge.
Needs to be initialized before it can be used via the default export function.*/
import { flatHelp } from "../help";
import cytoscape from "cytoscape";
//{ Collection, EdgeSingular, NodeSingular, SingularElementReturnValue } from "cytoscape";
import contextMenus from "cytoscape-context-menus";
import type { Graph } from "./graph";
cytoscape.use(contextMenus);
import "cytoscape-context-menus/cytoscape-context-menus.css";
import submenuIndicatorImg from "cytoscape-context-menus/assets/submenu-indicator-default.svg";
import * as language from "../lang/language";
import log from "loglevel";

const config = {
	menuItems: [] as Array<MenuItem>,
	evtType: "cxttap",
	submenuIndicator: { src: submenuIndicatorImg, width: 12, height: 12 },
};

// cytoscape-context-menus extension does not have type hints
export interface MenuItem {
	content?: string;
	id: string;
	selector?: "node" | "node:compound" | `edge${any}`;
	submenu?: Array<MenuItem>;
	onClickFunction?(event: Event | { target: any }): void;
}

/** context menu for nodes and edges */
export class ContextMenu {
	graph: Graph;

	/**
	 * Add a logging wrapper to a context menu command.
	 * @param  cmd - the context menu command to wrap if it isn't already wrapped
	 * @param  messageFunction - a function that describes the element */
	static logWrap(cmd: { onClickFunction; content }, messageFunction: (ele: Element) => any): void {
		if (cmd?.onClickFunction?.wrapped) {
			return;
		}

		const tmp = cmd.onClickFunction;
		cmd.onClickFunction = (ele: Element) => {
			log.debug("Context Menu: Operation " + cmd.content + " on " + messageFunction(ele));
			tmp(ele);
		};
		cmd.onClickFunction.wrapped = true;
	}

	/** Fill the context menu and register it with configuration, which will show it for the node and edge selectors.
	 * The extension itself is already registered through the plain HTML/JS import in index.html,
	 * which makes available cy.contextMenus().
	 * @param graph - the graph that the context menu applies to */
	constructor(graph: Graph, menuItems: Array<MenuItem>) {
		this.graph = graph;
		log.debug("Register Context Menu.");
		config.menuItems = menuItems;

		config.menuItems.forEach(function initItems(menu) {
			ContextMenu.addTooltip(menu);
			menu.content = language.getString(menu.id);
			if (menu.submenu) {
				menu.submenu.forEach((menu) => initItems(menu));
			}
		});
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
