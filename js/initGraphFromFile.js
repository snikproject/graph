import {progress} from "./progress.js";
import * as graph from "./graph.js";

function initGraphFromFile()
{
  progress(0);

  const headers = new Headers();
  const init = { method: 'GET',
    headers: headers,
    mode: 'cors',
    cache: 'default',
    credentials: 'include'};

  /*
  // only needed if there is an access protected file with the full information that is sometimes present.
  fetch("data/snik-ciox.cyjs",init)
  .then(response => {return response.json();})w
  .then(json =>
  {
  initGraph(document.getElementById('cy'),json);
  cy.zoom(0.1);
  cy.center(cy.elements().nodes().filter(`node[name= "http://www.snik.eu/ontology/meta/EntityType"]`)[0]);
  progress(100);
})
.catch(err =>
{
console.log('snik-ciox.cyjs not found, loading snik.cyjs. Details: '+err);
*/

  return fetch("data/snik.cyjs",init)
    .then(response=>response.json())
    .then(json=>
    {
      graph.initGraph();
      graph.cy.add(json.elements);
    //cy.zoom(0.1);
    //cy.center(cy.elements().nodes().filter(`node[name= "http://www.snik.eu/ontology/meta/EntityType"]`)[0]);
      return graph.cy;
    })
    .catch(err2=>
    {
      alert('Did not find graph file snik.cyjs, failed to load graph. Details: '+err2);
      progress(100);
    })
    .finally(()=>
    {
      progress(100);
    });
  //});
}

export {initGraphFromFile};
