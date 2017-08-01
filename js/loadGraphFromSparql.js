import * as sparql from "./sparql.js";
import * as graph from "./graph.js";
import * as layout from "./layout.js";
import * as log from "./log.js";
import timer from "./timer.js";

export default function loadGraphFromSparql()
{
  // load graph from SPARQL endpoint instead of from the .cyjs file
  // only show classes with labels, use any one if more than one
  // degree too time consuming, remove for development
  const query =
  `select ?c str(sample(?l)) as ?l replace(str(sample(?subTop)),".*[#/]","") as ?subTop replace(str(?source),".*[#/]","") as ?source sample(?instance) as ?instance
  #count(?o) as ?degree
  #from <http://www.snik.eu/ontology/it>
  from <http://www.snik.eu/ontology/test>
  #from <http://www.snik.eu/ontology/virtual>
  #from <http://www.snik.eu/ontology/meta>
  {
    ?c a owl:Class.
    #{?c ?p ?o.} UNION {?o ?p ?c}.
    OPTIONAL {?source ov:defines ?c.}
    OPTIONAL {?c meta:subTopClass ?subTop.}
    OPTIONAL {?c rdfs:label ?l.}
    OPTIONAL {?instance a ?c.}
  }`;
  const sparqlClassesTimer = timer("sparql-classes");
  let sparqlPropertiesTimer;
  const classes = undefined;//localStorage.getItem('classes');
  // if not in cache, load
  const classesPromise = (classes===undefined)?
    sparql.sparql(query):Promise.resolve(classes);

  //const classesAddedPromise =
  return classesPromise.then((json)=>
  {
    sparqlClassesTimer.stop(json.length+" classes");
    for(let i=0;i<json.length;i++)
    {
      graph.cy.add(
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
    return sparql.sparql(
      // only show classes with labels, use any one if more than one
      //`select ?c replace(str(?p),".*[#/]","") as ?p ?d
      `select ?c ?p ?d ?g
        #from <http://www.snik.eu/ontology/it>
        from <http://www.snik.eu/ontology/test>
        #from <http://www.snik.eu/ontology/virtual>
        #from <http://www.snik.eu/ontology/meta>
        from <http://www.snik.eu/ontology/limes-exact>
        {
          owl:Class ^a ?c,?d.
          graph ?g {?c ?p ?d.}
        }`);
  }).then(json=>
    //return Promise.all([classesAddedPromise,triplesPromise]).then((values)=>
  {
    sparqlPropertiesTimer.stop(json.length+" properties");
    //const json = values[1];
    for(let i=0;i<json.length;i++)
    {
      graph.cy.add(
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
    const layoutTimer = timer("layout");
    layout.run(layout.cose);
    layoutTimer.stop();
    return graph.cy;
  }).catch(e=>
  {
    log.error(query,e);
  });
}
