import {progress} from "./progress.js";
import * as graph from "./graph.js";
import timer from "./timer.js";

export default function loadGraphFromFile()
{
  progress(0);

  const headers = new Headers();
  const init = { method: 'GET',
    headers: headers,
    mode: 'cors',
    cache: 'default',
    credentials: 'include'};
  const loadTimer = timer("file-load");
  return fetch("data/snik.cyjs",init)
    .then(response=>response.json())
    .then(json=>
    {
      loadTimer.stop();
      const addTimer = timer("file-add");
      graph.cy.add(json.elements);
      addTimer.stop();
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
