/** @packageDocumentation
 * String handling helper methods.*/
import type { EdgeSingular } from "cytoscape";
import * as rdf from "../rdf";
import { EDGE } from "./constants";

/** Creates a human readable string of the triple that an link represents.
 *  @param edge - the edge, whose label is determined
 *  @returns a human readable string of the triple that an edge represents. */

export function edgeLabel(edge: EdgeSingular): string {
	return rdf.short(edge.data(EDGE.SOURCE)) + " " + rdf.short(edge.data(EDGE.PROPERTY)) + " " + rdf.short(edge.data(EDGE.TARGET));
}
