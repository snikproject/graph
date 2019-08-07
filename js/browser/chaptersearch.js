/**
Search classes by chapter.
@module */
import * as graph from "./graph.js";
import * as sparql from "../sparql.js";
import * as util from "./util.js";

/** @type {Map<Array<string>>} */
const chapters = new Map();
const labels = new Map();

const selectedChapters = new Set();

/**
@return {Set<string>} classes the set of classes in that chapter
@param {string} chapter the chapter string value exactly as in the SPARQL triples, such as "5.3".
*/
async function getClasses(chapter)
{
  //if(chapters.has(chapter)) {return chapters.get(chapter);}

  const query =
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

  const bindings = await sparql.select(query,sparql.SPARQL_GRAPH_BB);
  bindings.forEach(b=>{labels.set(b.class.value,b.label.value);});

  const classes = bindings.map(b=>b.class.value);
  chapters.set(chapter,classes);
  return new Set(classes);
}

/** Show the classes of a chapter in the class table
@param {Set<string>} classes the classes to show. */
async function showClasses(classes)
{
  const table = util.getElementById("tab:chapter-search-classes");

  const addPresentUrisRow = (label,hideOthers) =>
  {
    const row = table.insertRow();
    const showClassesInGraphCell = row.insertCell();
    const showClassesInGraphA = document.createElement("a");
    showClassesInGraphCell.appendChild(showClassesInGraphA);
    showClassesInGraphA.innerText=label;
    showClassesInGraphA.addEventListener("click",()=>
    {
      MicroModal.close("chapter-search");
      graph.resetStyle();
      graph.presentUris(classes,hideOthers);
    });
  };

  while(table.rows.length>0) {table.deleteRow(0);} // clear leftovers from last time

  // header *****************************************************+
  addPresentUrisRow("Show Only those in Graph",true);
  addPresentUrisRow("Highlight All in Graph",false);
  // visual separator
  const emptyRow = table.insertRow();
  const emptyCell = emptyRow.insertCell();
  emptyCell.innerHTML="&nbsp;"; // see https://stackoverflow.com/questions/42225196/prevent-collapse-of-empty-rows-in-html-table-via-css/42225797
  // body ********************************************************
  for(const clazz of classes)
  {
    const row = table.insertRow();
    const labelCell = row.insertCell();
    const labelA = document.createElement("a");
    labelCell.appendChild(labelA);
    labelA.innerText = labels.get(clazz);
    labelA.addEventListener("click",()=>
    {
      MicroModal.close("chapter-search");
      graph.presentUri(clazz);
    });
  }
  // *************************************************************
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
    const chapter = binding.ch.value;

    const row = table.insertRow();
    const chapterCell = row.insertCell();
    chapterCell.addEventListener("click",async ()=>showClasses(await getClasses(chapter)));
    chapterCell.innerHTML = binding.ch.value;
    const countCell = row.insertCell();
    countCell.innerHTML = binding.count.value;

    const checkCell = row.insertCell();
    const checkBox = document.createElement("input");
    checkCell.appendChild(checkBox);
    checkBox.setAttribute("type","checkbox");
    checkCell.addEventListener("input",async ()=>
    {
      if(checkBox.checked)
      {
        await getClasses(chapter);
        selectedChapters.add(chapter);
      }
      else
      {
        selectedChapters.delete(chapter);
      }
      // union of all classes in selected chapters
      // JavaScript doesn't have a set union operator yet and the spreadi
      showClasses(new Set(
        [...selectedChapters].map(ch=>chapters.get(ch)).flat().sort()
      ));
    });
  }
}
