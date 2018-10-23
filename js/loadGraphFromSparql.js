/**
Loads the graph from the SNIK SPARQL endpoint. No layouting. May use caching.
@module */
import * as sparql from "./sparql.js";
import * as log from "./log.js";
import * as rdfGraph from "./rdfGraph.js";
import timer from "./timer.js";

String.prototype.hashCode = function()
{
  let hash = 0, i = 0, len = this.length;
  while (i < len)
  {
    hash  = ((hash << 5) - hash + this.charCodeAt(i++)) << 0;
  }
  return hash;
};

// /**expands the snik pseudo prefix*/ optimization removed due to it being slower
// function expand(short) {return short.replace("s:","http://www.snik.eu/ontology/");}

/** Loads a set of subontologies into the given graph. Data from RDF helper graphs is loaded as well, such as virtual triples.
@param{cytoscape} cy the cytoscape graph to load the data into
@param{Set} subs Set of subontologies to load.
@example
loadGraphFromSparql(cy,new Set(["meta","bb"]))
*/
export default function loadGraphFromSparql(cy,subs)
{
  const rdfGraphs = [...(new Set([...rdfGraph.helper(),...subs]))];
  const froms = rdfGraphs.map(sub=>`from <http://www.snik.eu/ontology/${sub}>`).reduce((a,b)=>a+"\n"+b);
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
  `select  ?c ?p ?d ?g
  ${froms}
  {
    owl:Class ^a ?c,?d.
    graph ?g {?c ?p ?d.}
    filter(?p!=meta:subTopClass)
  }`;
  const sparqlClassesTimer = timer("sparql-classes");
  let sparqlPropertiesTimer;
  const classes = undefined;//localStorage.getItem('classes');
  // if not in cache, load
  const classesPromise = (classes===undefined)?
    sparql.sparql(classQuery):Promise.resolve(classes);

  return classesPromise.then((json)=>
  {
    sparqlClassesTimer.stop(json.length+" classes");
    for(let i=0;i<json.length;i++)
    {
      const labels = json[i].l.value.split("|");
      const ld = [];
      const le = [];
      const la = [];
      for(const label of labels)
      {
        const stringAndTag = label.split("@");
        switch(stringAndTag[1])
        {
        case "de": ld.push(stringAndTag[0]);break;
        case "en": le.push(stringAndTag[0]);break;
        default: la.push(stringAndTag[0]);
        }
      }

      cy.add(
        {
          group: "nodes",
          data: {
            id: json[i].c.value,
            ld: ld,
            le: le,
            la: la,
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
  }).then(()=>
  {
    sparqlPropertiesTimer = timer("sparql-properties");
    //const triplesPromise =
    // only show classes with labels, use any one if more than one
    //`select ?c replace(str(?p),".*[#/]","") as ?p ?d
    return sparql.sparql(propertyQuery);
  }).catch(e=>
  {
    log.error(classQuery,e);
    return;
  })
    .then(json=>
    //return Promise.all([classesAddedPromise,triplesPromise]).then((values)=>
    {
      sparqlPropertiesTimer.stop(json.length+" properties");
      for(let i=0;i<json.length;i++)
      {
        cy.add(
          {
            group: "edges",
            data: {
              source: json[i].c.value,
              target: json[i].d.value,
              id: i,
              p: json[i].p.value,//Labels_DE: [json[i].l.value]
              pl: json[i].p.value.replace(/.*[#/]/,""),
              g: json[i].g.value,
            },
          //position: { x: 200, y: 200 }
          });
      }
      // remove isolated nodes (too costly in SPARQL query)
      // deactivated for now, so that isolated nodes can be found and fixed
      //cy.nodes("[[degree=0]]").remove();
      return cy;
    }).catch(e=>
    {
      log.error(e);
    });
}
