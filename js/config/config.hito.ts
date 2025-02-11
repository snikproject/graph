import hitoView from "./initialView/hito.json" assert { type: "json" };
import { NODE } from "../utils/constants";
import type { NodeSingular } from "cytoscape";

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

/**
 * Finds the first key of the map included in the search string.
 * @param search String in which to search for keys
 * @param map Map whose keys to use
 * @returns The first key found which the string includes
 */
function getMapKeyIncludedInString<V>(search: string, map: Map<string, V>): string | undefined {
	for (const key of map.keys()) {
		if (search.includes(key)) {
			return key;
		}
	}
	return undefined;
}

const colorLegend = () => Array.from(colorMap.entries()).reduce((ac, [n, c]) => ac + ` <span style='color:${c}'>&#9632;</span> ${n}`, "");

export default {
	id: "hito",
	name: "HITO",
	legend: "<span>&#9632; Citation</span> <span>&#9650; Classification</span> <span>&#9679; Catalogue</span> " + colorLegend(),
	title: "Health IT Ontology Graph",
	initialView: hitoView,
	snik: null,
	links: {
		homepage: "https://www.hitontology.eu/",
		metamodel: "https://www.hitontology.eu/public/2024-05-hito_diagram.svg",
		feedbackOntology: "https://github.com/hitontology/ontology/issues",
		featureRequest: "https://github.com/snikproject/graph/issues/new?assignees=KonradHoeffner&labels=feature&projects=&template=featurerequest.yml",
		youtube: null,
		sparqlEndpoint: "http://www.hitontology.eu/sparql",
		rdfBrowser: "http://www.hitontology.eu/ontology",
	},
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
			//
			/**
			 * Get SPARQL Query which loads the list of nodes from which all triples are formed.
			 * Only nodes with labels which are an owl:Class and their instances are loaded.
			 * @param from "FROM ..." SPARQL clause
			 * @returns A string containing a SPARQL query which still needs to be executed
			 */
			nodes: (from: string): string => `
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
			/**
			 * Loads all triples from HITO which we display.
			 * @param from "FROM ..." SPARQL clause
			 * @param fromNamed "FROM NAMED ..." SPARQL clause
			 * @param virtualTriples (ignored here)
			 * @param instances Whether or not to include instances in the fetched triples. Highly recommended for HITO.
			 * @returns A string containing a SPARQL query which still needs to be executed
			 */
			triples: (from: string, fromNamed: string, virtualTriples: boolean, instances: boolean): string => `
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
			FILTER(CONTAINS(STR(?d),"hitontology.eu"))
			}
			UNION
			{
			  graph ?g {?c ?p ?d.} 
			  filter(?p!=owl:equivalentClass)
			}
			}`,
		},
	},
	filter: [],
};
