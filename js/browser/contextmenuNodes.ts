/** Creates the circular context menu that can be opened on top of a node.*/
import { classUse } from "./classuse";
import { config } from "../config/config";
import * as rdf from "../rdf";
import { NODE } from "../node";
import * as util from "./util";
import { Graph, Direction } from "./graph";
import type { MenuItem } from "./contextmenu";
import * as sparql from "../sparql";
import { SPARQL_PREFIXES } from "../sparqlPrefixes";
import * as language from "../lang/language";

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
						graph.cy.remove(event.target);
					},
				},
				{ id: "move-match-on-top", onClickFunction: (event) => graph.moveNodes(event.target.children(), 0) },
				{ id: "move-match-nearby", onClickFunction: (event) => graph.moveNodes(event.target.children(), 100) },
				{ id: "compound-star", onClickFunction: (event) => graph.applyToCollection(graph.showStar, undefined, event.target.children()) },
				{
					id: "compound-incoming-star",
					onClickFunction: (event) => graph.applyToCollection((node) => graph.showStar(node, false, Direction.IN), undefined, event.target.children()),
				},
				{
					id: "compound-outgoing-star",
					onClickFunction: (event) => graph.applyToCollection((node) => graph.showStar(node, false, Direction.OUT), undefined, event.target.children()),
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
			selector: "node:childless",
			onClickFunction: (event) => {
				const node = event.target;
				const uri = node.data(NODE.ID);
				const body = `Problem with the class [${rdf.short(uri)}](${uri}):\n\n`;
				util.createGitHubIssue(config.git.repo.ontology, "Problem with the class " + rdf.short(uri), body);
			},
		},

		{
			id: "class-use",
			selector: "node:childless",
			onClickFunction: (event) => {
				const node = event.target;
				classUse(node.data(NODE.ID), node.data(NODE.SUBTOP));
			},
		},
		{ id: "hide", selector: "node", onClickFunction: (event) => graph.applyPerNode((node) => Graph.setVisible(node, false), event.target) },
		{
			id: "set-path-source",
			selector: "node:childless",
			onClickFunction: (event) => {
				graph.setSource(event.target);
			},
		},
		{
			id: "description",
			selector: "node:childless",
			onClickFunction: (event) => {
				window.open(event.target.data(NODE.ID));
			},
		},
		{
			id: "star",
			selector: "node:childless",
			onClickFunction: async (event) => {
				await graph.showStarInAnotherView(event.target);
			},
		},
		{
			id: "incoming-star",
			selector: "node:childless",
			onClickFunction: async (event) => {
				await graph.showStarInAnotherView(event.target, false, Direction.IN);
			},
		},
		{
			id: "outgoing-star",
			selector: "node:childless",
			onClickFunction: async (event) => {
				await graph.showStarInAnotherView(event.target, false, Direction.OUT);
			},
		},
		{ id: "path", selector: "node:childless", onClickFunction: (event) => graph.showPath(graph.getSource(), event.target) },
		{
			id: "spiderworm",
			selector: "node:childless",
			// applying this to several nodes leads to errors and has not been needed
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
						util.deleteClass(event.target);
					},
				},
				{ id: "debug", selector: "node", onClickFunction: (event) => alert(JSON.stringify(event.target.data(), null, 2)) },
			],
		},
		{
			id: "ext",
			selector: "node:childless",
			submenu: [
				{ id: "doublestar", selector: "node", onClickFunction: (event) => graph.applyPerNode(graph.showDoubleStar, event.target) },
				{ id: "starpath", selector: "node", onClickFunction: (event) => graph.showPath(graph.getSource(), event.target, true) },
				{
					id: "circlestar",
					selector: "node",
					// circle star hides all other nodes so we always open it in a new view even if we are not in the main one
					onClickFunction: async (event) => {
						await graph.showStarInAnotherView(event.target, true, Direction.BOTH, true);
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
				{ id: "close-match", selector: "node", onClickFunction: (event) => graph.applyToCollection(graph.showCloseMatch, event.target) },
				{
					id: "show-instances",
					onClickFunction: async (event) => {
						const node = event.target;
						const uri = node.data(NODE.ID);
						const query = `${SPARQL_PREFIXES}
						SELECT ?i (STR(SAMPLE(?label)) AS ?l) {
        ?i a <${uri}>
        OPTIONAL {?i rdfs:label ?label. FILTER(LANGMATCHES(LANG(?label),"${language.getLanguage()}"))}
        } GROUP BY ?i`;
						const bindings = await sparql.select(query).catch(() => null);
						if (!bindings) {
							return;
						}
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
