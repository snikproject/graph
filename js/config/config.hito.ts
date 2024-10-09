import hitoView from "./initialView/hito.json" assert { type: "json" };
import { NODE } from "../node";

let shapeMap: Map<string, string> = new Map([
	["Citation", "rectangle"],
	["Classified", "ellipse"],
	["Catalogue", "triangle"],
]);

const colorMap = new Map([
	["UserGroup", "grey"],
	["Feature", "green"],
	["EnterpriseFunction", "yellow"],
	["ApplicationSystemType", "red"],
	["OrganizationalUnit", "blue"],
]);

function getMapKeyIncludedInString<V>(search: string, map: Map<string, V>): string | undefined {
	for (const key of map.keys()) {
		if (search.includes(key)) {
			return key;
		}
	}
	return undefined;
}

export default {
	id: "hito",
	name: "HITO",
	initialView: hitoView,
	isSnik: false,
	style: {
		shape: (node) => shapeMap.get(getMapKeyIncludedInString(node.data(NODE.ID), shapeMap)) || "hexagon",
		color: (node) => colorMap.get(getMapKeyIncludedInString(node.data(NODE.ID), colorMap)) || "orange",
		colorMap: colorMap,
	},
	sparql: {
		// without trailing slashes!
		endpoint: "https://hitontology.eu/sparql",
		graph: "http://hitontology.eu/ontology",
		instances: true,
		queries: {
			/*
			 * Right now, this query defines nodes as resources with instances - Not the most elegant, but the only relatively simple viable option I saw.
			 * This works because every class in the metamodel has (should have) instances.
			 * ?c a ?type: to rule out owl/rdfs classes for literals and the like we use in HITO (like http://www.w3.org/2000/01/rdf-schema#Datatype)
			 */
			// only nodes with labels are loaded
			nodes: (from) => `
			PREFIX ov: <http://open.vocab.org/terms/>
			SELECT DISTINCT(?c)
			GROUP_CONCAT(DISTINCT(CONCAT(?l,"@",lang(?l)));separator="|") AS ?l
			SAMPLE(?st) AS ?st
			SAMPLE(?inst) AS ?inst
			?src
			${from}
			{
			  ?c rdfs:label ?l.
			  ?c a owl:Class.
			  OPTIONAL {?inst a ?c.}
			  OPTIONAL {?src ov:defines ?c.}
			  OPTIONAL {?c rdf:type ?st. FILTER(?st!=owl:Class)}
			}
			`,
			triples: (from, fromNamed, virtualTriples, instances) => `
			select  ?c ?p ?d ?g (MIN(?ax) as ?ax)
			${from}
			${fromNamed}
			{
			  {?c a owl:Class.} ${instances ? " UNION {?c a [a owl:Class].}" : ""}
			  {?d a owl:Class.} ${instances ? " UNION {?d a [a owl:Class].}" : ""}			  
			{
			?p rdfs:domain ?c.
			?p rdfs:range ?d.
			FILTER(CONTAINS(STR(?c),"hitontology.eu"))
			FILTER(CONTAINS(STR(?d ),"hitontology.eu"))
			}
			UNION
			{
			  graph ?g {?c ?p ?d.} 
			  filter(?p!=rdf:type)
			  filter(?p!=owl:equivalentClass)
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
