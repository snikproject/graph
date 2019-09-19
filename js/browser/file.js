/** Module for loading files both locally from the server and via upload from the client.
@module */
import * as graph from "./graph.js";
import * as layout from "../layout.js";

/**
Uploads a JSON file from the user.
@param {Event} event a file input change event
@param {function} callback the code to execute, receives a JSON object
*/
function uploadJson(event,callback)
{
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = ()=>callback(JSON.parse(reader.result));
  reader.readAsText(file);
}

/**
Load a layouted graph from the JSON file specified by the given file input change event.
@param {Event} event a file input change event
*/
export function loadGraph(event)
{
  uploadJson(event,json=>
  {
    graph.cy.elements().remove();
    graph.cy.add(json);
    graph.cy.elements().addClass("unfiltered");
    const visibleFraction = 1.0*graph.cy.elements(":visible").size()/graph.cy.elements().size();
    const starMode = visibleFraction<0.8;
    log.info("Load Graph from File: Visible fraction: "+visibleFraction+" set star mode to "+starMode);
    if(graph.cy.nodes(":child").size()>0) {document.getElementById("combine-match-checkbox").checked=true;}
    graph.setStarMode(starMode);
    graph.cy.center(":visible");
    graph.cy.fit(":visible");
  });
}

/**
Load a layout from the JSON file specified by the given file input change event.
@param {Event} event a file input change event
*/
export function loadLayout(event)
{
  uploadJson(event,json=>{layout.presetLayout(graph.cy,json);});
}

/**
Add an upload entry to the file menu.
@param {Element} parent the parent element of the menu
@param {string} id id root for the generated elements, must be unique
@param {string} description the text of the menu item
@param {function} func the function to be executed when the user clicks on the menu entry
*/
function addLoadEntry(parent,i18n,description,func,as)
{
  const a = document.createElement("a");
  as.push(a);
  a.classList.add("dropdown-entry");
  a.setAttribute("tabindex",-1);
  parent.appendChild(a);
  const input = document.createElement("input");
  input.type="file";
  input.style.display="none";
  a.appendChild(input);
  const inner = document.createElement("span");
  inner.innerText=description;
  inner.setAttribute("data-i18n",i18n);
  a.appendChild(inner);
  // click event needs to trigger at the hidden input element so that it opens the file chooser dialog
  a.addEventListener("click",()=>input.click());
  // completed file chooser dialog triggers change event
  input.addEventListener("change",func);
}


/**
Add upload entries to the file menu.
Cannot use the simpler default menu creation method because file upload only works with an input.
@param {Element} parent the parent element of the menu
*/
export function addFileLoadEntries(parent,as)
{
  addLoadEntry(parent,"load-layout","Load Layout",loadLayout,as);
  addLoadEntry(parent,"load-graph-with-layout","Load Graph File with Layout",loadGraph,as);
}
