import type { NodeSingular } from "cytoscape";
import { NODE } from "../node";
import snikView from "./initialView/snik.json" assert { type: "json" };

const shapeMap = new Map([
	[NODE.SUBTOP_ENTITY_TYPE, "rectangle"],
	[NODE.SUBTOP_ROLE, "ellipse"],
	[NODE.SUBTOP_FUNCTION, "triangle"],
	["http://www.snik.eu/ontology/meta/EntityType", "rectangle"],
	["http://www.snik.eu/ontology/meta/Role", "ellipse"],
	["http://www.snik.eu/ontology/meta/Function", "triangle"],
]);

const colorMap = new Map([
	["ciox", "rgb(80,255,250)"],
	["meta", "rgb(255,80,80)"],
	["ob", "rgb(255,173,30)"],
	["bb", "rgb(30,152,255)"],
	["he", "rgb(150,255,120)"],
	["it", "rgb(204, 0, 204)"],
	["it4it", "rgb(255, 255, 0)"],
	["bb2", "rgb(0, 255, 255)"],
]);

export default {
	id: "snik",
	name: "SNIK",
	initialView: snikView,
	snik: {
		defaultSubOntologies: ["meta", "bb", "ob", "ciox", "he", "it4it", "bb2"],
		//allSubOntologies: ["meta", "bb", "ob", "ciox", "he", "he-unconsolidated", "it4it", "bb2"],
		helperGraphs: ["limes-exact", "match"],
		center: "http://www.snik.eu/ontology/bb/ChiefInformationOfficer", // center node for initial star, only used when there is no initial view
		centerDepth: 1, // number of successive star operations on all visible nodes, starting with center
	},
	links: {
		homepage: "https://www.snik.eu/",
		metamodel: "https://www.snik.eu/public/SNIK_Metamodell_V10.svg",
		feedbackOntology: "https://github.com/snikproject/ontology/issues",
		featureRequest: "https://github.com/snikproject/graph/issues/new?assignees=KonradHoeffner&labels=feature&projects=&template=featurerequest.yml",
		youtube: "https://www.youtube.com/channel/UCV8wbTpOdHurbaHqP0sAOng/featured",
		sparqlEndpoint: "http://www.hitontology.eu/sparql",
		rdfBrowser: "http://www.hitontology.eu/ontology",
	},
	style: {
		shape: (node: NodeSingular) => shapeMap.get(node.data(NODE.SUBTOP)) || shapeMap.get(node.data(NODE.ID)) || "hexagon",
		color: (node: string | NodeSingular) => {
			let key;
			// format: http://www.snik.eu/ontology/bb => must be trimmed
			if (typeof node === "string") {
				key = node;
			} else {
				const subonto: string = node.data(NODE.SOURCE);
				const cutoff = subonto?.lastIndexOf("/");
				key = subonto?.substring(cutoff + 1);
			}
			return colorMap.get(key) || "orange";
		},
		colorMap: colorMap,
	},
	// overrides config
	sparql: {
		// without trailing slashes!
		endpoint: "https://www.snik.eu/sparql",
		graph: "http://www.snik.eu/ontology",
		instances: false,
		queries: {
			nodes: (from) => `
			PREFIX ov: <http://open.vocab.org/terms/>
			PREFIX meta: <http://www.snik.eu/ontology/meta/>
			SELECT DISTINCT(?c)
			GROUP_CONCAT(DISTINCT(CONCAT(?l,"@",lang(?l)));separator="|") AS ?l
			SAMPLE(?st) AS ?st
			?src
			SAMPLE(?inst) AS ?inst
			${from}
			{
			  ?c a [rdfs:subClassOf meta:Top].
			  OPTIONAL {?src ov:defines ?c.}
			  OPTIONAL {?c rdf:type ?st. FILTER(?st!=owl:Class)}
			  OPTIONAL {?c rdfs:label ?l.}
			  OPTIONAL {?inst a ?c.}
			}`,
			triples: (from, fromNamed, virtualTriples, instances) => `PREFIX sniko: <http://www.snik.eu/ontology/>
			select  ?c ?p ?d ?g (MIN(?ax) as ?ax)
			${from}
			${fromNamed}
			{
			  graph ?g {?c ?p ?d.}
			  filter(?g!=sniko:)
			  {?c a [rdfs:subClassOf meta:Top].} ${instances ? " UNION {?c a [a [rdfs:subClassOf meta:Top]]}" : ""}
			  {?d a [rdfs:subClassOf meta:Top].} ${instances ? " UNION {?d a [a [rdfs:subClassOf meta:Top]]}" : ""}
			  filter(?p!=rdf:type)
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
};
