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
import progress from "./progress.js";
import config from "../config.js";
import initLog from "./log.js";
import * as util from "./util.js";
import ContextMenu from "./contextmenu.js";
import {addOverlay} from "./benchmark.js";
import * as help from "./help.js";

/** Parse browser URL POST parameters. */
function parseParams()
{
  const url = new URL(window.location.href);
  const defaults =
  {
    endpoint: config.sparql.endpoint,
  };
  return Object.assign(defaults,{
    empty: (url.searchParams.get("empty")!==null),
    clazz: url.searchParams.get("class"),
    jsonUrl: url.searchParams.get("json"),
    endpoint: url.searchParams.get("sparql"),
    instances: (url.searchParams.get("instances")!==null), // load and show instances when loading from endpoint, not only class
    virtual: (url.searchParams.get("virtual")!==null), // create "virtual triples" to visualize connections like domain-rang
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
        loadGraphFromJsonFile(graph,event);
      });
      return;
    }
    if(params.jsonUrl)
    {
      const json = await (await fetch(params.jsonUrl)).json();
      graph.cy.add(json);
      layout.run(graph.cy,layout.euler);
      return;
    }
    if(params.endpoint)
    {
      log.info("Loading from SPARQL Endpoint "+params.endpoint);
      config.sparql.endpoint = params.endpoint;
      const graphs = [];
      if(params.rdfGraph)
      {
        graphs.push(params.rdfGraph);
        config.sparql.graph = params.rdfGraph;
      }
      {await loadGraphFromSparql(graph,graphs,params.instances,params.virtual);}
      graph.instancesLoaded = params.instances;
      layout.run(graph.cy,layout.euler);
      return;
    }
    let subs = [];
    if(params.sub)
    {
      subs = params.sub.split(",");
    }
    if(subs.length===0) {subs = [...config.helperGraphs,...config.defaultSubOntologies];}
    const graphs = subs.map(g=>"http://www.snik.eu/ontology/"+g);
    await loadGraphFromSparql(graph,graphs,params.instances);
    graph.instancesLoaded = params.instances;
    layout.runCached(graph.cy,layout.euler,config.defaultSubOntologies,false);

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

/** Entry point. Is run when DOM is loaded. **/
function main()
{
  initLog();
  MicroModal.init({openTrigger: 'data-custom-open'});

  progress(async ()=>
  {
    console.groupCollapsed("Initializing");

    const graph = new Graph(document.getElementById("graph"));
    graph.params = parseParams();
    await applyParams(graph,graph.params);
    const menu = new Menu(graph);
    new ContextMenu(graph, menu);
    new Search(graph,util.getElementById("search"));
    util.getElementById("top").appendChild(new ButtonBar(graph, menu).container);
    help.init();
  });
}

document.addEventListener("DOMContentLoaded",main);
