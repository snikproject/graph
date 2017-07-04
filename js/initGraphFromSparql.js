import * as sparql from "./sparql.js";
import * as graph from "./graph.js";
import timer from "./timer.js";

function initGraphFromSparql()
{
  const initTimer = timer("graph-init");
  graph.initGraph(document.getElementById('cy'));
  initTimer.stop();
  // load graph from SPARQL endpoint instead of from the .cyjs file
  // only show classes with labels, use any one if more than one
  // degree too time consuming, remove for development
  const query =
  `select ?c str(sample(?l)) as ?l replace(str(sample(?subTop)),".*[#/]","") as ?subTop replace(str(?source),".*[#/]","") as ?source
  #count(?o) as ?degree
  #from <http://www.snik.eu/ontology/it>
  from <http://www.snik.eu/ontology/it4it>
  from <http://www.snik.eu/ontology/virtual>
  from <http://www.snik.eu/ontology/meta>
  {
    ?c a owl:Class.
    #{?c ?p ?o.} UNION {?o ?p ?c}.
    OPTIONAL {?source ov:defines ?c.}
    OPTIONAL {?c meta:subTopClass ?subTop.}
    OPTIONAL {?c rdfs:label ?l.}
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
    sparqlClassesTimer.stop();
    for(let i=0;i<json.length;i++)
    {
      graph.cy.add(
        {
          group: "nodes",
          data: {
            id: json[i].c.value,
            name: json[i].c.value,
            ld: [(json[i].l===undefined)?json[i].c.value:json[i].l.value],
            st: (json[i].subTop===undefined)?undefined:json[i].subTop.value,
            source: (json[i].source===undefined)?undefined:json[i].source.value,
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
        `select ?c replace(str(?p),".*[#/]","") as ?p ?d
        #from <http://www.snik.eu/ontology/it>
        from <http://www.snik.eu/ontology/it4it>
        from <http://www.snik.eu/ontology/virtual>
        from <http://www.snik.eu/ontology/meta>
        {
          owl:Class ^a ?c,?d.
          ?c ?p ?d.
        }`);
  }).then(json=>
        //return Promise.all([classesAddedPromise,triplesPromise]).then((values)=>
        {
    sparqlPropertiesTimer.stop();
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
            interactionLabel: json[i].p.value,//Labels_DE: [json[i].l.value]
          },
                //position: { x: 200, y: 200 }
        });
    }
    const layoutTimer = timer("layout");
    graph.cy.layout(
      {
        name:"cose",
        animate: true,
        animationThreshold: 250,
        numIter: 50,
        nodeDimensionsIncludeLabels: false,
        nodeRepulsion: function(node){ return 400000; },
        initialTemp: 2000,
      }).run();
    layoutTimer.stop();
  // cola produces elongated result, so we can't use it
  /*graph.cy.layout(
  {
  name:"cola",
  maxSimulationTime: 400,
  fit: true
}).run();
layoutTimer.stop();
//graph.cy.zoom(graph.cy.zoom()*0.2);
/*graph.cy.layout(
{
name:"cola",
infinite: true,
fit: false,
nodeSpacing: function(node) {return 40;}
}).run();*/
  }).catch(e=>
      {
    console.error(e,query);
  });
}

export {initGraphFromSparql};
