/** @packageDocumentation
 * String handling helper methods.*/
import type { EdgeSingular, NodeCollection, NodeSingular } from "cytoscape";
import * as rdf from "./rdf";
import { EDGE } from "./constants";

/** Creates a human readable string of the triple that an link represents.
 *  @param edge - the edge, whose label is determined
 *  @returns a human readable string of the triple that an edge represents. */

export function edgeLabel(edge: EdgeSingular): string {
	return rdf.short(edge.data(EDGE.SOURCE)) + " " + rdf.short(edge.data(EDGE.PROPERTY)) + " " + rdf.short(edge.data(EDGE.TARGET));
}

/**
 * Sum of all character codes in a string.
 * @param s string to be summed
 * @returns sum of all character codes in s
 */
export function stringSum(s: string): number {
	return s
		.split("")
		.map((s) => Number(s.charCodeAt(0)))
		.reduce((na, nb) => na + nb);
}

/**
 *
 * @param source Source node(s) of the edge(s)
 * @param target Target node(s) of the edge(s)
 * @returns
 */
export function smallestEdgeCode(source: NodeSingular | NodeCollection, target: NodeSingular | NodeCollection) {
	return Math.min(...source.edgesTo(target).map((n) => stringSum(n.data(EDGE.PROPERTY_LABEL) as string)));
}
