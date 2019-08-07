/**
Search classes by chapter.
@module */
import * as graph from "./graph.js";
import * as sparql from "../sparql.js";
import * as util from "./util.js";

/** Show the classes of a chapter in the class table
@param {string} chapter the chapter string value exactly as in the SPARQL triples, such as "5.3".*/
async function showClasses(chapter)
{
  const addPresentUrisRow = (label,table,bindings,hide) =>
  {
    const row = table.insertRow();
    const showClassesInGraphLink = row.insertCell();
    showClassesInGraphLink.innerHTML=label;
    showClassesInGraphLink.addEventListener("click",()=>
    {
      MicroModal.close("chapter-search");
      graph.presentUris(bindings.map(b=>b.class.value),hide);
    });
  };

  const addHeader = (table,bindings) =>
  {
    addPresentUrisRow("Show Only those in Graph",table,bindings,true);
    addPresentUrisRow("Highlight All in Graph",table,bindings,false);
    // visual separator
    const emptyRow = table.insertRow();
    const emptyCell = emptyRow.insertCell();
    emptyCell.innerHTML="&nbsp;"; // see https://stackoverflow.com/questions/42225196/prevent-collapse-of-empty-rows-in-html-table-via-css/42225797
  };

  const table = util.getElementById("tab:chapter-search-classes");
  while(table.rows.length>0) {table.deleteRow(0);} // clear leftovers from last time

  // fetch bb chapters and their class count
  const chapterClassQuery =
  `SELECT DISTINCT(?class) ?label
  FROM <http://www.snik.eu/ontology/bb>
  {
    ?class  ?p ?o;
            a owl:Class;
            rdfs:label ?label;
            bb:Chapter "${chapter}"^^xsd:string.

    FILTER(LANGMATCHES(LANG(?label),"en"))
  }
  ORDER BY ASC(?class)`;

  const bindings = await sparql.select(chapterClassQuery,sparql.SPARQL_GRAPH_BB);

  addHeader(table,bindings);

  for(const binding of bindings)
  {
    const row = table.insertRow();
    row.addEventListener("click",()=>
    {
      MicroModal.close("chapter-search");
      graph.presentUri(binding.class.value);
    });
    const labelCell = row.insertCell();
    labelCell.innerHTML = binding.label.value;
  }
}

/**
*
*/
export async function showChapterSearch()
{
  MicroModal.show("chapter-search");

  const table = util.getElementById("tab:chapter-search-chapters");
  while(table.rows.length>0) {table.deleteRow(0);} // clear leftovers from last time

  // fetch bb chapters and their class count
  const chapterSizeQuery =
  `SELECT COUNT(DISTINCT(?c)) AS ?count ?ch
  FROM <http://www.snik.eu/ontology/bb>
  {
    ?c ?p ?o; a owl:Class.
    ?c bb:Chapter ?ch.
    filter(str(?ch)!="")
  } ORDER BY ASC(?ch)`;

  const bindings = await sparql.select(chapterSizeQuery,sparql.SPARQL_GRAPH_BB);
  for(const binding of bindings)
  {
    const row = table.insertRow();
    row.addEventListener("click",()=>showClasses(binding.ch.value));
    const chapterCell = row.insertCell();
    chapterCell.innerHTML = binding.ch.value;
    const countCell = row.insertCell();
    countCell.innerHTML = binding.count.value;
  }
}
