import {progress} from "./progress.js";
import * as graph from "./graph.js";

export default function loadGraphFromFile()
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
      graph.cy.add(json.elements);
    })
    .catch(e=>
    {
      alert('Error loading snik.cyjs: '+e);
    })
    .then(()=>
    {
      progress(100);
      return graph.cy;
    });
}
