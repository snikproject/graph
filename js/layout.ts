/**
Due to JavaScript being a slow mostly single-threaded language with no really fast layouting library available, layouting the full 4000+ node graph can take a minute or more depending on the client PC.
After the first time, the layout is cached and reused, until major changes occur in the graph.
If a breakthrough occurs in JavaScript graph layouting, update here and possibly remove cache.
*/
import { timer } from "./timer";
import { NODE } from "./node";
import { config } from "./config";
import log from "loglevel";
import type { Core, ElementDefinition, LayoutOptions, NodeCollection, Layouts, Position } from "cytoscape";
import cytoscape from "cytoscape"; //eslint-disable-line no-duplicate-imports
import cytoscapeeuler from "cytoscape-euler";
cytoscape.use(cytoscapeeuler);

const ANIMATE_THRESHOLD = 500;

let activeLayout: Layouts;

/**
@param layoutName - Cytoscape.js layout name
@param subs - the subontology identifiers included in the graph. Used to retrieve the correct layout later.
@param separateSubs - Whether to separate the graph based on the subontologies.
@returns the storage name coded by the layout and the subontologies
@example storageName("euler",new Set(["meta","ob","bb"]));
*/
function storageName(layoutName: string, subs: Array<string>, separateSubs: boolean = false): string {
	return (
		"layout" +
		layoutName +
		subs
			.sort()
			.toString()
			.replace(/[^a-z]/g, "") +
		!!separateSubs
	);
}

/** Returns an array containing the positions of the given nodes
@param nodes - the nodes whose positions are returned
@returns an array containing the positions of the given nodes
@example
// returns [["http://www.snik.eu...",\{"x":0,"y":0\}],...]
positions(cy.nodes());
*/
export function positions(nodes: NodeCollection): Array<Array<number>> {
	const pos: Array<Array<any>> = [];
	for (let i = 0; i < nodes.size(); i++) {
		const node = nodes[i];
		pos.push([node.data(NODE.ID), node.position()]);
	}
	return pos;
}

/** @param nodes - the nodes whose center is returned
@returns the center point of the nodes */
function center(nodes: NodeCollection): Position {
	const c = { x: 0.0, y: 0.0 };
	for (let i = 0; i < nodes.length; i++) {
		const pos = nodes[i].position();
		c.x += pos.x;
		c.y += pos.y;
	}
	c.x /= nodes.length;
	c.y /= nodes.length;
	return c;
}

/** Layouts all visible nodes in a graph. Saves to cache but doesn't load from it, use {@link runCached} for that.
@param cy - the Cytoscape.js graph to run the layout on
@param layoutConfig - the layout configuration, which includes the layout name and options
@param  subs - Set of subontologies. If the subs are not given the layout still works but it is not saved.
@param  separateSubs - Whether to separate the graph based on the subontologies.
@param  save - Whether to save the layout on local storage.
@returns whether the layout could successfully be applied. Does not indicate success of saving to cache.
@example
```
run(cy,{"name":"grid"},new Set(["meta","ciox"]))
```
*/
export async function run(cy: Core, layoutConfig: LayoutOptions, subs?: Array<string>, separateSubs: boolean = false, save: boolean = false): Promise<boolean> {
	if (cy.nodes().size() === 0) {
		log.warn("layout.js#run: Graph empty. Nothing to layout.");
		return false;
	}
	const layoutTimer = timer("layout");
	if (separateSubs) {
		const sources: Set<ElementDefinition> = new Set();
		const virtualEdges: Array<ElementDefinition> = [];

		const nodes = cy.nodes();
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			const source = node.data(NODE.SOURCE);
			if (source) {
				if (!sources.has(source)) {
					cy.add({ group: "nodes", data: { id: source, mass: 400, type: "virtual" } });
					sources.add(source);
				}
				virtualEdges.push({ group: "edges", data: { source: node.data(NODE.ID), target: source, springLength: 180 } });
			}
		}
		log.debug("Separate subontologies checked");
		log.debug(`Adding ${virtualEdges.length} virtual edges.`);
		cy.add(virtualEdges);
	} else {
		log.debug("Separate subontologies unchecked");
	}
	activeLayout && activeLayout.stop();

	let elements;
	let partLayout; // only change the positions of the selected nodes, keep the other ones in place
	if (cy.nodes(":selected").size() > 1) {
		elements = cy.elements(":selected");
		partLayout = true;
	} else {
		elements = cy.elements(":visible");
		partLayout = false;
	}
	let oldCenter;
	// Because it is a partial graph, the relation to the whole graph should still be discernable. That is why we preserve the center position of that partial graph and restore it later.
	if (partLayout) {
		oldCenter = center(elements.nodes());
	}

	const animate = elements.size() > ANIMATE_THRESHOLD && typeof window !== "undefined"; // can't animate from node
	const configCopy = { ...layoutConfig, animate };
	{
		activeLayout = elements.layout(configCopy);
	}
	activeLayout.on("layoutstop", () => {
		if (partLayout) {
			const newCenter = center(elements.nodes());
			// move the nodes so that the center is at the same spot as before
			elements.nodes().shift({ x: oldCenter.x - newCenter.x, y: oldCenter.y - newCenter.y });
		}
		layoutTimer.stop();
		if (subs && separateSubs) {
			const virtualNodes = cy.nodes("[type='virtual']");
			log.debug(`Removing ${virtualNodes.length} virtual nodes.`);
			cy.remove(virtualNodes); // connected edges should go away automatically
		}
		if (subs && save) {
			if (typeof localStorage === "undefined") {
				log.warn("web storage not available, could not write to cache.");
				return true;
			}
			const pos = positions(cy.nodes());
			const name = storageName(layoutConfig.name, subs, separateSubs);
			localStorage.setItem(name, JSON.stringify(pos));
			log.info("Replaced layout cache.");
		}
	});
	const promise = activeLayout.promiseOn("layoutready");
	activeLayout.run();
	await promise;
	return true;
}

/** Applies a preset layout matching the node id's to the first element of each subarray in pos. Nodes without matching entry
in pos are set to position `{x:0,y:0}`, positions without matching node id are ignored.
@param cy - the Cytoscape.js graph to apply the positions on, node id's need to match those in the given positions
@param pos - an array of arrays, each of which contains the positions for a node id
@returns whether the layout could be successfully applied
@example `presetLayout(cy,[["http://www.snik.eu...",{"x":0,"y":0}],...]);`
*/
export async function presetLayout(cy: Core, pos: Array<Position>): Promise<boolean> {
	const map = new Map(pos as any);
	let hits = 0;
	let misses = 0;
	const layoutConfig = {
		name: "preset",
		fit: true,
		positions: (node) => {
			let position;
			if ((position = map.get(node.data(NODE.ID)))) {
				hits++;
				return position;
			}
			misses++;
			return { x: 0, y: 0 };
		},
	};
	const status = await run(cy, layoutConfig);
	if (misses > 0 || hits < positions.length) {
		log.debug(`...${hits}/${cy.nodes().size()} node positions set. ${pos.length - hits} superfluous layout positions .`);
		const precision = hits / pos.length;
		const recall = hits / cy.nodes().size();
		if (precision < config.layoutCacheMinPrecision) {
			log.warn(`Precision of ${precision} less than minimal required precision of ${config.layoutCacheMinPrecision}.`);
			return false;
		}
		if (recall < config.layoutCacheMinRecall) {
			log.warn(`Recall of ${recall} less than minimal required of recall of ${config.layoutCacheMinRecall}.`);
			return false;
		}
	} else {
		log.debug("...layout applied with 100% overlap.");
	}
	if (hits === 0) {
		return false;
	}
	return status;
}

export interface LayoutConfig {
	name: string;
}

/** Cached version of {@link run}.
@param cy - the Cytoscape.js graph to run the layout on
@param layoutConfig - the layout configuration, which includes the layout name and options
@param subs - Set of subontologies. If the subs are not given the layout still works but it is not cached.
@param separateSubs - Whether to separate the graph based on the subontologies.
@returns whether the layout could successfully be applied. Does not indicate success of loading from cache, in which case it is calculated anew.
*/
export async function runCached(
	cy: cytoscape.Core,
	layoutConfig: cytoscape.LayoutOptions,
	subs: Array<string>,
	separateSubs: boolean = false
): Promise<boolean> {
	if (typeof localStorage === "undefined") {
		log.error("Web storage not available, could not access browser-based cache.");
		return run(cy, layoutConfig, subs, separateSubs, false);
	}
	const name = storageName(layoutConfig.name, subs, separateSubs);
	// web storage
	const cacheItem = localStorage.getItem(name);
	if (cacheItem) {
		// cache hit
		try {
			const pos = JSON.parse(cacheItem);
			log.debug(`Loaded layout from cache, applying ${pos.length} positions...`);
			const status = await presetLayout(cy, pos);
			if (status) {
				return true;
			}
			log.warn("Could not apply layout to active graph, recalculating layout...");
		} catch (e) {
			log.warn("Could not load cache item, recalculating layout...", e);
		}
	} // cache miss
	else {
		log.warn("Layout not in cache, recalculating layout...");
	}
	return run(cy, layoutConfig, subs, separateSubs, true);
}

/** Very fast but useless for most purposes except for testing.*/
export const grid = { name: "grid" };

/**
 *  @param edge -- any edge
 *  @returns  the preferred spring length of an edge
 */
function springLength(edge: cytoscape.EdgeSingular) {
	const len = edge.data("springLength");
	if (len) {
		return len;
	}
	return 800;
}

/**Fastest (but still slow) force directed Cytoscape.js layout found.*/
export const euler = {
	/*eslint no-unused-vars: "off"*/
	name: "euler",
	springLength: (edge) => springLength(edge),
	animate: true,
	refresh: 50,
	maxSimulationTime: 40000,
	maxIterations: 500,
	timeStep: 80,
	randomize: true,
	movementThreshold: 1,
	fit: false, // center and zoom after so that it fits in the view
	mass: (node) => node.data("mass") | 40,
};

/**Fastest (but still slow) force directed Cytoscape.js layout found.*/
export const eulerTight = {
	/*eslint no-unused-vars: "off"*/
	name: "euler",
	springLength: 40,
	animate: false,
	maxSimulationTime: 10000,
	maxIterations: 100,
	timeStep: 80,
	refresh: 50,
	randomize: false,
	movementThreshold: 1,
	fit: false,
	mass: 40,
};

/** Creates a euler layout with custom spring length. */
/*
export function eulerVariable(len)
{
  const layout =
  {
    name: "euler",
    springLength: len,
    animate: false,
    refresh: 50,
    randomize: false,
    movementThreshold: 1,
    fit:true,
    mass: 40,
  };
  return layout;
}
*/

/** Layout for compound graphs */
export const cose: LayoutOptions = {
	name: "cose",
	animate: true,
	refresh: 50,
	numIter: 500,
	initialTemp: 1000,
	nestingFactor: 1.01,
	randomize: false,
	fit: true,
};
