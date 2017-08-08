import loadGraphFromSparql from "./loadGraphFromSparql.js";
import * as log from "./log.js";
import addFilterEntries from "./filter.js";
import addMenu from "./menu.js";
import * as search from "./search.js";
import addButtons from "./button.js";
import * as graph from "./graph.js";
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

loadGraphFromSparql()
  .then((cy)=>
  {
    addMenu();
    addFilterEntries(cy,document.getElementById("filter"));
    search.addSearch();
    addButtons();
  })
  .catch(e=>
  {
    log.error("menu load error",e);
  })
  .then(()=>progress(100));
