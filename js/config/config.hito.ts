import hitoView from "./initialView/hito.json" assert { type: "json" };

const prefixes = ["UserGroup", "Feature", "EnterpriseFunction", "ApplicationSystem", "OrganizationalUnit"];

const citationTypes = prefixes.map((p) => p + "Citation");
const classifiedTypes = prefixes.map((p) => p + "Classified");
const catalogueTypes = prefixes.map((p) => p + "Catalogue");
console.log(citationTypes);

let shapeMap: Map<string, string> = new Map();
for (const p in citationTypes) {
	shapeMap.set(p, "rectangle");
}
for (const p in classifiedTypes) {
	shapeMap.set(p, "ellipse");
}
for (const p in catalogueTypes) {
	shapeMap.set(p, "triangle");
}

const colorMap = new Map([
	["UserGroup", "grey"],
	["Feature", "green"],
	["EnterpriseFunction", "yellow"],
	["ApplicationSystem", "red"],
	["OrganizationalUnit", "blue"],
]);

export default {
	id: "hito",
	name: "HITO",
	initialView: hitoView,
	isSnik: false,
	style: {
		shape: (node) => shapeMap.get(node.data("super")) || shapeMap.get(node.data("?c")) || "hexagon",
		color: (node) => colorMap.get(node.data("pre")) || "orange",
		colorMap: colorMap,
	},
	sparql: {
		// without trailing slashes!
		endpoint: "https://hitontology.eu/sparql",
		graph: "http://hitontology.eu/ontology",
		instances: false,
		queries: {
			/*
			 * Right now, this query defines nodes as resources with instances - Not the most elegant, but the only relatively simple viable option I saw.
			 * This works because every class in the metamodel has (should have) instances.
			 * ?c a ?type: to rule out owl/rdfs classes for literals and the like we use in HITO (like http://www.w3.org/2000/01/rdf-schema#Datatype)
			 */
			nodes: (from) => `
			PREFIX ov: <http://open.vocab.org/terms/>
			SELECT DISTINCT(?c)
			GROUP_CONCAT(DISTINCT(CONCAT(?l,"@",lang(?l)));separator="|") AS ?l
			SAMPLE(?st) AS ?st
			?src
			${from}
			SAMPLE(?inst) AS ?inst
			{
			  ?c a ?type.
			  OPTIONAL {?inst a ?c.}
			  OPTIONAL {?src ov:defines ?c.}
			  OPTIONAL {?c rdf:type ?st. FILTER(?st!=owl:Class)}
			  OPTIONAL {?c rdfs:label ?l.}
			}
			`,
			triples: (from, fromNamed, virtualTriples, instances) => `
			select  ?c ?p ?d ?g (MIN(?ax) as ?ax)
			${from}
			${fromNamed}
			{
			  graph ?g {?c ?p ?d.}
			  {?instA a ?c.} ${instances ? " UNION {?c a [a owl:Class].}" : ""}
			  {?instB a ?d.} ${instances ? " UNION {?d a [a owl:Class].}" : ""}
			  filter(?p!=rdf:type)
			  FILTER( contains(str(?g), "hitontology.eu") )
			  OPTIONAL
			  {
				?ax a owl:Axiom;
				owl:annotatedSource ?c;
				owl:annotatedProperty ?p;
				owl:annotatedTarget ?d.
			  }
			}`,
		},
	},
	/**nodeQuery: (FROM) => `
SELECT REPLACE(STR(?c),"http://hitontology.eu/ontology/","") AS ?c
GROUP_CONCAT(DISTINCT(CONCAT(?l,"@",lang(?l)));separator="|") AS ?l
REPLACE(STR(SAMPLE(?class)),"http://hitontology.eu/ontology/","") AS ?class
REPLACE(REPLACE(REPLACE(?class,"Classified",""),"Citation",""),"Catalogue","") AS ?pre
REPLACE(STR(SAMPLE(?super)),"http://hitontology.eu/ontology/","") AS ?super
FROM <http://hitontology.eu/ontology>
{
	{?c a owl:Class.} UNION {?c a [a owl:Class].}
	?c a ?class
	OPTIONAL {?c rdfs:label ?l.}
	OPTIONAL {?class rdfs:subClassOf ?super.}
}`,*/
};
