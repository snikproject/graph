import {progress} from "./progress.js";
import * as graph from "./graph.js";
import * as layout from "./layout.js";
import timer from "./timer.js";

/** Loads a local JSON file.
When developing on Google Chrome, you may need to start the browser with "--allow-file-access-from-files".
See also https://bugs.chromium.org/p/chromium/issues/detail?id=47416.*/
/*
function readJsonFile(fileName)
{
  const headers = new Headers();
  const init = { method: 'GET',
    headers: headers,
    mode: 'cors',
    cache: 'default',
    credentials: 'include'}; // credentials in case of htaccess
  const loadTimer = timer("read json file "+fileName);
  return fetch(fileName,init)
    .then(response=>
    {
      loadTimer.stop;
      return response.json();
    });
}
*/

// based on https://stackoverflow.com/questions/19327749/javascript-blob-fileName-without-link
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
  return saveJson(graph.cy.elements().jsons(),"snik.json");
}

export function saveVisibleGraph()
{
  return saveJson(graph.cy.elements("*:visible").jsons(),"snikpart.json");
}

export function saveLayout()
{
  return saveJson(layout.positions(graph.cy.nodes()),"layout.json");
}

function uploadJson(event,callback)
{
  const file = event.target.files[0];
  var reader = new FileReader();
  reader.onload = ()=>callback(JSON.parse(reader.result));
  reader.readAsText(file);
}

export function loadGraph(event)
{
  uploadJson(event,json=>
  {
    graph.cy.elements().remove();
    graph.cy.add(json);
  });
}

export function loadLayout(event)
{
  uploadJson(event,json=>{layout.presetLayout(graph.cy,json);});
}

function addLoadEntry(parent,id,description,func)
{
  const label = document.createElement("label");
  label.classList.add("dropdown-entry");
  label.for=id+"button";
  label.innerText=description;
  parent.prepend(label);
  const input = document.createElement("input");
  input.type="file";
  input.id=id+"button";
  input.style.display="none";
  label.appendChild(input);
  input.addEventListener("change",func);
}

// Cannot use the simpler default menu creation method because file upload only works with an input.
export function addFileLoadEntries(parent)
{
  addLoadEntry(parent,"loadlayout","Load Layout",loadLayout);
  addLoadEntry(parent,"loadgraph","Load Graph File with Layout",loadGraph);
}
