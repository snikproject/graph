/**
Loads the graph from the SNIK SPARQL endpoint. No layouting. May use caching.
@module */
import * as sparql from "./sparql.js";
import * as log from "./log.js";
import * as rdfGraph from "./rdfGraph.js";
import timer from "./timer.js";

String.prototype.hashCode = function()
{
  var hash = 0, i = 0, len = this.length;
  while (i < len)
  {
    hash  = ((hash << 5) - hash + this.charCodeAt(i++)) << 0;
  }
  return hash;
};


/**expands the snik pseudo prefix*/
function expand(short)
{
  return short.replace("s:","http://www.snik.eu/ontology/");
}

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
  //file.load();
  // load graph from SPARQL endpoint instead of from the .cyjs file
  // only show classes with labels
  // degree too time consuming, remove for development
  // keep bindings short to minimize data sent over network
  const classQuery =
  `select replace(str(?c),"http://www.snik.eu/ontology/","s:") as ?c
  group_concat(distinct(concat(?l,"@",lang(?l)));separator="|") as ?l
  substr(replace(str(sample(?st)),".*[#/]",""),1,1) as ?st replace(str(?src),".*[#/]","") as ?src sample(?inst) as ?inst
  #count(?o) as ?degree
  ${froms}
  {
    ?c a owl:Class.
    #{?c ?p ?o.} UNION {?o ?p ?c}.#too slow, remove isolated nodes in post processing
    OPTIONAL {?src ov:defines ?c.}
    OPTIONAL {?c meta:subTopClass ?st.}
    OPTIONAL {?c rdfs:label ?l.}
    OPTIONAL {?inst a ?c.}
  }`;
  const propertyQuery =
  `select
  replace(str(?c),"http://www.snik.eu/ontology/","s:") as ?c
  replace(str(?p),"http://www.snik.eu/ontology/","s:") as ?p
  replace(str(?d),"http://www.snik.eu/ontology/","s:") as ?d
  replace(str(?g),"http://www.snik.eu/ontology/","s:") as ?g
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
            id: expand(json[i].c.value),
            ld: ld,
            le: le,
            la: la,
            st: (json[i].st===undefined)?null:json[i].st.value,
            prefix: (json[i].src===undefined)?null:json[i].src.value,
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
              source: expand(json[i].c.value),
              target: expand(json[i].d.value),
              id: i,
              p: expand(json[i].p.value),//Labels_DE: [json[i].l.value]
              pl: expand(json[i].p.value).replace(/.*[#/]/,""),
              g: expand(json[i].g.value),
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
