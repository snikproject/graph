import * as sparql from "./sparql.js";
import * as graph from "./graph.js";

function loadSparql()
{
  graph.initGraph(document.getElementById('cy'));
	// load graph from SPARQL endpoint instead of from the .cyjs file
  const classesPromise = sparql.sparql(
		`select ?c str(?l) as ?l
		{
			?c a owl:Class.
			OPTIONAL {?c rdfs:label ?l}
		} limit 5`,"http://www.snik.eu/ontology/ciox");
  classesPromise.then((json)=>
  {
    for(let i=0;i<json.length;i++)
    {
      graph.cy.add(
        {
          group: "nodes",
          data: {
            name: json[i].c.value,
            Labels_DE: [json[i].l.value]
          },
          //position: { x: 200, y: 200 }
        });
      console.log(json[i].l);
      console.log(json[i].l.value);
    }
  });
}

export {loadSparql};
