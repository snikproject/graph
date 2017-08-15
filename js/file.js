import {progress} from "./progress.js";
import * as graph from "./graph.js";
import * as layout from "./layout.js";
import timer from "./timer.js";

/** Loads a local JSON file.
When developing on Google Chrome, you may need to start the browser with "--allow-file-access-from-files".
See also https://bugs.chromium.org/p/chromium/issues/detail?id=47416.*/
function loadJson(fileName)
{
  const headers = new Headers();
  const init = { method: 'GET',
    headers: headers,
    mode: 'cors',
    cache: 'default',
    credentials: 'include'}; // credentials in case of htaccess
  const loadTimer = timer("load file "+fileName);
  return fetch(fileName,init)
    .then(response=>
    {
      loadTimer.stop;
      return response.json();
    });
}

export function loadGraph(fileName)
{
  progress(0);
  graph.cy.elements().remove();
  loadJson(fileName).then(json=>
  {
    const addTimer = timer("graph-file-add");
    graph.cy.add(json.elements);
    addTimer.stop();
  }).catch(e=>
  {
    alert('Error loading '+fileName+': '+e);
  }).then(()=>
  {
    progress(100);
    return graph.cy;
  });
}

export function loadGraphDialog()
{

}

export function loadLayoutDialog()
{

}

export function loadLayout(fileName)
{
  progress(0);
  loadJson(fileName)
    .then(json=>{layout.presetLayout(json);})
    .catch(e=>
    {
      alert("Error loading layout from file "+fileName,e);
    })
    .then(()=>{progress(100);});
}

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
  return saveJson(graph.cy.json(),"snik.json");
}

export function saveVisibleGraph()
{
  return saveJson(graph.cy.elements("*:visible").jsons(),"snikpart.json");
}

export function saveLayout()
{

}

// TODO: better naming
export function upload(event)
{
  const file = event.target.files[0];
  var reader = new FileReader();

  reader.onload = function()
  {
    console.log(reader.result);
    loadJson(reader.result);
  };
  reader.readAsText(file);
  //return false;
}

// Cannot use the simpler default menu creation method because file upload only works with an input.
export function addFileLoadEntries(parent)
{
  const label = document.createElement("label");
  label.classList.add("dropdown-entry");
  label.for="loadgraphbutton";
  label.innerText="Load Graph File with Layout";

  parent.prepend(label);

  const input = document.createElement("input");
  input.type="file";
  input.id="loadgraphbutton";
  input.style.display="none";
  label.appendChild(input);

  input.addEventListener("change",upload);
}
