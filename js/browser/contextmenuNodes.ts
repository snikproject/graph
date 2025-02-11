/** Creates the circular context menu that can be opened on top of a node.*/
import { classUse } from "./classuse";
import { config } from "../config/config";
import * as rdf from "../rdf";
import { NODE } from "../utils/constants";
import { createGitHubIssue, deleteClass } from "../utils/gitHubIssues";
import { Graph, Direction } from "./graph";
import type { MenuItem } from "./contextmenu";
import * as sparql from "../sparql";
import * as language from "../lang/language";
import type { NodeSingular } from "cytoscape";

const eventify = (f: Function) => (event: Event) => f(event.target); // simplify multiplex expressions on event.target

/** Menu entries
@param graph - the graph that the commands should apply to, if any
@returns the base commands */
export function nodeCommands(graph: Graph): Array<MenuItem> {
	return [
		{
			id: "compound",
			selector: "node:compound",
			submenu: [
				{
					id: "open",
					onClickFunction: (event) => {
						event.target.children().move({ event: null });
						graph.cy.remove(event.target);
					},
				},
				{
					id: "move-match-on-top",
					onClickFunction: (event) => graph.moveNodes(event.target.children(), 0),
				},
				{
					id: "move-match-nearby",
					onClickFunction: (event) => graph.moveNodes(event.target.children(), 100),
				},
				{
					id: "compound-star",
					onClickFunction: (event) => graph.multiplex(graph.showStar, event.target.children(), true)(),
				},
				{
					id: "compound-incoming-star",
					onClickFunction: (event) => graph.multiplex((node) => graph.showStar(node, false, Direction.IN), event.target.children(), true)(),
				},
				{
					id: "compound-outgoing-star",
					onClickFunction: (event) => graph.multiplex((node) => graph.showStar(node, false, Direction.OUT), event.target.children(), true)(),
				},
				{
					id: "compound-path-source",
					onClickFunction: (event) => {
						graph.setSource(event.target.children()[0]);
					},
				},
			],
		},
		{
			id: "edit",
			selector: "node",
			onClickFunction: (event) => {
				const node = event.target;
				const body = `Problem with the class [${rdf.short(node.data(NODE.ID))}](${node.data(NODE.ID)}):\n\n`;
				createGitHubIssue(config.git.repo.ontology, node.data(NODE.ID), body);
			},
		},

		{
			id: "class-use",
			selector: "node",
			onClickFunction: (event) => {
				const node = event.target;
				classUse(node.data(NODE.ID), node.data(NODE.SUBTOP));
			},
		},
		{
			id: "hide",
			selector: "node",
			onClickFunction: eventify(graph.multiplex((node: NodeSingular) => Graph.setVisible(node, false))),
			//onClickFunction: eventMultiplex(graph, event, (node) => Graph.setVisible(node, false)),
		},
		{
			id: "set-path-source",
			selector: "node",
			onClickFunction: (event) => {
				graph.setSource(event.target);
			},
		},
		{
			id: "description",
			selector: "node",
			onClickFunction: (event) => {
				window.open(event.target.data(NODE.ID));
			},
		},
		{
			id: "star",
			selector: "node",
			onClickFunction: async (event) => {
				(await graph.showStarMultiplexedNew(false, Direction.BOTH))(event.target);
			},
		},
		{
			id: "incoming-star",
			selector: "node",
			onClickFunction: async (event) => {
				(await graph.showStarMultiplexedNew(false, Direction.IN))(event.target);
			},
		},
		{
			id: "outgoing-star",
			selector: "node",
			onClickFunction: async (event) => {
				(await graph.showStarMultiplexedNew(false, Direction.OUT))(event.target);
			},
		},
		{
			id: "path",
			selector: "node",
			// onClickFunction: eventify(graph.multiplex(graph.showPath)), // does not work for unknown reasons
			onClickFunction: (event) => graph.multiplex(graph.showPath(event.target))(graph.getSource()),
		},
		{
			id: "spiderworm",
			selector: "node",
			// multiplexing spiderworm leads to errors and has not been needed
			onClickFunction: (event) => graph.showWorm(graph.getSource(), event.target),
		},
		// {
		//   content: 'find neighbours',
		//   id: 'find-neighbours',
		//   select: node=>
		//   {
		//     log.warn("'find neighbours' not implemented yet!", node);
		//   },
		// },
		// {
		//   content: 'combine close matches',
		//   id: 'combine-close-matches',
		//   select: node=>
		//   {
		//     log.warn("'combine close matches' not implemented yet!", node);
		//   },
		// },
		{
			id: "dev",
			selector: "node",
			submenu: [
				{
					id: "remove-permanently",
					selector: "node",
					onClickFunction: (event) => {
						graph.cy.remove(event.target);
						deleteClass(event.target);
					},
				},
				{
					id: "debug",
					selector: "node",
					onClickFunction: (event) => alert(JSON.stringify(event.target.data(), null, 2)),
				},
			],
		},
		{
			id: "ext",
			selector: "node",
			submenu: [
				{
					id: "doublestar",
					selector: "node",
					onClickFunction: (event) => graph.multiplex(graph.showDoubleStar)(event.target),
				},
				{
					id: "starpath",
					selector: "node",
					onClickFunction: (event) => graph.multiplex(graph.showPath(event.target, true))(graph.getSource()),
				},
				{
					id: "circlestar",
					selector: "node",
					// circle star hides all other nodes so we always open it in a new view even if we are not in the main one
					onClickFunction: async (event) => {
						(await graph.showStarMultiplexedNew(true, Direction.BOTH, true))(event.target);
					},
				},
				{
					id: "lodlive",
					selector: "node",
					onClickFunction: (event) => {
						window.open("http://en.lodlive.it/?" + event.target.data(NODE.ID));
					},
				},
				{
					id: "move-selected",
					selector: "node",
					onClickFunction: (event) => {
						graph.cy.nodes(":selected").positions(() => event.target.position());
					},
				},
				{
					id: "close-match",
					selector: "node",
					onClickFunction: eventify(graph.multiplex(graph.showCloseMatch, undefined, true)),
				},
				{
					id: "show-instances",
					onClickFunction: async (event) => {
						const node = event.target;
						const uri = node.data(NODE.ID);
						const query = `SELECT ?i STR(SAMPLE(?label)) AS ?l {
        ?i a <${uri}>
        OPTIONAL {?i rdfs:label ?label. FILTER(LANGMATCHES(LANG(?label),"${language.getLanguage()}"))}
        }`;
						const bindings = await sparql.select(query);
						let message = bindings.map((b) => b["i"].value + " " + (b["l"] ? b["l"].value : "")).reduce((a, b) => a + "\n" + b, "");
						if (message === "") {
							message = `Class ${uri} does not have any instances.`;
						}
						alert(message);
					},
				},
			],
		},
	];
}
