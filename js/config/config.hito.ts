import hitoView from "./initialView/hito.json" assert { type: "json" };
import { NODE } from "../node";
import { NodeSingular } from "cytoscape";

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
		/**
		 * Finds out which shape to use for any specific node using a map (Citation => rectangle, Classified => ellipse, Catalogue => triangle).
		 * If the node contains any of these words, use the shape.
		 * If the node B contains any of these words and is the rdf:type of node A, then node A also has this shape.
		 * If none of this is true, then the node will be a hexagon.
		 * @param node Node which should have this shape when displayed
		 * @returns A string containing a code for a shape ("rectangle", "ellipse" or "triangle")
		 */
		shape: (node: NodeSingular) =>
			shapeMap.get(getMapKeyIncludedInString(node.data(NODE.ID), shapeMap)) ||
			shapeMap.get(
				// get shape of parent (node rdf:type parent)
				getMapKeyIncludedInString(node.outgoers("[p='http://www.w3.org/1999/02/22-rdf-syntax-ns#type']").targets().first()?.data(NODE.ID) || "", shapeMap)
			) ||
			"hexagon",
		/**
		 * Finds out which shape to use for any specific node using a map.
		 * If the node contains any of the keys in the map, use this color.
		 * If the node B contains any of these words and is the rdf:type of node A, then node A also has this shape.
		 * If none of this is true, then the node will be orange.
		 * @param node Node which should have this colour when displayed (as a NodeSingular cytoscape.js object) OR id of parent of the node (as a string)
		 * @returns A string containing a name of a color
		 */
		color: (node: string | NodeSingular) =>
			colorMap.get(getMapKeyIncludedInString(typeof node === "string" ? node : node.data(NODE.ID), colorMap)) ||
			(typeof node === "object" && // verify that node is object
				"outgoers" in node && // verify that node is NodeSingular
				colorMap.get(
					// get color of parent (node rdf:type parent)
					getMapKeyIncludedInString(node.outgoers("[p='http://www.w3.org/1999/02/22-rdf-syntax-ns#type']").targets().first()?.data(NODE.ID) || "", colorMap)
				)) ||
			"orange",
		colorMap: colorMap,
	},
	sparql: {
		// without trailing slashes!
		endpoint: "https://hitontology.eu/sparql",
		graph: "http://hitontology.eu/ontology",
		instances: true,
		queries: {
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
			  filter(?p!=owl:equivalentClass)
			}
			}`,
		},
	},
};
