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


export default function loadGraphFromSparql(cy,subontologies)
{
  const rdfGraphs = [...(new Set([...rdfGraph.helper(),...subontologies]))];
  const froms = rdfGraphs.map(sub=>`from <http://www.snik.eu/ontology/${sub}>`).reduce((a,b)=>a+"\n"+b);
  cy.elements().remove();
  //file.load();
  // load graph from SPARQL endpoint instead of from the .cyjs file
  // only show classes with labels, use any one if more than one
  // degree too time consuming, remove for development
  const classQuery =
  `select ?c str(sample(?l)) as ?l replace(str(sample(?subTop)),".*[#/]","") as ?subTop replace(str(?source),".*[#/]","") as ?source sample(?instance) as ?instance
  #count(?o) as ?degree
  ${froms}
  {
    ?c a owl:Class.
    #{?c ?p ?o.} UNION {?o ?p ?c}.#too slow, remove isolated nodes in post processing
    OPTIONAL {?source ov:defines ?c.}
    OPTIONAL {?c meta:subTopClass ?subTop.}
    OPTIONAL {?c rdfs:label ?l.}
    OPTIONAL {?instance a ?c.}
  }`;
  const propertyQuery =
  `select ?c ?p ?d ?g
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

  //const classesAddedPromise =
  return classesPromise.then((json)=>
  {
    sparqlClassesTimer.stop(json.length+" classes");
    for(let i=0;i<json.length;i++)
    {
      cy.add(
        {
          group: "nodes",
          data: {
            id: json[i].c.value,
            name: json[i].c.value,
            ld: [(json[i].l===undefined)?json[i].c.value:json[i].l.value],
            st: (json[i].subTop===undefined)?null:json[i].subTop.value,
            prefix: (json[i].source===undefined)?null:json[i].source.value,
            inst: json[i].instance!==undefined,
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
      //const json = values[1];
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
              pl: json[i].p.value.replace(".*/",""),
              g:json[i].g.value,
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
