import {initGraphFromFile} from "./initGraphFromFile.js";
import {initGraphFromSparql} from "./initGraphFromSparql.js";
import addFilterEntries from "./filter.js";
import addMenu from "./menu.js";
import addSearch from "./search.js";
import addButtons from "./button.js";

const INIT_GRAPH_FROM_SPARQL = false;
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
  console.error(e,"menu init error");
});
