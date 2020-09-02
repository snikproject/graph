/** Module for loading files both locally from the server and via upload from the client.
@module */
import * as layout from "../layout.js";
import {View,views,reset,activeView} from "./view.js";

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

/** Clear the graph and load the contents of the Cytoscape.js JSON file in it. */
function loadGraphFromJson(graph,json)
{
  graph.cy.elements().remove();
  graph.cy.json(json);
  graph.cy.elements().addClass("unfiltered");
  const visibleFraction = 1.0*graph.cy.elements(":visible").size()/graph.cy.elements().size();
  const starMode = visibleFraction<0.8;
  log.debug("Load Graph from File: Visible fraction: "+visibleFraction+" set star mode to "+starMode);
  if(graph.cy.nodes(":child").size()>0) {document.getElementById("combine-match-checkbox").checked=true;}
  graph.starMode = starMode;
  graph.cy.center(":visible");
  graph.cy.fit(":visible");
}

/**
Curried function.
Load a layouted graph from the JSON file specified by the given file input change event.
@param {Graph} graph a
@param {Event} event a file input change event
*/
export const loadGraphFromJsonFile = graph => event =>
{
  uploadJson(event,json=>
  {
    loadGraphFromJson(graph,json);
  });
};


/** Loads the contents of all views from a JSON file.
    @param {Event} event a file input change event
*/
export async function loadSessionFromJsonFile(event)
{
  uploadJson(event,async json =>
  {
    reset();
    const view=new View(false);
    loadGraphFromJson(view.state.graph,json.mainGraph.graph);
    activeView().setTitle(json.mainGraph.title);
    for (let i =0; i<json.tabs.length;i++)
    {
      const view = new View(false);
      loadGraphFromJson(view.state.graph,json.tabs[i].graph);
      activeView().setTitle(json.tabs[i].title);
    }
  });
}

/** Loads a stored view from a JSON file. */
export function loadView(event)
{
  uploadJson(event,json =>
  {
    const view=new View(false);
    loadGraphFromJson(view.state.graph,json.graph);
    activeView().setTitle(json.title);
  });
}

/**
Load a layout from the JSON file specified by the given file input change event.
@param {Event} event a file input change event
*/
export const loadLayout = graph => event =>
{
  uploadJson(event,json=>{layout.presetLayout(graph.cy,json);});
};

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
export function addFileLoadEntries(graph,parent,as)
{
  addLoadEntry(parent,"load-view","Load Partial Graph",loadView,as);
  addLoadEntry(parent,"load-session","Load Session",loadSessionFromJsonFile,as);
}
