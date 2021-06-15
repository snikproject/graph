/** RDF helper functions.
Order important! substrings of other prefixes must come later. */
const prefixes = [
	["meta", "http://www.snik.eu/ontology/meta/"],
	["bb", "http://www.snik.eu/ontology/bb/"],
	["ob", "http://www.snik.eu/ontology/ob/"],
	["he", "http://www.snik.eu/ontology/he/"],
	["ciox", "http://www.snik.eu/ontology/ciox/"],
	["it4it", "http://www.snik.eu/ontology/it4it/"],
	["it", "http://www.snik.eu/ontology/it/"],
	["skos", "http://www.w3.org/2004/02/skos/core#"],
	["rdfs", "http://www.w3.org/2000/01/rdf-schema#"],
	["rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#"],
	["owl", "http://www.w3.org/2002/07/owl#"],
];

/**
 * @param  uri - any URI
 * @returns the prefix part of a URI if it is defined in this file.
 */
export function longPrefix(uri: string) {
	for (const prefix of prefixes) {
		if (uri.startsWith(prefix[1])) {
			return prefix[1].replace(/\/$/, "");
		}
	}
	return uri;
}

/** Shortens a URI if possible using SNIK prefixes defined in this file.
 * @param  uri - a URI, for example "http://www.snik.eu/ontology/meta/Function".
 * @returns the shortened URI, for example "meta:Function". If no prefix applies, return the input as is.
 */
export function short(uri: string): string {
	for (const prefix of prefixes) {
		uri = uri.replace(prefix[1], prefix[0] + ":");
	}
	return uri;
}

/** Restores a URI if possible that is shortened using a SNIK prefix to its usual form using prefixes defined in this file.
 * @param  uri - a prefixed URI, for example "meta:Function".
 * @returns the restored URI, for example "http://www.snik.eu/ontology/meta/Function".  If no prefix applies, return the input as is.
 */
export function long(uri: string): string {
	for (const prefix of prefixes) {
		uri = uri.replace(prefix[0] + ":", prefix[1]);
	}
	return uri;
}

/**
 * Returns the subontology a SNIK uri belongs to.
 * @param  uri - a SNIK URI
 * @returns     the subontology of the URI
 */
export function sub(uri: string): string {
	if (uri.startsWith("http://www.snik.eu/ontology/")) {
		return uri.replace(/\/[^/]*$/, "");
	}
	{
		return null;
	}
}
