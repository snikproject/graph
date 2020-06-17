/**
Entry point.
@module */
import loadGraphFromSparql from "../loadGraphFromSparql.js";
import Menu from "./menu.js";
import Search from "./search.js";
import ButtonBar from "./button.js";
import {loadGraphFromJsonFile} from "./file.js";
import {Graph} from "./graph.js";
import * as layout from "../layout.js";
import * as sparql from "../sparql.js";
import progress from "./progress.js";
import config from "../config.js";
import initLog from "./log.js";
import * as util from "./util.js";
import ContextMenu from "./contextmenu.js";
import {addOverlay} from "./benchmark.js";
import * as help from "../help.js";
import * as goldenlayout from "./goldenlayout.js";

/** Parse browser URL POST parameters. */
function parseParams()
{
  const url = new URL(window.location.href);
  const defaults =
  {
    endpoint: config.sparql.endpoint,
    instances: config.sparql.instances,
  };
  return Object.assign(defaults,{
    empty: (url.searchParams.get("empty")!==null),
    clazz: url.searchParams.get("class"),
    jsonUrl: url.searchParams.get("json"),
    ...(url.searchParams.get("sparql") && {endpoint: url.searchParams.get("sparql")}), // don't overwrite default with null
    // load and show instances when loading from endpoint, not only class
    // specify either without value ...&instances or as ...&instances=true
    ...((url.searchParams.get("instances")!==null) && {instances: url.searchParams.get("instances")==="" || url.searchParams.get("instances")===true}),
    virtual: (url.searchParams.get("virtual")!==null), // create "virtual triples" to visualize connections like domain-range
    rdfGraph: url.searchParams.get("graph"),
    sub: url.searchParams.get("sub"),
    benchmark: (url.searchParams.get("benchmark")!==null),
  });
}

/** Apply parameters. */
async function applyParams(graph,params)
{
  try
  {
    if(params.benchmark) {addOverlay(graph.cy);}

    if(params.empty)
    {
      log.info(`Parameter "empty" detected. Skip loading and display file load prompt.`);
      const loadArea = document.getElementById("loadarea");
      const center = document.createElement("center");
      loadArea.appendChild(center);
      center.innerHTML +=
      `<button id="load-button" style="font-size:10vh;margin-top:20vh">Datei Laden
      <input id="load-input" type="file" style="display:none"></input>
      </button>`;
      const loadInput = document.getElementById("load-input");
      document.getElementById("load-button").onclick=()=>{loadInput.click();};
      loadInput.addEventListener("change",(event)=>
      {
        loadArea.removeChild(center);
        graph.cy.resize(); // fix mouse cursor position, see https://stackoverflow.com/questions/23461322/cytoscape-js-wrong-mouse-pointer-position-after-container-change
        loadGraphFromJsonFile(graph)(event);
      });
      return;
    }
    if(params.jsonUrl)
    {
      log.info(`Loading from JSON URL `+params.jsonUrl);
      const json = await (await fetch(params.jsonUrl)).json();
      graph.cy.add(json);
      layout.run(graph.cy,layout.euler);
      return;
    }
    log.debug("Loading from SPARQL Endpoint "+params.endpoint);
    config.sparql.endpoint = params.endpoint; // loadGraphFromSparql loads from config.sparql.endpoint
    const graphs = [];
    if(params.endpoint===sparql.SNIK_ENDPOINT)
    {
      let subs = [];
      if(params.sub) {subs = params.sub.split(",");}
      if(subs.length===0) // either not present or empty value
      {
        subs = [...config.helperGraphs,...config.defaultSubOntologies];
      }
      graphs.push(...(subs.map(g=>sparql.SNIK_PREFIX+g)));
    }
    else if(params.rdfGraph)
    {
      graphs.push(params.rdfGraph);
      config.sparql.graph = params.rdfGraph;
    }
    console.debug(`Loading graph with${params.instances?"":"out"} instances.`);
    {await loadGraphFromSparql(graph.cy,graphs,params.instances,params.virtual);}
    graph.instancesLoaded = params.instances;
    if(params.endpoint===sparql.SNIK_ENDPOINT)
    {
      layout.runCached(graph.cy,layout.euler,config.defaultSubOntologies,false); // todo: use the correct subs
    }
    else
    {
      layout.run(graph.cy,layout.euler);
    }

    if(params.clazz)
    {
      log.info(`Parameter "class" detected. Centering on URI ${params.clazz}.`);
      graph.presentUri(params.clazz);
    }
  }
  catch(e)
  {
    log.error(e);
    log.error("Error initializing SNIK Graph "+e);
  }
  finally
  {
    console.groupEnd();
  }
}

/** Create a new Graph*/
function addGraph(container)
{
  progress(async ()=>
  {
    console.groupCollapsed("Initializing");
    console.time("Initializing");

    const graph = new Graph(container);
    graph.params = parseParams();
    await applyParams(graph,graph.params);
    const menu = new Menu(graph);
    new ContextMenu(graph, menu);
    new Search(graph,util.getElementById("search"));
    util.getElementById("top").appendChild(new ButtonBar(graph, menu).container);
    help.init();
    console.timeEnd("Initializing");
  });
}

/** Entry point. Is run when DOM is loaded. **/
function main()
{
  goldenlayout.init();
  initLog();
  MicroModal.init({openTrigger: 'data-custom-open'});

  for (let i = 1; i<=3;i++)
  {
    const graphDiv = document.createElement("div");
    util.getElementById("main"+i).parentNode.appendChild(graphDiv);
    addGraph(graphDiv);
  }
}

document.addEventListener("DOMContentLoaded",main);
