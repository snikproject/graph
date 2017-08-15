import {MODIFIED,ONTOLOGY_MODIFIED} from "./about.js";
import * as layout from "./layout.js";
import * as log from "./log.js";
import * as file from "./file.js";
import {invert} from "./graph.js";
import loadGraphFromSparql from "./loadGraphFromSparql.js";

function about() {window.alert("SNIK Graph version "+MODIFIED+"\nOntology version "+ONTOLOGY_MODIFIED);}
/**entries is an array of arrays of size two, entries[i][0] is either a link as a string (will be opened on another tab) or a function that will be executed. entries[i][1] is a label as a string.  */

function addLoadEntries()
{
  // TODO: implement
}

function menuData()
{
  return [
    {
      "label": "File",
      "id": "file",
      "entries":
      [
        [loadGraphFromSparql,"Load from SPARQL Endpoint"],
        [file.saveGraph,"Save Full Graph with Layout"],
        [file.saveVisibleGraph,"Save Visible Graph with Layout"],
        [file.saveLayout,"Save Layout only"],
      ],
    },
    {
      "label": "Filter",
      "id": "filter",
      "entries": [], // filled by addFilterEntries() from filter.js
    },
    {
      "label": "Options",
      "id": "options",
      "entries": [], // filled by addOptions()
    },
    /*{
      "label": "Layouts",
      "id": "layouts",
      "entries":
      [
        [()=>layout.run(layout.euler),"Euler"],
        [()=>layout.run(layout.colaInf),"Cola-Infinite (Slow)"],
        [()=>layout.run(layout.cola),"Cola (Slow)"],
        [()=>layout.run(layout.cose),"Cose (Slow)"],
        [()=>layout.run(layout.coseBilkent),"Cose-Bilkent (Slow)"],
        [()=>layout.run(layout.breadthfirst),"Breadthfirst"],
        [()=>layout.run(layout.grid),"Grid"],
      ],
    },*/
    {
      "label": "Services",
      "id":"services",
      "entries":
          [
            ["http://www.snik.eu/sparql","SPARQL Endpoint"],
            ["http://lodview.it/lodview/?sparql=http%3A%2F%2Fwww.snik.eu%2Fsparql&prefix=http%3A%2F%2Fwww.snik.eu%2Fontology%2F&IRI=http%3A%2F%2Fwww.snik.eu%2Fontology%2Fmeta%2FTop","RDF Browser"],
            ["http://snik.eu/evaluation","Data Quality Evaluation"],
          ],
    },
    {
      "label": "Help",
      "id": "help",
      "entries":
      [
        ["manual.html","Manual"],
        ["troubleshooting.html","Troubleshooting"],
        ["contribute.html","Contribute"],
        ["http://www.snik.eu/","Project Homepage"],
        ["https://github.com/IMISE/snik-ontology/releases/download/0.3.0/snik-0.3-nociox.cys","Download Cytoscape Graph"],
        [about,"About SNIK Graph"],
        ["https://github.com/IMISE/snik-ontology/issues","Submit Feedback about the Ontology"],
        ["https://github.com/IMISE/snik-cytoscape.js/issues","Submit Feedback about the Visualization"],
      ],
    },
  ];
}

function addOptions()
{
  document.getElementById("options").innerHTML =
  `<span class="dropdown-entry"><input type="checkbox" autocomplete="off" id="cumulativesearch"/>cumulative search</span>
  <span  class="dropdown-entry"><input type="checkbox"  autocomplete="off" id="daymode"/>day mode</span> `;
  const daymode = document.getElementById("daymode");
  daymode.addEventListener("change",()=>invert(daymode.checked));
}

function addMenu()
{
  //const frag = new DocumentFragment();
  const ul = document.createElement("ul");
  ul.classList.add("dropdown-bar");
  for(const menu of menuData())
  {
    const li = document.createElement("li");
    ul.appendChild(li);
    li.classList.add("dropdown-menu");
    li.innerText=menu.label;

    const div = document.createElement("div");
    li.appendChild(div);
    div.classList.add("dropdown-content");
    div.id=menu.id;

    li.addEventListener("click",()=>
    {
      for(const otherDiv of document.getElementsByClassName("dropdown-content"))
      {
        if(div!==otherDiv) {otherDiv.classList.remove("show");}
      }
      div.classList.toggle("show");
    });

    //li.addEventListener("click",()=>div.style.display=(div.style.display==="block"?"none":"block"));

    for(const entry of menu.entries)
    {
      const a = document.createElement("a");
      a.classList.add("dropdown-entry");
      div.appendChild(a);
      a.innerHTML=entry[1];
      switch(typeof entry[0])
      {
      case 'string':
      {
        a.href=entry[0];
        a.target="_blank";
        break;
      }
      case 'function':
      {
        a.addEventListener("click",entry[0]);
        break;
      }
      default: log.error("unknown menu entry action type: "+typeof entry[0]);
      }
      //
    }
  }
  document.getElementById("top").prepend(ul);
  addOptions();
  addLoadEntries();
}

// Close the dropdown if the user clicks outside of the menu
window.onclick = function(e)
{
  if (e&&e.target&&e.target.matches&&!e.target.matches('.dropdown-entry')&&!e.target.matches('.dropdown-menu')
  &&!e.target.matches('input#customfilter')) // don't close while user edits the text field of the custom filter
  {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var d = 0; d < dropdowns.length; d++)
    {
      var openDropdown = dropdowns[d];
      if (openDropdown.classList.contains('show'))
      {
        openDropdown.classList.remove('show');
      }
    }
  }
};

export default addMenu;
