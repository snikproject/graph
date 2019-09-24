/**
Entry point.
@module */
import loadGraphFromSparql from "../loadGraphFromSparql.js";
import * as menu from "./menu.js";
import * as search from "./search.js";
import addButtons from "./button.js";
import {loadGraph} from "./file.js";
import * as graph from "./graph.js";
import * as layout from "../layout.js";
import progress from "./progress.js";
import config from "../config.js";
import * as util from "./util.js";
import {registerContextMenu} from "./contextmenu.js";
import {addOverlay} from "./benchmark.js";


/** Entry point. Is run when DOM is loaded. **/
function main()
{
  MicroModal.init({openTrigger: 'data-custom-open'});

  const notyf = new Notyf(
    {
      duration: 10000,
      types: [
        {
          type: 'warn',
          backgroundColor: 'orange',
          icon: {
            className: 'material-icons',
            tagName: 'i',
            text: 'warning',
          },
        },
      ],
    }
  );

  log.setLevel(config.logLevelConsole);
  const funcs = ["error","warn","info"]; // keep trace and debug out of the persistant log as they are too verbose
  for(const f of funcs)
  {
    const tmp = log[f];
    log[f] = message  =>
    {
      if(!log.logs) {log.logs=[];}
      log.logs.push(message);
      tmp(message);
      switch(f)
      {
        case "error": notyf.error(message);break;
        case "warn": notyf.open({type: 'warn',message: message});
      }
    };
  }

  //logs.length = 0;
  progress(async ()=>
  {
    console.groupCollapsed("Initializing");

    graph.initGraph();

    menu.addMenu();

    registerContextMenu(util.getElementById("dev-mode-checkbox").checked,util.getElementById("ext-mode-checkbox").checked);

    addButtons();

    search.addSearch();

    try
    {
      const url = new URL(window.location.href);
      const empty = (url.searchParams.get("empty")!==null);
      const clazz = url.searchParams.get("class");
      const jsonUrl = url.searchParams.get("json");
      const endpoint = url.searchParams.get("sparql");
      const instances = (url.searchParams.get("instances")!==null); // load and show instances when loading from endpoint, not only classes
      const virtual = (url.searchParams.get("virtual")!==null); // create "virtual triples" to visualize connections like domain-range
      const rdfGraph = url.searchParams.get("graph");
      const sub = url.searchParams.get("sub");
      const benchmark = (url.searchParams.get("benchmark")!==null);

      if(benchmark) {addOverlay(graph.cy);}

      if(empty)
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
          loadGraph(event);
        });
        return;
      }
      if(jsonUrl)
      {
        const json = await (await fetch(jsonUrl)).json();
        graph.cy.add(json);
        layout.run(graph.cy,layout.euler);
        return;
      }
      if(endpoint)
      {
        log.info("Loading from SPARQL Endpoint "+endpoint);
        const graphs = [];
        if(rdfGraph) {graphs.push(rdfGraph);}
        {await loadGraphFromSparql(graph.cy,graphs,endpoint,instances,virtual);}
        layout.run(graph.cy,layout.euler);
        return;
      }
      let subs = [];
      if(sub)
      {
        subs = sub.split(",");
      }
      if(subs===[]) {subs = [...config.helperGraphs,...config.defaultSubOntologies];}
      const graphs = subs.map(g=>"http://www.snik.eu/ontology/"+g);
      await loadGraphFromSparql(graph.cy,graphs);
      layout.runCached(graph.cy,layout.euler,config.defaultSubOntologies,menu.separateSubs());

      if(clazz)
      {
        log.info(`Parameter "class" detected. Centering on URI ${clazz}.`);
        graph.presentUri(clazz);
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
  });
}

document.addEventListener("DOMContentLoaded",main);
