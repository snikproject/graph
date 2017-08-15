import loadGraphFromSparql from "./loadGraphFromSparql.js";
import * as log from "./log.js";
import addFilterEntries from "./filter.js";
import addMenu from "./menu.js";
import * as search from "./search.js";
import addButtons from "./button.js";
import * as graph from "./graph.js";
import * as file from "./file.js";
import * as rdfGraph from "./rdfGraph.js";
import * as layout from "./layout.js";
//import * as history from "./history.js";
import {progress} from "./progress.js";

progress(0);
graph.initGraph();

//history.initHistory();
window.addEventListener('keydown', e=>
{
  if((e.key==='Escape'||e.key==='Esc'||e.keyCode===27))// && (e.target.nodeName==='BODY'))
  {
    e.preventDefault();
    //history.hideHistory();
    search.hideSearchResults();
    return false;
  }
}, true);

loadGraphFromSparql(graph.cy,rdfGraph.subs())
  .then(()=>
  {
    layout.runCached(graph.cy,layout.euler,rdfGraph.subs());
  })
  .catch((e)=>
  {
    log.error("Error layouting",e.stack);
  })
  .then(()=>
  {
    addMenu();
    addFilterEntries(graph.cy,document.getElementById("filter"));
    file.addFileLoadEntries(document.getElementById("file"));
    search.addSearch();
    addButtons();
  })
  .catch(e=>
  {
    log.error("menu load error",e);
  })
  .then(()=>progress(100));
