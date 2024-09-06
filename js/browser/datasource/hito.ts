import hitoView from "../initialView/hito.json" assert { type: "json" };

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
		endpoint: "https://www.hitontology.eu/sparql",
		graph: "http://www.hitontology.eu/ontology",
		instances: false,
	},
	nodeQuery: (FROM) => `
SELECT REPLACE(STR(?c),"http://hitontology.eu/ontology/","") AS ?c
GROUP_CONCAT(distinct(CONCAT(?l,"@",lang(?l)));separator="|") as ?l
REPLACE(STR(SAMPLE(?class)),"http://hitontology.eu/ontology/","") AS ?class
REPLACE(REPLACE(REPLACE(?class,"Classified",""),"Citation",""),"Catalogue","") AS ?pre
REPLACE(STR(SAMPLE(?super)),"http://hitontology.eu/ontology/","") AS ?super
FROM <http://hitontology.eu/ontology>
{
	{?c a owl:Class.} UNION {?c a [a owl:Class].}
	?c a ?class
	OPTIONAL {?c rdfs:label ?l.}
	OPTIONAL {?class rdfs:subClassOf ?super.}
}`,
};
