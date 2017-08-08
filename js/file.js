import {progress} from "./progress.js";
import * as graph from "./graph.js";
import timer from "./timer.js";

// https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link
export var save = (function ()
{
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function (/*data, fileName*/)
  {
    const fileName = "snik.json";
    const data = graph.cy.json();
    const json = JSON.stringify(data),
      blob = new Blob([json], {type: "application/json"}),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
}());

export function load()
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
