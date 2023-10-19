/** Creates the circular context menu that can be opened on top of an edge.*/
import * as rdf from "../rdf";
import * as util from "./util";
import { EDGE } from "../edge";
import * as language from "../lang/language";
import { Graph } from "./graph";
import { type MenuItem, ContextMenu } from "./contextmenu";
import log from "loglevel";
import type { EdgeSingular } from "cytoscape";

/** Creates a human readable string of the triple that an edge represents.
 *  @param edge - the edge, whose label is determined
 *  @returns a human readable string of the triple that an edge represents. */
function edgeLabel(edge: EdgeSingular): string {
	return rdf.short(edge.data(EDGE.SOURCE)) + " " + rdf.short(edge.data(EDGE.PROPERTY)) + " " + rdf.short(edge.data(EDGE.TARGET));
}

/** Register modular edge context menu.
@param graph - the graph that the context menu operates on
@returns an array of commands
*/
export function edgeCommands(graph: Graph): Array<MenuItem> {
	const commands: Array<MenuItem> = [
		{
			content: "edit / report",
			id: "edge-edit",
			selector: "edge",
			onClickFunction: (event) => {
				const edge = event.target;
				const body = `Problem with the edge [${edgeLabel(edge)}](${edge.data(EDGE.SOURCE)}) ([OntoWiki URL](${ContextMenu.ontoWikiUrl(
					edge.data(EDGE.SOURCE)
				)})):\n\n`;
				util.createGitHubIssue(util.REPO_ONTOLOGY, edgeLabel(edge), body);
			},
		},
		{
			content: "hide",
			id: "edge-hide",
			selector: "edge",
			onClickFunction: (event) => Graph.setVisible(event.target, false),
		},
		{
			content: "description (if it exists)",
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
		/** Context menu for edges that are unconfirmed interlinks, that is skos:closeMatch and friends in the limes-exact graph.
					selector: `edge[${EDGE.GRAPH} = "http://www.snik.eu/ontology/limes-exact"]`, */
		{
			content: "confirm link",
			id: "edge-confirm-link",
			selector: "edge",
			onClickFunction: (event) => {
				const edge = event.target;
				edge.data(EDGE.GRAPH, "http://www.snik.eu/ontology/match");
				const body = `Please confirm the automatic interlink ${edgeLabel(edge)}:
					\`\`\`\n
					sparql
					DELETE DATA FROM <http://www.snik.eu/ontology/limes-exact>
					{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
					INSERT DATA INTO <http://www.snik.eu/ontology/match>
					{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
					\n\`\`\`
					Undo with
					\`\`\`\n
					sparql
					DELETE DATA FROM <http://www.snik.eu/ontology/match>
					{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
					INSERT DATA INTO <http://www.snik.eu/ontology/limes-exact>
					{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
					\n\`\`\`
					${language.CONSTANTS.SPARUL_WARNING}`;
				util.createGitHubIssue(util.REPO_ONTOLOGY, edgeLabel(edge), body);
			},
		},
		/** Context menu for edges in development mode that are either confirmed interlinks (skos:closeMatch and friends in the match graph) or meta relations, such as meta:updates.
			Offers base and development commands. */
		{
			content: "developer",
			id: "edge-dev",
			selector: "edge",
			submenu: [
				{
					content: "remove permanently",
					id: "remove-permanently",
					onClickFunction: (event) => {
						const edge = event.target;
						graph.cy.remove(edge);
						const body = `Please permanently delete the edge ${edgeLabel(edge)}:
					\`\`\`\n
					sparql
					DELETE DATA FROM <${rdf.longPrefix(edge.data(EDGE.SOURCE))}>
					{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
					\n\`\`\`
					Undo with
					\`\`\`\n
					sparql
					INSERT DATA INTO <${rdf.longPrefix(edge.data(EDGE.SOURCE))}>
					{<${edge.data(EDGE.SOURCE)}> <${edge.data(EDGE.PROPERTY)}> <${edge.data(EDGE.TARGET)}>.}
					\n\`\`\`
					${language.CONSTANTS.SPARUL_WARNING}`;
						util.createGitHubIssue(util.REPO_ONTOLOGY, edgeLabel(edge), body);
					},
				},
				{
					// Open the source class of the triple in OntoWiki because you can edit the triple there.
					content: "OntoWiki",
					id: "edge-ontowiki",
					onClickFunction: (event) => {
						window.open(ContextMenu.ontoWikiUrl(event.target.data(EDGE.SOURCE)));
					},
				},
				{
					content: "debug",
					id: "edge-debug",
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
