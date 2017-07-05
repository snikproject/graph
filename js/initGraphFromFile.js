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

  return fetch("data/snik.cyjs",init)
  .then(response=>response.json())
  .then(json=>
    {
    graph.initGraph();
    graph.cy.add(json.elements);
    return graph.cy;
  })
    .catch(e=>
      {
      alert('Error loading snik.cyjs: '+e);
    })
      .then(()=> {progress(100);});
}

export {initGraphFromFile};
