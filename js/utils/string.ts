/** @packageDocumentation
 * String handling helper methods.*/
import type { EdgeSingular } from "cytoscape";
import * as rdf from "../rdf";
import { EDGE } from "./constants";

/**
 * Limit the input string to the maximum length. If it is longer, it will get cut and have two dots appended to exactly achieve the maximum length.
 * @param  s - potentially long input string to shorten
 * @param maxLength - maximum output string length
 * @returns the abbreviated input string */
export function abbrv(s: string, maxLength: number = 25): string {
	if (s.length < maxLength) {
		return s;
	}
	return s.substring(0, maxLength - 2) + "..";
} /** Creates a human readable string of the triple that an link represents.
 *  @param edge - the edge, whose label is determined
 *  @returns a human readable string of the triple that an edge represents. */

export function edgeLabel(edge: EdgeSingular): string {
	return rdf.short(edge.data(EDGE.SOURCE)) + " " + rdf.short(edge.data(EDGE.PROPERTY)) + " " + rdf.short(edge.data(EDGE.TARGET));
}
