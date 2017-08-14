// SPARQL graphs

//** RDF helper graphs that don't contain subontologies but triples belonging to any of them. */
export const helper = () => new Set(["virtual","limes-exact"]);
//** Subontologies of the SNIK ontology */
export const subs =  () => new Set(["meta","ob","bb","he","it","it4it"]);
export const all =  () => new Set([...helper(),...subs()]);

//export const active = new Set(subs); // node throws an error here, why?
