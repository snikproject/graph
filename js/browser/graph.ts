/** Provides graph operations such as initialization, wayfinding and highlighting.*/
/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "^_" }]*/
import { coloredEdgeStyle, showPropertyStyle, style } from "./style";
import { colorSchemeDay, colorSchemeNight } from "./colorScheme";
import { timer } from "../timer";
import { NODE } from "../utils/constants";
import { progress } from "./progress";
import { View } from "./view";
import type { Core, Collection, NodeCollection, EdgeCollection, NodeSingular } from "cytoscape";
import cytoscape from "cytoscape"; //eslint-disable-line no-duplicate-imports
import log from "loglevel";

/** Specify the direction of edges to show around a given node. */
export enum Direction {
	/** show incoming edges only */
	IN,
	/** show outgoing edges only */
	OUT,
	/** show both incoming and outgoing edges */
	BOTH,
}

/** Cytoscape.js Graph Class with path operations and styling. */
export class Graph {
	cy: Core;
	selectedNode: NodeSingular | null = null;
	starMode: boolean = false;
	matchComponents: Array<Collection> = [];
	pathSource: NodeSingular | null = null;
	container: HTMLElement;
	instancesLoaded: boolean = false;
	/** Creates a new cytoscape graph, assigns it to the #cy container and sets up basic event listeners.
  @param container - parent element
  */
	constructor(container: HTMLElement) {
		const initTimer = timer("graph-init");
		this.container = container;
		this.container.style.backgroundColor = "black"; // required to show background image
		this.cy = cytoscape({
			container,
			//@ts-expect-error concat type
			style: style.style.concat(colorSchemeNight),
			wheelSensitivity: 0.3,
			minZoom: 0.02,
			maxZoom: 7,
		});
		this.cy.on("select", "node", (event) => {
			this.selectedNode = event.target;
		});
		// bind this to the class instance instead of the event source
		const binds = ["resetStyle", "presentUri", "showPath", "showStar", "showWorm", "showDoubleStar", "combineMatch", "showCloseMatch", "newGraph"];
		for (const bind of binds) {
			this[bind] = this[bind].bind(this);
		}
		initTimer.stop();
	}
	/** Returns, whether cumulative search is activated.
	 *  @returns whether cumulative search is activated. */
	cumulativeSearch(): boolean {
		return ((document.getElementById("cumulativeSearchBox") || {}) as any).checked; // menu may not be initialized yet
	}

	/** Show (unhide) the given elements or hide them using visibility: hidden.
    Do not use this for filters as they use other classes to interact properly with shown and hidden elements.
    Does not unhide filtered elements on its own.
    @param eles - the elements to hide
    @param visible - Whether to show or hide the nodes. Defaults to the sometimes implied value of true. */
	static setVisible(eles: Collection | NodeSingular | EdgeCollection | NodeCollection, visible = true): void {
		if (visible) {
			eles.removeClass("hidden");
		} else {
			eles.addClass("hidden");
			eles.removeClass("highlighted");
			const edges = (eles.nodes() as NodeCollection).connectedEdges(); // connected edges may still be visible for a short while until Cytoscape.js refreshes
			edges.addClass("hidden");
			edges.removeClass("highlighted");
		}

		View.getMenu().applyOptions();
	}
	/**
    @param eles - the elements to assign the star mode css class to */
	static starStyle(eles: Collection): void {
		eles.removeClass("hidden");
		//eles.addClass('starmode');
		eles.select();
	}

	/** Removes all highlighting (except selection) and shows all hidden nodes. */
	resetStyle(): void {
		this.starMode = false;
		this.cy.startBatch();
		this.cy.elements().removeClass("highlighted");
		this.cy.elements().removeClass("starmode");
		this.cy.elements().removeClass("hidden");
		// keep "rdf:type"-edges hidden
		Graph.setVisible(this.cy.edges("[p='http://www.w3.org/1999/02/22-rdf-syntax-ns#type']"), false);
		/*
    if(this.pathSource)
    {
      this.pathSource.removeClass('source');
      this.pathSource = null;
    }
    */
		this.cy.endBatch();
	}
	/** Show all nodes and edges on a shortest path between "from " and "to".
    Hide all other nodes except when in star mode.
    @param to - path target node
    @param starPath - whether to show the star around all nodes on the path
    @returns a function that given a source node shows that path if possible and returns whether a path could be found
    */
	showPath(to: NodeSingular, starPath?: boolean) {
		return (from: NodeSingular): boolean => {
			if (!from) {
				log.error("No path source.");
				return false;
			}
			if (from === to) {
				log.warn(`Path source ${from.data(NODE.ID)} equals target.`);
				return false;
			}
			const elements = this.cy.elements(".unfiltered");
			const aStar = elements.aStar({
				root: from,
				goal: to,
			});
			const path = aStar.path;
			if (path) {
				this.cy.startBatch();
				this.cy.add(path);
				if (starPath) {
					const edges = path.connectedEdges(".unfiltered");
					path.merge(edges);
					path.merge(edges.connectedNodes(".unfiltered"));
				}
				Graph.starStyle(path);
				if (this.starMode) {
					// otherwise path might not be seen if it lies fully in an existing star
					// deactivate so that multiple paths can be seen at once when multiplexing
					// this.cy.elements().unselect();
					path.select();
				} else {
					this.starMode = true;
					Graph.setVisible(elements.not(path), false);
				}
				this.cy.endBatch();
			} else {
				if (!this.starMode) {
					this.resetStyle();
				} // keep it as it was before the path operation
				log.warn("No path found!");
				return false;
			}
			return true;
		};
	}
	/** Multiplex star operations.
      @param changeLayout - arrange the given node and its close matches in the center and the connected nodes in a circle around them.
      @param direction - show edges that originate from node, not those that end in it. Optional and defaults to false.
      @returns show star function applied to multiple nodes  */
	showStarMultiplexed(changeLayout: boolean = false, direction?: Direction): (_nodes: NodeCollection) => void {
		return this.multiplex((nodes) => this.showStar(nodes, changeLayout, direction), undefined, true);
	}

	/** Multiplex star operations into a new view.
      @param changeLayout - arrange the given node and its close matches in the center and the connected nodes in a circle around them.
      @param direction - only show edges that originate from node, not those that end in it. Optional and defaults to false.
      @returns show star function applied to multiple nodes  */
	async showStarMultiplexedNew(changeLayout: boolean = false, direction: Direction = Direction.BOTH, alwaysNew: boolean = false) {
		const graph = await this.newGraph(alwaysNew);
		const f = (_node: NodeSingular) => {
			graph.multiplex(
				(nodes: NodeCollection) => graph.showStar(graph.assimilateNodes(nodes), changeLayout, direction),
				graph.assimilateNodes(this.cy.nodes(":selected")),
				true
			)(_node);
			return graph;
		};
		return f;
	}

	/** Highlight the give node and all its directly connected nodes (in both directions).
      Hide all other nodes except when in star mode.
      @param center - node or collection of nodes. center of the star
      @param changeLayout - arrange the given node and it's close matches in the center and the connected nodes in a circle around them.
      @param direction - only show edges that originate from node, not those that end in it. Optional and defaults to false. */
	showStar(center: NodeCollection, changeLayout: boolean = false, direction?: Direction): void {
		console.log("center", center);
		this.cy.startBatch();
		// open 2 levels deep on closeMatch
		let inner = center; // if you don't want to include close match, keep inner at that
		let closeMatchEdges;
		for (
			let innerSize = 0;
			innerSize < inner.size(); // repeat until the close match chain ends

		) {
			innerSize = inner.size();
			closeMatchEdges = inner.connectedEdges(".unfiltered").filter('[pl="closeMatch"]');
			inner = inner.union(closeMatchEdges.connectedNodes(".unfiltered")); // in case there is no close match edge
		}
		let edges;
		switch (direction) {
			case Direction.IN:
				edges = this.cy.elements(".unfiltered").edgesTo(inner);
				break;
			case Direction.OUT:
				edges = inner.edgesTo(".unfiltered");
				break;
			default:
				edges = inner.connectedEdges(".unfiltered");
		}
		const nodes = edges.connectedNodes(".unfiltered");
		const star = inner.union(nodes).union(edges);
		star.merge(star.parent());
		star.merge(star.children());
		// show edges between outer nodes to visible nodes
		const outerNodes = nodes.difference(inner);
		if (changeLayout || !this.starMode) {
			this.starMode = true;
			Graph.setVisible(this.cy.elements().not(star), false);
		}
		console.log("star", star);
		Graph.starStyle(star);
		//const visible = this.cy.nodes(".unfiltered").not(".hidden");
		//Graph.starStyle(visible.edgesWith(visible));
		if (changeLayout) {
			const sorted = nodes.sort((a, b) => {
				const pa = Math.min(
					a.edgesTo(inner).map((n) =>
						n
							.data("pl")
							.split("")
							.reduce((na, nb) => na + nb.charCodeAt(0), 0)
					)
				);
				const pb = Math.min(
					b.edgesTo(inner).map((n) =>
						n
							.data("pl")
							.split("")
							.reduce((na, nb) => na + nb.charCodeAt(0), 0)
					)
				);
				return pa - pb;
			});
			sorted
				.layout({
					name: "concentric",
					fit: true,
					levelWidth: function () {
						return 1;
					},
					minNodeSpacing: 175,
					concentric: function (layoutNode) {
						if (inner.contains(layoutNode)) {
							return 2;
						}
						if (outerNodes.contains(layoutNode)) {
							return 1;
						}
						throw new Error("unexpected node in star");
					},
				})
				.run();
		}
		this.cy.endBatch();
		// connect new nodes with all existing unfiltered visible ones
		Graph.setVisible(outerNodes.edgesWith(this.cy.nodes(".unfiltered").not(".hidden")));

		const visible = this.cy.nodes(":visible");
		if (visible.size() < 100) {
			this.cy.fit(visible, 100);
		}
	}

	/** Show a "spider worm" between two nodes, which combines a star around "to" with a shortest path from "from" to "to".
      Hide all other nodes except when in star mode.
      @param from - path source node
      @param to - path target node, gets a "star" around it as well
      @returns whether a path could be found
      */
	showWorm(from: NodeSingular, to: NodeSingular): boolean {
		this.starMode = true;
		if (this.showPath(to)(from)) {
			this.showStar(to);
			return true;
		}
		return false;
	}
	/** Highlight the given two nodes, directly connected nodes (in both directions) of both of them and a shortest path between the two.
      Hide all other nodes except when in star mode.
      @param to - path target node
      @returns whether a path could be found
      */
	showDoubleStar(to: NodeSingular): boolean {
		const from = this.getSource();
		if (this.showPath(to)) {
			this.showStar(to);

			this.showStar(from);
			return true;
		}
		return false;
	}
	/** Get the equivalent elements in this graph of the given elements from another graph.
	 * @param eles - elements from another graph
	 * @returns equivalent elements that exist in this graph */
	assimilate(eles: Collection): Collection {
		return this.getElementsByIds(eles.map((ele) => ele.id()));
	}

	/** Get the equivalent nodes in this graph of the given nodes from another graph.
	 * @param nodes  - nodes from another graph
	 * @returns equivalent nodes that exist in this graph */
	assimilateNodes(nodes: NodeCollection): NodeCollection {
		return this.getElementsByIds(nodes.map((node) => node.id())) as unknown as NodeCollection;
	}

	/** Get a collection of nodes/edges using a list of their IDs. Works only in this graph.
	 * @param ids - iterable of cytoscape ids
	 * @returns cytoscape collection of elements with those ids */
	getElementsByIds(ids: Iterable<string>): Collection {
		const own = this.cy.collection();
		for (const id of ids) {
			const ele = this.cy.getElementById(id);
			own.merge(ele);
		}
		return own;
	}

	/** Get a collection of nodes/edges using a list of their IDs.
	 * If not existent in this graph, then all others are scanned.
	 * If found, the node or edge is added to the current view and returned.
	 * @param ids - iterable of cytoscape ids
	 * @returns cytoscape collection of elements with those ids */
	getElementsByAllMeansNecessary(ids: Iterable<string>): Collection {
		const own = this.cy.collection();
		for (const id of ids) {
			let ele = this.cy.getElementById(id);
			if (ele.length === 0) {
				// get out the big guns
				// search every view for this id
				for (const view of View.views()) {
					ele = view.state.cy.getElementById(id);
					// if the query does not return an empty collection, we found the element
					if (ele.length !== 0) {
						console.debug("Found!");
						// add it to our graph!
						this.cy.add(ele);
						break;
					}
				}
			}
			own.merge(ele);
		}
		return own;
	}

	/** Returns the start node for all path operations
      @returns the start node for all path operations, or null if none exists. */
	getSource(): NodeSingular | null {
		if (this.pathSource) {
			return this.pathSource;
		}
		if (this.selectedNode) {
			log.debug("Path source not set, using selected node");
			return this.selectedNode;
		}
		return null;
	}
	/** Set the given node as source for all path operations.
      @param node - the new source
      @returns whether node is not null
      */
	setSource(node: NodeSingular): boolean {
		log.debug("Setting path source to " + node.data(NODE.ID));
		if (!node) {
			return false;
		}
		if (node.length !== 1) {
			log.error("Invalid source. Length != 1");
			return false;
		}
		if ((this as any).pathTarget) {
			this.cy.resize(); // may move cytoscape div which it needs to be informed about, else there may be mouse pointer errrors.
		}
		if (this.pathSource) {
			this.pathSource.removeClass("source");
		}
		if (this.pathSource === node) {
			log.info("Toggling path source off.");
			this.pathSource = null;
			return true;
		} // only way to remove path source is to select it again
		this.pathSource = node;
		this.pathSource.addClass("source");
		return true;
	}
	/** Inverts the screen colors in the canvas for day mode. Uses an inverted node js style file to keep node colors.
	 * @param dayScheme - whether the canvas colors should be inverted.
	 * @param coloredEdges - Give every edge-type a certain color.
	 * @param showProperty - Show the property as edge label even on all edges, else only show edge labels on unselected edges.
	 */
	applyStyle(dayScheme: boolean, coloredEdges: boolean, showProperty: boolean): void {
		let baseStyle = style.style as any;
		if (dayScheme) {
			this.container.style.backgroundColor = "white";
			baseStyle = baseStyle.concat(colorSchemeDay);
		} else {
			this.container.style.backgroundColor = "black";
			baseStyle = baseStyle.concat(colorSchemeNight);
		}
		if (coloredEdges) {
			baseStyle = baseStyle.concat(coloredEdgeStyle);
		}
		if (showProperty) {
			baseStyle = baseStyle.concat(showPropertyStyle);
		}
		this.cy.style().fromJson(baseStyle).update();
	}
	/** Center and highlight the given URI.
      @param uri - The URI of a class in the graph.
      @returns whether presenting the URI succeeded */
	presentUri(uri: string): boolean {
		this.cy.zoom(0.6);
		const nodes: NodeCollection = this.cy.elements().nodes().filter(`node[id= "${uri}"]`);
		if (nodes.length < 1) {
			log.warn(`Node not in graph. ${uri} may be available on the SPARQL endpoint but not in the graph.`);
			return false;
		}
		const node = nodes[0];
		if (node.hasClass("filtered")) {
			log.warn(`Node is filtered out. ${uri} is not visible. Please adjust filters.`);
			return false;
		}
		if (node.hasClass("hidden")) {
			log.debug(`Node is hidden. Unhiding ${uri}.`);
			Graph.setVisible(node, true);
			Graph.setVisible(node.edgesWith(this.cy.nodes(":visible")), true);
		}
		if (!(this.starMode || this.cumulativeSearch())) {
			this.resetStyle();
		}
		this.cy.elements().unselect();
		node.select();
		this.cy.center(node);
		return true;
	}
	/** Center and highlight the given URIs.
	 * @param uris - the URIs to present
	 * @param   hideOthers - whether to hide the other nodes
	 * @returns whether presenting the URIs succeeded */
	presentUris(uris: Array<string>, hideOthers: boolean = false) {
		if (uris.length < 1) {
			log.warn("All search results are only available on the SPARQL endpoint but not in the graph.");
			return false;
		}
		if (!this.cumulativeSearch()) {
			this.resetStyle();
		}
		const resultNodes = this.cy
			.elements()
			.nodes()
			.filter((node) => {
				return uris.includes(node.data(NODE.ID));
			});
		if (hideOthers) {
			Graph.setVisible(this.cy.elements(), false);
			Graph.setVisible(resultNodes.union(resultNodes.edgesTo(resultNodes)), true);
			this.starMode = true;
		}
		this.cy.elements().unselect();
		resultNodes.select();
		resultNodes.edgesTo(resultNodes).select();
		this.cy.fit(this.cy.elements(":selected"));
		return true;
	}
	/**  Multiplex takes a function that takes exactly one parameter in the form of a a single cytoscape Node, such as a star.
	 * It returns a function that executes the given function one or more times with different input based on the following criteria:
	 * If the nodes parameter is given, then multiplex uses it as input.
	 * For example multiplexing a star on a collection of nodes will execute that star for each node in the collection.
	 * If the nodes parameter is not given, but more than one node is selected, then multiplex uses the nodes selected in this graph as input.
	 * If the direct parameter is truthy then f will be called exactly once directly passing in the input as single parameter instead of looping over it.
	 * If the nodes parameter is not given and the set of selected nodes has size 0 or 1, then the given function is executed with the original input.
	 * Whatever happens, the singular input parameter of the returned function is always included as well.
	 * TODO: This function is hard to maintain, simplify if possible.
	 * @param f - a function that accepts a single node
	 * @param nodes - The nodes, each of which will be passed as parameter to a separate call of the given function. Can be null or undefined,
	 * @param direct - whether the input is a cytoscape collection that can be passed directly into the function without looping, which can be much faster if possible.
	 * @returns the function described above. */
	multiplex(f: any, nodes?: NodeCollection, direct?: boolean) {
		//multiplex(f: (node?: NodeSingular | NodeCollection) => void, nodes?: NodeCollection, direct?: boolean) {
		return (ele?: NodeSingular) => {
			const selected = this.cy.nodes(":selected");
			let collection = nodes;
			// nodes parameter is preferred
			if (!nodes && selected.size() > 1) {
				collection = selected;
			}
			if (collection) {
				if (ele) {
					collection = collection.union(ele);
				}
				log.debug("multiplexing of " + collection.size() + " elements (direct=" + direct + ")");
				if (direct) {
					f(collection);
				} else {
					for (let i = 0; i < collection.length; i++) {
						f(collection[i]);
					}
				}
			} else {
				f(ele);
			}
		};
	}
	/** Move all matching nodes together.
	 * @param distance - the distance between them */
	moveAllMatches(distance: number): void {
		for (let i = 0; i < this.matchComponents.length; i++) {
			const comp = this.matchComponents[i];
			if (comp.length === 1) {
				continue;
			}
			this.moveNodes(comp.nodes(), distance);
		}
	}
	/**
	 * position in a circle around the first node
	 * @param nodes - the nodes to position
	 * @param distance - the radius of the circle */
	moveNodes(nodes: NodeCollection, distance: number): void {
		nodes.positions(nodes[0].position());
		for (let j = 1; j < nodes.length; j++) {
			nodes[j].shift({ x: distance * Math.cos((2 * Math.PI * j) / (nodes.length - 1)), y: distance * Math.sin((2 * Math.PI * j) / (nodes.length - 1)) });
		}
	}
	/** Sets whether close matches are grouped in compound nodes.
	 * @param enabled - Whether to activate or deactivate combine match mode. **/
	async combineMatch(enabled: boolean): Promise<void> {
		await progress(() => {
			if (!enabled) {
				this.cy.startBatch();
				this.cy.nodes(":child").move({ parent: null });
				this.cy.nodes("[id ^= 'parent']").remove();
				this.matchComponents.length = 0;
				this.cy.endBatch();
				return;
			}
			this.cy.startBatch();
			// Can be calculated only once per session but then it needs to be synchronized with in-visualization ontology edits.
			const matchEdges = this.cy.edges('[pl="closeMatch"]').filter(".unfiltered").not(".hidden");
			const matchGraph = this.cy.nodes(".unfiltered").not(".hidden").union(matchEdges);
			if (!(this as any).moveMatchNotified && this.cy.nodes(":visible").size() > 1000) {
				log.info("Combining Matches. Consider using Move Matches Nearby or Move Matches on top of each other.");
				(this as any).moveMatchNotified = true;
			}
			{
				this.matchComponents.length = 0;
			}
			this.matchComponents.push(...matchGraph.components());
			for (let i = 0; i < this.matchComponents.length; i++) {
				const comp = this.matchComponents[i];
				if (comp.length === 1) {
					continue;
				}
				const id = "parent" + i;
				const labels = {};
				let nodes = comp.nodes();
				for (let j = 0; j < nodes.length; j++) {
					const l = nodes[j].data("l");
					for (const key in l) {
						if (!labels[key]) {
							labels[key] = new Set();
						}
						l[key].forEach((ll) => labels[key].add(ll));
					}
				}
				for (const key in labels) {
					labels[key] = [[...labels[key]].reduce((a, b) => a + ", " + b)];
				}
				const priorities = ["bb", "ob", "he", "it4it", "ciox", "bb2"];
				const priority = (source) => {
					let p = priorities.indexOf(source);
					if (p === -1) {
						p = 99;
					}
					return p; // prevent null value on prefix that is new or outside of SNIK
				};
				nodes = nodes.sort((a, b) => priority(a.data(NODE.SOURCE)) - priority(b.data(NODE.SOURCE))); // cytoscape collection sort is not in place
				this.cy.add({
					group: "nodes",
					data: { id: id, l: labels },
				});
				for (let j = 0; j < nodes.length; j++) {
					nodes[j].move({ parent: id });
				}
			}
			this.cy.endBatch();
		});
	}

	/**Show close matches of the given nodes.
	 * @param nodes - the nodes whose close matches are shown */
	showCloseMatch(nodes: NodeCollection): void {
		const edges = nodes.connectedEdges(".unfiltered").filter('[pl="closeMatch"]'); // ,[pl="narrowMatch"],[pl="narrowMatch"]
		const matches = edges.connectedNodes(".unfiltered");
		log.debug(
			`Showing close matches of ${nodes.length} nodes ${JSON.stringify(nodes.map((x) => x.id()))}.\nResults: ${JSON.stringify(matches.map((x) => x.id()))}`
		);
		const eles = matches.union(edges);
		Graph.setVisible(eles, true);
		Graph.starStyle(eles);
	}

	/** Create and return a new graph if the option is set to create star operations in a new view.
	 *  @returns this iff the option to create stars in a new view is unset, a new view's graph if it is set */
	async newGraph(alwaysNew: boolean = false): Promise<Graph> {
		if (!alwaysNew && this !== View.mainView.state.graph) {
			return this;
		} // span new views only from the main view
		//const view = new View(true, title);
		const view = new View(true);
		await view.initialized;
		return view.state.graph;
	}
}
