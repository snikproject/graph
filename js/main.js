/**
Entry point.
@module */
import loadGraphFromSparql from "./loadGraphFromSparql.js";
import addFilterEntries from "./filter.js";
import {addMenu} from "./menu.js";
import * as search from "./search.js";
import addButtons from "./button.js";
import * as graph from "./graph.js";
import * as file from "./file.js";
import * as rdfGraph from "./rdfGraph.js";
import * as layout from "./layout.js";
import {progress} from "./progress.js";
import config from "./config.js";

/** Entry point. Is run when DOM is loaded. **/
function main()
{
  progress(0);
  graph.initGraph();

  window.addEventListener('keydown', e=>
  {
    if((e.key==='Escape'||e.key==='Esc'||e.keyCode===27))// && (e.target.nodeName==='BODY'))
    {
      e.preventDefault();
      search.hideSearchResults();
      return false;
    }
  }, true);

  loadGraphFromSparql(graph.cy,new Set(config.defaultSubOntologies))
    .then(()=>
    {
      layout.runCached(graph.cy,layout.euler,rdfGraph.subs());
    })
    .then(()=>
    {
      addMenu();

      addFilterEntries(graph.cy,document.getElementById("filter-div"));
      file.addFileLoadEntries(document.getElementById("file-div"));
      search.addSearch();
      addButtons();
    })
    .catch(e=>
    {
      console.error(e);
      alert("Error initializing SNIK Graph\n\n"+e);
    })
    .finally(()=>{progress(100);});
}

document.addEventListener("DOMContentLoaded",main);
