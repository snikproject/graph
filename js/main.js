import {initGraphFromFile} from "./initGraphFromFile.js";
import {initGraphFromSparql} from "./initGraphFromSparql.js";
import * as log from "./log.js";
import addFilterEntries from "./filter.js";
import addMenu from "./menu.js";
import addSearch from "./search.js";
import addButtons from "./button.js";

const INIT_GRAPH_FROM_SPARQL = true;
(INIT_GRAPH_FROM_SPARQL?initGraphFromSparql():initGraphFromFile())
  .then((cy)=>
  {
    addMenu();
    addFilterEntries(cy,document.getElementById("filter"));
    addSearch();
    addButtons();
  })
  .catch(e=>
  {
    log.error("menu init error",e);
  });
