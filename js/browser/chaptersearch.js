/**
Search classes by chapter.
@module */
import * as graph from "./graph.js";
import * as sparql from "../sparql.js";
import * as util from "./util.js";

/** Show the classes of a chapter in class table
@param {string} chapter the chapter string value exactly as in the SPARQL triples, such as "5.3".*/
async function showClasses(chapter)
{
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
  for(const binding of bindings)
  {
    const row = table.insertRow();
    row.addEventListener("click",()=>{MicroModal.close("chapter-search");graph.presentUri(binding.class.value);});
    //const uriCell = row.insertCell();
    //uriCell.innerHTML = binding.class.value;
    const labelCell = row.insertCell();
    labelCell.innerHTML = binding.label.value;
  }
  const row = table.insertRow(0);
  const showClassesInGraphLink = row.insertCell();
  showClassesInGraphLink.innerHTML="Show All in Graph";
  showClassesInGraphLink.addEventListener("click",()=>{MicroModal.close("chapter-search");graph.presentUris(bindings.map(b=>b.class.value));});
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
