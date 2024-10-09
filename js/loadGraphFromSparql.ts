/**Loads the graph from the SNIK SPARQL endpoint. No layouting. May use caching.*/
import * as sparql from "./sparql";
import { timer } from "./timer";
import { config } from "./config/config";
import log from "loglevel";
import type { ElementDefinition, Core } from "cytoscape";

interface ClassBinding {
	src: { value: string };
	c: { value: string };
	l: { value: string };
	st: { value: string };
	inst: { value: boolean };
}

/**
 * Query for classes from the endpoint
 * @param  from - SPARQL from clause
 * @returns SPARQL JSON result
 */
async function selectClasses(from: string): Promise<Array<ClassBinding>> {
	const sparqlClassesTimer = timer("sparql-classes");

	const nodeQuerySimple = `
  PREFIX ov: <http://open.vocab.org/terms/>
  SELECT ?c
  GROUP_CONCAT(distinct(CONCAT(?l,"@",lang(?l)));separator="|") as ?l
  ?src
  ${from}
  {
    ?c a ?type.
    OPTIONAL {?c rdfs:label ?l.}
    OPTIONAL {?src ov:defines ?c.}
  }
  `;
	// eslint-disable-next-line ban-ts-comment Needed to easily swap different config files, ts-expect-error not suitable when defined
	// @ts-ignore Needed to easily swap different config files, we handle it not existing here
	const nodeQuery = config.ontology.sparql?.queries?.nodes ? config.ontology.sparql.queries.nodes(from) : nodeQuerySimple;
	const bindings = (await sparql.select(nodeQuery)) as Array<ClassBinding>;
	sparqlClassesTimer.stop(bindings.length + " classes using " + (config.ontology.name ? `${config.ontology.name} query` : "default query"));
	return bindings;
}

/** Parse "|"-separated labels with language tag into the SNIK graph label structure.
@param s - a string containing "|"-separated parts
@returns an object containing different language labels keyed by language tag */
function parseLabels(s: string): object {
	const labels = s.split("|");
	const l = {};
	for (const label of labels) {
		const [lex, tag] = label.split("@");
		if (!lex.trim()) {
			continue;
		}
		{
			if (!l[tag]) {
				l[tag] = [];
			}
		}
		l[tag].push(lex);
	}
	return l;
}

/**
 *  Creates cytoscape nodes for the classes
 * @param   from - a SPARQL FROM clause defining where to load the classes from
 * @returns nodes - representing the classes
 */
async function createClassNodes(from: string): Promise<Array<ElementDefinition>> {
	const bindings = await selectClasses(from);

	const nodes: Array<ElementDefinition> = [];
	const sources = new Set<string>();
	for (let i = 0; i < bindings.length; i++) {
		// The source value if it exists does not come from the SPARQL graph the node comes from but instead from a class that ov:defines it.
		let source;
		if (bindings[i].src) {
			source = bindings[i].src.value;
			if (source.includes("http://www.snik.eu/ontology/")) {
				source = source.replace("http://www.snik.eu/ontology/", "");
			} // abbreviate snik
			sources.add(source);
		}
		nodes.push({
			group: "nodes",
			data: {
				id: bindings[i].c.value,
				l: parseLabels(bindings[i].l.value),
				...(bindings[i].st && { st: bindings[i].st.value.replace("http://www.snik.eu/ontology/meta/", "").substring(0, 1) }),
				...(source && { source: source }),
				...(bindings[i].inst && { inst: true }), // has at least one instance
			},
		});
	}

	const colors = ["rgb(30,152,255)", "rgb(255,173,30)", "rgb(80,255,250)", "rgb(150,255,120)", "rgb(204, 0, 204)", "rgb(255, 255, 0)"];
	let count = 0;
	for (const source of sources) {
		if (!config.ontology.style.colorMap.has(source) && !config.ontology.style.color(source)) {
			config.ontology.style.colorMap.set(source, colors[count]);
			count = (count + 1) % colors.length;
		}
	}

	log.debug(bindings.length + " Nodes loaded from SPARQL");
	return nodes;
}

/** Query for instances from the endpoint
* @param from - a SPARQL FROM clause defining where to load the instances from
 @returns SPARQL JSON result */
async function selectInstances(from: string): Promise<Array<object>> {
	const sparqlInstancesTimer = timer("sparql-classes");
	const instanceQuery = `SELECT
  DISTINCT(?i)
  GROUP_CONCAT(DISTINCT(CONCAT(?l,"@",lang(?l)));separator="|") AS ?l
  ${from}
  {
    ?i a [a owl:Class].
    OPTIONAL {?i rdfs:label ?l.}
  }
  `;
	const json = await sparql.select(instanceQuery);
	sparqlInstancesTimer.stop(json.length + " instances");
	return json;
}

/** Create cytoscape nodes for the instances.
* @param  from - a SPARQL FROM clause defining where to load the instances from
 @returns cytoscape nodes for the instances */
async function createInstanceNodes(from: string): Promise<Array<object>> {
	const json = await selectInstances(from);
	const nodes: Array<ElementDefinition> = [];
	for (let i = 0; i < json.length; i++) {
		nodes.push({
			group: "nodes",
			data: {
				id: json[i]["i"].value,
				l: parseLabels(json[i]["l"].value),
				instance: true,
			},
		});
	}
	return nodes;
}

/**
 * Query for triples between resources in the SPARQL endpoint
 * @param  from - SPARQL from clause
 * @param  fromNamed - SPARQL from named clause
 * @param  instances - whether to load instances as well
 * @param  virtual - whether to select virtual triples from domain and range statements
 * @returns SPARQL query result object
 */
async function selectTriples(from: string, fromNamed: string, instances: boolean, virtual: boolean): Promise<Array<object>> {
	const sparqlPropertiesTimer = timer("sparql-properties");
	const tripleQuerySimple = `
    select  ?c ?p ?d
    ${from}
    {
      {?c ?p ?d.} ${virtual ? " UNION {?p rdfs:domain ?c; rdfs:range ?d.}" : ""}
      {?c a owl:Class.} ${instances ? " UNION {?c a [a owl:Class]}" : ""}
      {?d a owl:Class.} ${instances ? " UNION {?d a [a owl:Class}" : ""}
    }`;
	// the optional part should be a union
	// eslint-disable-next-line ban-ts-comment Needed to easily swap different config files, ts-expect-error not suitable when defined
	// @ts-ignore Needed to easily swap different config files, we handle it not existing here
	const tripleQuery = config.ontology.sparql?.queries?.triples
		? config.ontology.sparql.queries.triples(from, fromNamed, virtual, instances)
		: tripleQuerySimple;
	const json = await sparql.select(tripleQuery);
	sparqlPropertiesTimer.stop(json.length + " properties using " + (config.ontology.name ? `${config.ontology.name} query` : "default query"));
	return json;
}

/**  Creates cytoscape edges for the resources in the SPARQL endpoint
 * @param  from      - SPARQL from clause
 * @param  fromNamed - SPARQL from named clause
 * @param  instances - whether to load instances as well
 * @param  virtual   - whether to select virtual triples from domain and range statements
 * @returns SPARQL query result object
 */
async function createEdges(from: string, fromNamed: string, instances: boolean, virtual: boolean): Promise<Array<ElementDefinition>> {
	const json = await selectTriples(from, fromNamed, instances, virtual);
	const edges: Array<ElementDefinition> = [];
	for (let i = 0; i < json.length; i++) {
		edges.push({
			group: "edges",
			data: {
				source: json[i]["c"].value,
				target: json[i]["d"].value,
				id: String(i),
				p: json[i]["p"].value,
				pl: json[i]["p"].value.replace(/.*[#/]/, ""),
				...(json[i]["g"] && { g: json[i]["g"].value }), // don't add null/undefined values, see https://stackoverflow.com/a/40560953/398963
				...(json[i]["ax"] && { ax: json[i]["ax"].value }), // in case of virtual triples: the URI of the axiom
			},
			//position: { x: 200, y: 200 }
		});
	}
	log.debug(json.length + " Edges loaded from SPARQL");
	return edges;
}

/**
 * Create cytoscape nodes for classes and optionally also instances.
 * @param from -      a SPARQL from clause
 * @param instances - whether to load instances in addition to the classes
 * @returns an array of nodes
 */
async function createNodes(from: string, instances: boolean): Promise<Array<ElementDefinition>> {
	if (!instances) {
		return createClassNodes(from);
	}
	const [classNodes, instanceNodes] = await Promise.all([createClassNodes(from), createInstanceNodes(from)]);
	// @ts-expect-error concat types
	return classNodes.concat(instanceNodes);
}

/** Clears the given graph and loads a set of subontologies. Data from RDF helper graphs is loaded as well, such as virtual triples.
  * @param cy - the cytoscape graph to clear and to load the data into
  * @param graphs - subontologies to load.
  * @param instances - whether to load instances as well
  * @param virtual - whether to select virtual triples from domain and range statements
  * @returns nothing
  @example
  loadGraphFromSparql(cy,new Set(["meta","bb"]))
  */
export async function loadGraphFromSparql(cy: Core, graphs: Array<string>, instances: boolean = false, virtual: boolean = false): Promise<void> {
	log.debug(`Loading graph from endpoint ${config.ontology.sparql.endpoint} with graphs ${graphs}.`);
	const from = graphs.map((g) => `FROM <${g}>`).reduce((a, b) => a + "\n" + b, "");
	const fromNamed = from.replace(/FROM/g, "FROM NAMED");

	const [nodes, edges] = await Promise.all([createNodes(from, instances), createEdges(from, fromNamed, instances, virtual)]);
	cy.elements().remove();
	cy.add(nodes);
	cy.add(edges); // will throw an error if any edge refers to a node not contained in the nodes loaded before
	cy.elements().addClass("unfiltered");
}
