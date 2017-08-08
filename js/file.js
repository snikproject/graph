import {progress} from "./progress.js";
import * as graph from "./graph.js";
import timer from "./timer.js";
import * as layout from "./layout.js";

export function loadGraph()
{
  progress(0);
  graph.cy.elements().remove();
  const headers = new Headers();
  const init = { method: 'GET',
    headers: headers,
    mode: 'cors',
    cache: 'default',
    credentials: 'include'};
  const loadTimer = timer("file-load");
  return fetch("data/snik.json",init)
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

export function loadGraphDialog()
{

}

export function loadLayout(positions)
{
  const map = new Map(positions);
  const config =
  {
    name: 'preset',
    fit:false,
    positions: node=>{return map.get(node._private.data.id); },
  };
  layout.run(config);
}

export function loadLayoutDialog()
{

}


// https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link
export var saveJson = (function ()
{
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function (data, fileName)
  {
    const json = JSON.stringify(data),
      blob = new Blob([json], {type: "application/json"}),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
}());

export function saveGraph()
{
  return saveJson(graph.cy.json(),"snik.json");
}

export function saveLayout()
{

}
