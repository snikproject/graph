import * as sparql from "./sparql.js";
import * as graph from "./graph.js";

function initGraphFromSparql()
{
  graph.initGraph(document.getElementById('cy'));
  // load graph from SPARQL endpoint instead of from the .cyjs file
  const classesPromise = sparql.sparql(
    // only show classes with labels, use any one if more than one
    `select ?c str(sample(?l)) as ?l sample(?subTop) as ?subTop
    from <http://www.snik.eu/ontology/ciox>
    from <http://www.snik.eu/ontology/meta>
    {
      ?c a owl:Class.
      OPTIONAL {?c meta:subTopClass ?subTop.}
      OPTIONAL {?c rdfs:label ?l.}
    }`);
  const classesAddedPromise = classesPromise.then((json)=>
    {
    for(let i=0;i<json.length;i++)
      {
      graph.cy.add(
        {
          group: "nodes",
          data: {
            id: json[i].c.value,
            Labels_DE: [(json[i].l===undefined)?json[i].c.value:json[i].l.value],
            subTop: (json[i].subTop===undefined)?undefined:json[i].subTop.value
          },
            //position: { x: 200, y: 200 }
        });
          /*console.log(json[i].l);
          console.log(json[i].l.value);*/
    }
  });
  const triplesPromise = sparql.sparql(
        // only show classes with labels, use any one if more than one
        `select ?c replace(str(?p),".*[#/]","") as ?p ?d
        from <http://www.snik.eu/ontology/ciox>
        from <http://www.snik.eu/ontology/virtual>
        from <http://www.snik.eu/ontology/meta>
        {
          graph <http://www.snik.eu/ontology/ciox> {owl:Class ^a ?c,?d.}
          ?c ?p ?d.
        }`);
  Promise.all([classesAddedPromise,triplesPromise]).then((values)=>
        {
    const json = values[1];
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
    graph.cy.layout(
      {
        name:"cola",
        maxSimulationTime: 200,
        fit: true
      }).run();
    //graph.cy.zoom(graph.cy.zoom()*0.2);
    graph.cy.layout(
      {
        name:"cola",
        infinite: true,
        fit: false,
        nodeSpacing: function(node) {return 40;}
      }).run();
  });
}

export {initGraphFromSparql};
