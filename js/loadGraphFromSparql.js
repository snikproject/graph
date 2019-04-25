/**
Loads the graph from the SNIK SPARQL endpoint. No layouting. May use caching.
@module */
import * as sparql from "./sparql.js";
import config from "./config.js";
import timer from "./timer.js";

String.prototype.hashCode = function()
{
  let hash = 0, i = 0;
  const len = this.length;
  while (i < len)
  {
    hash  = ((hash << 5) - hash + this.charCodeAt(i++)) << 0;
  }
  return hash;
};

/** https://github.com/binded/empty-promise/blob/master/src/index.js, is there a shorter or build in option?*/
function emptyPromise()
{
  let callbacks;
  let done = false;

  const p = new Promise((resolve, reject) =>
  {
    callbacks = { resolve, reject };
  });

  p.done = () => done;
  p.resolve = (val) =>
  {
    callbacks.resolve(val);
    done = true;
    return p;
  };
  p.reject = (val) =>
  {
    callbacks.reject(val);
    done = true;
    return p;
  };

  return p;
}

// /**expands the snik pseudo prefix*/ optimization removed due to it being slower
// function expand(short) {return short.replace("s:","http://www.snik.eu/ontology/");}

/** Loads a set of subontologies into the given graph. Data from RDF helper graphs is loaded as well, such as virtual triples.
@param{cy} cy the cytoscape graph to load the data into
@param{Set} subs Set of subontologies to load.
@example
loadGraphFromSparql(cy,new Set(["meta","bb"]))
*/
export default function loadGraphFromSparql(cy,subs)
{
  const rdfGraphs = [config.helperGraphs,...subs];
  const froms = rdfGraphs.map(sub=>`FROM <http://www.snik.eu/ontology/${sub}>`).reduce((a,b)=>a+"\n"+b);
  const fromNamed = froms.replace(/FROM/g,"FROM NAMED");
  cy.elements().remove();
  // Optimization failed, was actually slower. Great example of premature optimization.
  // Idea was to keep bindings short to minimize data sent over network but failed probably due to caching, compression and function overhead.
  //replace(str(?c),"http://www.snik.eu/ontology/","s:") as ?c
  //group_concat(distinct(concat(?l,"@",lang(?l)));separator="|") as ?l
  //substr(replace(str(sample(?st)),".*[#/]",""),1,1) as ?st replace(str(?src),".*[#/]","") as ?src sample(?inst) as ?inst
  // only show classes with labels
  // degree too time consuming, remove for development
  // #count(?o) as ?degree
  // too slow, remove isolated nodes in post processing
  // #{?c ?p ?o.} UNION {?o ?p ?c}.
  const classQuery =
  `select ?c
  group_concat(distinct(concat(?l,"@",lang(?l)));separator="|") as ?l
  sample(?st) as ?st
  ?src
  sample(?inst) as ?inst
  ${froms}
  {
    ?c a owl:Class.

    OPTIONAL {?src ov:defines ?c.}
    OPTIONAL {?c meta:subTopClass ?st.}
    OPTIONAL {?c rdfs:label ?l.}
    OPTIONAL {?inst a ?c.}
  }`;
  //  this was actually slower, often by a whole second, probably due to compression and better caching or replace overhead
  //  replace(str(?c),"http://www.snik.eu/ontology/","s:") as ?c
  //  replace(str(?p),"http://www.snik.eu/ontology/","s:") as ?p
  //  replace(str(?d),"http://www.snik.eu/ontology/","s:") as ?d
  //  replace(str(?g),"http://www.snik.eu/ontology/","s:") as ?g
  const propertyQuery =
  `select  ?c ?p ?d ?g (MIN(?ax) as ?ax)
  ${froms}
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
  const sparqlClassesTimer = timer("sparql-classes");
  const classes = undefined;//localStorage.getItem('classes');
  // if not in cache, load
  const classPromise = (classes===undefined)?
    sparql.select(classQuery):Promise.resolve(classes);
  const propertyPromise = sparql.select(propertyQuery);
  const nodePromise = emptyPromise();
  const edgePromise = emptyPromise();

  classPromise.then((json)=>
  {
    sparqlClassesTimer.stop(json.length+" classes");
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
            //degree: parseInt(json[i].degree.value),
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
    log.error(classQuery,e);
    nodePromise.reject();
    return;
  });

  const sparqlPropertiesTimer = timer("sparql-properties");
  const edges = [];
  propertyPromise.then(json=>
  //return Promise.all([classesAddedPromise,triplesPromise]).then((values)=>
  {
    sparqlPropertiesTimer.stop(json.length+" properties");

    for(let i=0;i<json.length;i++)
    {
      edges.push(
        {
          group: "edges",
          data: {
            source: json[i].c.value,
            target: json[i].d.value,
            id: i,
            p: json[i].p.value,//Labels_DE: [json[i].l.value]
            pl: json[i].p.value.replace(/.*[#/]/,""),
            g: json[i].g.value,
            ax: json[i].ax===undefined?null:json[i].ax.value,
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
  }
  );
}
