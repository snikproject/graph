/** Creates the circular context menu that can be opened on top of an edge.*/
import * as util from "./util";
import { config } from "../config/config";
import { EDGE } from "../utils/constants";
import { Graph } from "./graph";
import type { MenuItem } from "./contextmenu";
import log from "loglevel";

/** Register modular edge context menu.
@param graph - the graph that the context menu operates on
@returns an array of commands
*/
export function edgeCommands(graph: Graph): Array<MenuItem> {
	const commands: Array<MenuItem> = [
		{
			id: "edge-edit",
			selector: "edge",
			onClickFunction: (event) => {
				const edge = event.target;
				const body = `Problem with the edge [${util.edgeLabel(edge)}](${edge.data(EDGE.SOURCE)}):\n\n`;
				util.createGitHubIssue(config.git.repo.ontology, util.edgeLabel(edge), body);
			},
		},
		{
			id: "edge-hide",
			selector: "edge",
			onClickFunction: (event) => Graph.setVisible(event.target, false),
		},
		{
			id: "edge-description",
			selector: "edge",
			onClickFunction: (event) => {
				const edge = event.target;
				if (edge.data(EDGE.AXIOM)) {
					window.open(edge.data(EDGE.AXIOM));
				} else {
					log.warn("There is no description for this edge.");
				}
			},
		},
		/** Context menu for edges that are unconfirmed interlinks, that is skos:closeMatch and friends in the limes-exact graph. */
		{
			id: "edge-confirm-link",
			selector: `edge[${EDGE.GRAPH} = "http://www.snik.eu/ontology/limes-exact"]`,
			onClickFunction: (event) => util.confirmLink(event.target),
		},
		/** Context menu for edges in development mode that are either confirmed interlinks (skos:closeMatch and friends in the match graph) or meta relations, such as meta:updates.
			Offers base and development commands. */
		{
			id: "edge-dev",
			selector: "edge",
			submenu: [
				{
					id: "remove-permanently",
					onClickFunction: (event) => {
						graph.cy.remove(event.target);
						util.deleteTriple(event.target);
					},
				},
				{
					id: "debug",
					onClickFunction: (event) => {
						alert(JSON.stringify(event.target.data(), null, 2));
					},
				},
			],
		},
	];

	// TODO: adapt to new menu
	/*for (const command of commands) {
		logWrap(command, (edge) => `edge with property ${edge.data(EDGE.PROPERTY)} between ${edge.data(EDGE.SOURCE)} ${edge.data(EDGE.TARGET)}`);
	}*/
	/** confirmed interlinks (skos:closeMatch and friends in the match graph) or meta properties, such as meta:updates./*
	/*	selector: `edge[${EDGE.GRAPH} = "http://www.snik.eu/ontology/limes-exact"]`, */

	return commands;
}
