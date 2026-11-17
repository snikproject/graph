/** RDF helper functions. */

/** Maps short prefix names to their URI expansions.
Sorted by descending prefix length so that longer prefixes are always matched first,
for example "it4it" before "it" and "bb2" before "bb". */
const prefixes: Array<[string, string]> = [
	["meta", "http://www.snik.eu/ontology/meta/"],
	["ciox", "http://www.snik.eu/ontology/ciox/"],
	["it4it", "http://www.snik.eu/ontology/it4it/"],
	["bb2", "http://www.snik.eu/ontology/bb2/"],
	["bb", "http://www.snik.eu/ontology/bb/"],
	["ob", "http://www.snik.eu/ontology/ob/"],
	["he", "http://www.snik.eu/ontology/he/"],
	["it", "http://www.snik.eu/ontology/it/"],
	["skos", "http://www.w3.org/2004/02/skos/core#"],
	["rdfs", "http://www.w3.org/2000/01/rdf-schema#"],
	["rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#"],
	["owl", "http://www.w3.org/2002/07/owl#"],
];

/**
@param  uri - any URI
@returns the URI expansion of the prefix used by the URI if it is defined in this file, otherwise null.
*/
export function longPrefix(uri: string): string | null {
	for (const [, expansion] of prefixes) {
		if (uri.startsWith(expansion)) {
			return expansion;
		}
	}
	return null;
}

/** Shortens a URI if possible using SNIK prefixes defined in this file.
 * @param  uri - a URI, for example "http://www.snik.eu/ontology/meta/Function".
 * @returns the shortened URI, for example "meta:Function". If no prefix applies, return the input as is.
 */
export function short(uri: string): string {
	for (const [prefix, expansion] of prefixes) {
		if (uri.startsWith(expansion)) {
			return prefix + ":" + uri.slice(expansion.length);
		}
	}
	return uri;
}

/** Restores a URI if possible that is shortened using a SNIK prefix to its usual form using prefixes defined in this file.
 * @param  uri - a prefixed URI, for example "meta:Function".
 * @returns the restored URI, for example "http://www.snik.eu/ontology/meta/Function". If no prefix applies, return the input as is.
 */
export function long(uri: string): string {
	for (const [prefix, expansion] of prefixes) {
		if (uri.startsWith(prefix + ":")) {
			return expansion + uri.slice(prefix.length + 1);
		}
	}
	return uri;
}

/**
Returns the subontology a SNIK uri belongs to.
Works for both path style URIs like "http://www.snik.eu/ontology/bb/Function" and fragment style URIs like "http://www.snik.eu/ontology/bb#Function".
@param  uri - a SNIK URI
@returns     the URI of the subontology of the given URI, or null if it is not a SNIK URI with a local name.
*/
export function sub(uri: string): string | null {
	const base = "http://www.snik.eu/ontology/";
	if (!uri.startsWith(base)) {
		return null;
	}
	const rest = uri.slice(base.length);
	const slash = rest.indexOf("/");
	const hash = rest.indexOf("#");
	if (hash >= 0) {
		return base + rest.slice(0, hash);
	}
	if (slash >= 0) {
		return base + rest.slice(0, slash);
	}
	return null;
}
