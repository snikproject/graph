/**
Lets the user save files generated from the loaded graph.
@module */
import * as layout from "../layout.js";
import config from "../config.js";
import {toJSON} from "./state.js";
import {views} from "./view.js";
import {VERSION} from "./util.js";

let a = null; // reused for all saving, not visible to the user

/**
Create a JSON file out of a JSON data string and lets the user save it.
Based on https://stackoverflow.com/questions/19327749/javascript-blob-fileName-without-link
@param {string} data a JSON string
@param {string} fileName the name of the saveed file
*/
export function saveJson(data,fileName)
{
  if(a===null)
  {
    a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
  }
  console.log(data);
  const json = JSON.stringify(data);
  const blob = new Blob([json], {type: "application/json"});
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  log.info("JSON File saved: "+fileName);
}

/**
Lets the user save a file.
Based on https://stackoverflow.com/questions/19327749/javascript-blob-fileName-without-link
@param {string} url a URL that resolves to a file
@param {string} fileName the name of the saveed file
*/
export function saveUrl(url, fileName)
{
  if(a===null)
  {
    a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
  }
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  log.info("File saveed: "+fileName);
}

/** Saves the whole layouted graph as a Cytoscape JSON file. */
export function saveGraph(graph)
{
  const json = graph.cy.json();
  delete json.style; // the style gets corrupted on export due to including functions, the default style will be used instead
  saveJson(json,"snik.json");
}

/** Saves the contents of all views as a custom JSON file. */
export function saveSession()
{
  const session = {tabs:[], state: toJSON()};
  session.mainGraph=
  {
    title: views[0].state.title,
    graph: views[0].state.cy.json(),
  };
  delete session.mainGraph.graph.style; // the style gets corrupted on export due to including functions, the default style will be used instead
  for (let i=1; i<views.length;i++)
  {
    session.tabs.push({
      title: views[i].state.title,
      graph: views[i].state.cy.json(),
    });
    delete session.tabs[i-1].graph.style; // the style gets corrupted on export due to including functions, the default style will be used instead
  }
  saveJson(session,"snik-session.json");
}

/** Saves the contents of the current view as a custom JSON file.
    @param view a GoldenLayout view
*/
export function saveView(view)
{
  const layoutState = view.config.componentState;
  const json ={
    version: VERSION,
    title: view.config.title,
    graph: layoutState.cy.json(),
  };
  delete json.graph.style; // the style gets corrupted on export due to including functions, the default style will be used instead
  saveJson(json,"snik-view.json");
}

/** Saves all node positions. Can only be applied later with a compatible graph already loaded.*/
export function saveLayout(graph) {return saveJson(layout.positions(graph.cy.nodes()),"layout.json");}

/**
Save the graph as a PNG (lossless compression).
@param {boolean} full Iff true, include the whole graph, otherwise only include what is inside the canvas boundaries.
@param {boolean} highRes Iff true, generate a high resolution picture using the maximum width and height from config.js.
Otherwise, either use the native resolution of the canvas (full=false) or the standard resolution (full=true) from config.js.
*/
export function savePng(graph,dayMode,full,highRes)
{
  const options =
  {
    "bg": dayMode?"white":"black", // background according to color mode
    "full": full,
  };
  if(highRes)
  {
    options.maxWidth=config.save.image.max.width;
    options.maxHeight=config.save.image.max.height;
  }
  else if(full)
  {
    options.maxWidth=config.save.image.standard.width;
    options.maxHeight=config.save.image.standard.height;
  }

  const image = graph.cy.png(options);
  saveUrl(image,"snik.png");
}

/**
Save the graph as a SVG (vector format).
@param {boolean} full Iff true, include the whole graph, otherwise only include what is inside the canvas boundaries.
*/
export function saveSvg(graph,dayMode,full = true)
{
  const options =
  {
    full: full, // default to full
    scale : 1,
    bg: dayMode?"white":"black", // background according to color mode
  };
  const data = graph.cy.svg(options);
  const blob = new Blob([data], {type:"image/svg+xml;charset=utf-8"});
  const url = window.URL.createObjectURL(blob);
  saveUrl(url,"snik.svg");
}
