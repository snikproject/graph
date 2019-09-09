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
async function selectClasses(endpoint, from)
{
  const sparqlClassesTimer = timer("sparql-classes");
  const classQuerySimple =
  `select ?c
  group_concat(distinct(concat(?l,"@",lang(?l)));separator="|") as ?l
  ${from}
  {
    ?c a owl:Class.
    OPTIONAL {?c rdfs:label ?l.}
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

/** Query for triples between classes from the endpoint */
async function selectProperties(endpoint, from, fromNamed)
{
  const sparqlPropertiesTimer = timer("sparql-properties");
  const propertyQuerySimple =
  `
  select  ?c ?p ?d
  ${from}
  {
    ?c ?p ?d.
    owl:Class ^a ?c,?d.
  }`;
  const propertyQuerySnik =
  `select  ?c ?p ?d ?g (MIN(?ax) as ?ax)
  ${from}
  ${fromNamed}
  {
    graph ?g {?c ?p ?d.}
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
  const propertyQuery = endpoint?propertyQuerySimple:propertyQuerySnik;
  const json = await sparql.select(propertyQuery,null,endpoint);
  sparqlPropertiesTimer.stop(json.length+" properties");
  return json;
}

/** Loads a set of subontologies into the given graph. Data from RDF helper graphs is loaded as well, such as virtual triples.
@param{cytoscape.Core} cy the cytoscape graph to load the data into
@param{string[]} graphs subontologies to load.
@example
loadGraphFromSparql(cy,new Set(["meta","bb"]))
*/
export default function loadGraphFromSparql(cy,graphs,endpoint)
{
  log.info(`Loading graph from endpoint ${endpoint} with graphs ${graphs}.`);
  const from = graphs.map(graph=>`FROM <${graph}>`).reduce((a,b)=>a+"\n"+b,"");
  const fromNamed = from.replace(/FROM/g,"FROM NAMED");
  cy.elements().remove();

  const nodePromise = emptyPromise();
  const edgePromise = emptyPromise();

  selectClasses(endpoint,from).then((json)=>
  {
    /** @type{cytoscape.ElementDefinition[]} */
    const nodes = [];
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

      nodes.push(
        {
          group: "nodes",
          data: {
            id: json[i].c.value,
            l: l,
            st: (json[i].st===undefined)?null:json[i].st.value.replace("http://www.snik.eu/ontology/meta/","").substring(0,1),
            prefix: (json[i].src===undefined)?null:json[i].src.value.replace("http://www.snik.eu/ontology/",""),
            inst: json[i].inst!==undefined,
          },
          //position: { x: 200, y: 200 }
        });
      /*console.log(json[i].l);
        console.log(json[i].l.value);*/
    }
    log.info(json.length+" Nodes loaded from SPARQL");
    cy.add(nodes);
    nodePromise.resolve();
  }).catch(e=>
  {
    nodePromise.reject();
    return;
  });

  const edges = [];
  selectProperties(endpoint,from,fromNamed).then(json=>
  {
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
            ...(json[i].g && {g: json[i].g.value}), // see https://stackoverflow.com/a/40560953/398963
            ...(json[i].ax && {ax: json[i].ax.value}),
          },
          //position: { x: 200, y: 200 }
        });
    }
    log.info(json.length+" Properties loaded from SPARQL");
    // remove isolated nodes (too costly in SPARQL query)
    // deactivated for now, so that isolated nodes can be found and fixed
    //cy.nodes("[[degree=0]]").remove();
    edgePromise.resolve();
    return;
  }).catch(e=>
  {
    edgePromise.reject();
    log.error(e);
    return;
  });

  return Promise.all([nodePromise,edgePromise]).then(()=>
  {
    cy.add(edges);
    cy.elements().addClass("unfiltered");
  }
  );
}
