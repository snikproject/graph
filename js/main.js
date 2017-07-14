import loadGraphFromFile from "./loadGraphFromFile.js";
import loadGraphFromSparql from "./loadGraphFromSparql.js";
import * as log from "./log.js";
import addFilterEntries from "./filter.js";
import addMenu from "./menu.js";
import addSearch from "./search.js";
import addButtons from "./button.js";
import * as graph from "./graph.js";

graph.initGraph();
const LOAD_GRAPH_FROM_SPARQL = true;
(LOAD_GRAPH_FROM_SPARQL?loadGraphFromSparql():loadGraphFromFile())
  .then((cy)=>
  {
    addMenu();
    addFilterEntries(cy,document.getElementById("filter"));
    addSearch();
    addButtons();
  })
  .catch(e=>
  {
    log.error("menu load error",e);
  });
