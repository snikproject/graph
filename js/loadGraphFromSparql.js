import * as sparql from "./sparql.js";
import * as graph from "./graph.js";
import * as layout from "./layout.js";
import * as log from "./log.js";
import * as file from "./file.js";
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



export default function loadGraphFromSparql()
{
  graph.cy.elements().remove();
  //file.load();
  // load graph from SPARQL endpoint instead of from the .cyjs file
  // only show classes with labels, use any one if more than one
  // degree too time consuming, remove for development
  const classQuery =
  `select ?c str(sample(?l)) as ?l replace(str(sample(?subTop)),".*[#/]","") as ?subTop replace(str(?source),".*[#/]","") as ?source sample(?instance) as ?instance
  #count(?o) as ?degree
  #from <http://www.snik.eu/ontology>
  #from <http://www.snik.eu/ontology/it>
  from <http://www.snik.eu/ontology/test>
  #from <http://www.snik.eu/ontology/bb>
  #from <http://www.snik.eu/ontology/ob>
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
  const propertyQuery =
  `select ?c ?p ?d ?g
  #from <http://www.snik.eu/ontology>
  #from <http://www.snik.eu/ontology/it>
  from <http://www.snik.eu/ontology/test>
  #from <http://www.snik.eu/ontology/bb>
  #from <http://www.snik.eu/ontology/ob>
  #from <http://www.snik.eu/ontology/virtual>
  #from <http://www.snik.eu/ontology/meta>
  #from <http://www.snik.eu/ontology/limes-exact>
  {
    owl:Class ^a ?c,?d.
    graph ?g {?c ?p ?d.}
    filter(?p!=meta:subTopClass)
  }`;
  const storageName = "positions-"+(classQuery+propertyQuery).hashCode();

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
      //const layoutTimer = timer("layout");
      const config = layout.euler;
      if(typeof(Storage)=== "undefined")
      {
        log.error("web storage not available, could not access cache.");
        layout.run(config);
      }
      else
      {
        localStorage.removeItem('positions');
        let positions=JSON.parse(localStorage.getItem(storageName));
        if(positions) // cache hit
        {
          log.info("loading layout from cache");
          file.loadLayout(positions);
        }
        else // cache miss
        {
          log.warn("layout not in cache, please wait");
          layout.run(config);
          positions=[];
          const nodes = graph.cy.nodes();
          for(let i=0;i<nodes.size();i++)
          {
            const node = nodes[i];
            positions.push([node.data().id,node.position()]);
          }

          localStorage.setItem(storageName,JSON.stringify(positions));
        }
      }
      //layoutTimer.stop();
      return graph.cy;
    }).catch(e=>
    {
      log.error(e);
    });
}
