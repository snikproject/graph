/**
Loads the graph from the SNIK SPARQL endpoint. No layouting. May use caching.
@module */
import * as sparql from "./sparql.js";
import timer from "./timer.js";

/** https://github.com/binded/empty-promise/blob/master/src/index.js, is there a shorter or build in option?
@returns {object} an empty promise that can be resolved or rejected from the outside.
*/
function emptyPromise()
{
  let callbacks;
  let done = false;

  const p = new Promise((resolve, reject) =>
  {
    callbacks = { resolve, reject };
  });
  // @ts-ignore
  p.done = () => done;
  // @ts-ignore
  p.resolve = (val) =>
  {
    callbacks.resolve(val);
    done = true;
    return p;
  };
  // @ts-ignore
  p.reject = (val) =>
  {
    callbacks.reject(val);
    done = true;
    return p;
  };

  return p;
}

/** Query for classes from the endpoint */
async function selectClasses(endpoint, from, instances)
{
  const sparqlClassesTimer = timer("sparql-classes");
  const classQuerySimple =
  `
  PREFIX ov: <http://open.vocab.org/terms/>
  select ?c
  group_concat(distinct(concat(?l,"@",lang(?l)));separator="|") as ?l
  ?instance
  ?src
  ${from}
  {
    ${instances?"{?c a [a owl:Class]} UNION":""}
    {?c a owl:Class.}
    OPTIONAL {?c rdfs:label ?l.}
    OPTIONAL {?c a ?type. FILTER (?type!=owl:Class). bind(true as ?instance) }
    OPTIONAL {?src ov:defines ?c.}
  }
  `;
  const classQuerySnik =
  `
  PREFIX ov: <http://open.vocab.org/terms/>
  PREFIX meta: <http://www.snik.eu/ontology/meta/>
  select ?c
  group_concat(distinct(concat(?l,"@",lang(?l)));separator="|") as ?l
  sample(?st) as ?st
  ?src
  sample(?inst) as ?inst
  ${from}
  {
    ?c a owl:Class.

    OPTIONAL {?src ov:defines ?c.}
    OPTIONAL {?c meta:subTopClass ?st.}
    OPTIONAL {?c rdfs:label ?l.}
    OPTIONAL {?inst a ?c.}
  }`;
  const classQuery = endpoint?classQuerySimple:classQuerySnik;
  const json = await sparql.select(classQuery,null,endpoint);
  sparqlClassesTimer.stop(json.length+" classes");
  return json;
}

/**  Creates cytoscape nodes for the classes */
async function classNodes(endpoint, instances, from)
{
  const json = await selectClasses(endpoint,instances, from);

  /** @type{cytoscape.ElementDefinition[]} */
  const nodes = [];
  const sources = new Set();
  for(let i=0;i<json.length;i++)
  {
    const labels = json[i].l.value.split("|");
    const l = {};
    for(const label of labels)
    {
      const stringAndTag = label.split("@");
      const tag = stringAndTag[1];
      if(!l[tag]) {l[tag]=[];}
      l[tag].push(stringAndTag[0]);
    }
    let source;
    if (json[i].src)
    {
      source = json[i].src.value;
      sources.add(source);
    }
    nodes.push(
      {
        group: "nodes",
        data: {
          id: json[i].c.value,
          l: l,
          ...(json[i].st && {st: json[i].st.value.replace("http://www.snik.eu/ontology/meta/","").substring(0,1)}),
          ...(source && {prefix: source.replace("http://www.snik.eu/ontology/","")}),
          inst: json[i].inst!==undefined, // has at least one instance
          ...(json[i].instance && {i: true}),// is an instance
        },
        //position: { x: 200, y: 200 }
      });
  }
  log.info(json.length+" Nodes loaded from SPARQL");
  return nodes;
}

/** Query for triples between classes from the endpoint */
async function selectTriples(endpoint, from, fromNamed, instances, virtual)
{
  const sparqlPropertiesTimer = timer("sparql-properties");
  const tripleQuerySimple =
    `
    select  ?c ?p ?d
    ${from}
    {
      {?c ?p ?d.} ${virtual?" UNION {?p rdfs:domain ?c; rdfs:range ?d.}":""}
      {?c a owl:Class.} ${instances?" UNION {?c a [a owl:Class]}":""}
      {?d a owl:Class.} ${instances?" UNION {?d a [a owl:Class]}":""}
    }`;
  const tripleQuerySnik =
    `select  ?c ?p ?d ?g (MIN(?ax) as ?ax)
    ${from}
    ${fromNamed}
    {
      graph ?g {?c ?p ?d.}
      filter(?g!=sniko:)
      owl:Class ^a ?c,?d.
      filter(?p!=meta:subTopClass)
      OPTIONAL
      {
        ?ax a owl:Axiom;
        owl:annotatedSource ?c;
        owl:annotatedProperty ?p;
        owl:annotatedTarget ?d.
      }
    }`;
  const tripleQuery = endpoint?tripleQuerySimple:tripleQuerySnik;
  const json = await sparql.select(tripleQuery,null,endpoint);
  sparqlPropertiesTimer.stop(json.length+" properties");
  return json;
}

/**  Creates cytoscape nodes for the classes */
async function tripleEdges(endpoint, from, fromNamed, instances, virtual)
{
  const json = await selectTriples(endpoint, from, fromNamed, instances, virtual);
  const edges = [];
  for(let i=0;i<json.length;i++)
  {
    edges.push(
      {
        group: "edges",
        data: {
          source: json[i].c.value,
          target: json[i].d.value,
          id: i,
          p: json[i].p.value,
          pl: json[i].p.value.replace(/.*[#/]/,""),
          ...(json[i].g && {g: json[i].g.value}), // don't add null/undefined values, see https://stackoverflow.com/a/40560953/398963
          ...(json[i].ax && {ax: json[i].ax.value}), // in case of virtual triples: the URI of the axiom
        },
        //position: { x: 200, y: 200 }
      });
  }
  log.info(json.length+" Edges loaded from SPARQL");
  return edges;
}

/** Loads a set of subontologies into the given graph. Data from RDF helper graphs is loaded as well, such as virtual triples.
  @param{cytoscape.Core} cy the cytoscape graph to load the data into
  @param{string[]} graphs subontologies to load.
  @example
  loadGraphFromSparql(cy,new Set(["meta","bb"]))
  */
export default async function loadGraphFromSparql(cy,graphs,endpoint, instances, virtual)
{
  log.info(`Loading graph from endpoint ${endpoint} with graphs ${graphs}.`);
  const from = graphs.map(graph=>`FROM <${graph}>`).reduce((a,b)=>a+"\n"+b,"");
  const fromNamed = from.replace(/FROM/g,"FROM NAMED");

  const [nodes,edges] = await Promise.all([classNodes(endpoint, from, instances),tripleEdges(endpoint, from, fromNamed, instances, virtual)]);
  cy.elements().remove();
  cy.add(nodes);
  cy.add(edges);
  cy.elements().addClass("unfiltered");
}
