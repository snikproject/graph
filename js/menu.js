import {MODIFIED,ONTOLOGY_MODIFIED} from "./about.js";
import * as layout from "./layout.js";

function about() {window.alert("SNIK Graph version "+MODIFIED+"\nOntology version "+ONTOLOGY_MODIFIED);}
/**entries is an array of arrays of size two, entries[i][0] is either a link as a string (will be opened on another tab) or a function that will be executed. entries[i][1] is a label as a string.  */

function menuData()
{
  return [
    {
      "label": "Services",
      "id":"services",
      "entries":
      [
      ["http://www.snik.eu/sparql","SPARQL Endpoint"],
      ["http://lodview.it/lodview/?sparql=http%3A%2F%2Fwww.snik.eu%2Fsparql&prefix=http%3A%2F%2Fwww.snik.eu%2Fontology%2F&IRI=http%3A%2F%2Fwww.snik.eu%2Fontology%2Fmeta%2FTop","RDF Browser"],
      ["http://snik.eu/evaluation","Data Quality Evaluation"]
      ]
    },
    {
      "label": "Filter",
      "id": "filter",
      "entries": [] // filled by addFilterEntries() from filter.js
    },
    {
      "label": "Options",
      "id": "options",
      "entries": [] // filled by addOptions()
    },
    {
      "label": "Layouts",
      "id": "layouts",
      "entries":
      [
      [()=>layout.run(layout.colaInf),"Cola-Infinite (Experimental)"],
      [()=>layout.run(layout.cola),"Cola (Experimental)"],
      [()=>layout.run(layout.cose),"Cose (Experimental)"],
      [()=>layout.run(layout.coseBilkent),"Cose-Bilkent (Experimental)"],
      [()=>layout.run(layout.breadthfirst),"Breadthfirst (Experimental)"],
      [()=>layout.run(layout.grid),"Grid"],
      ]
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
      ["https://github.com/IMISE/snik-cytoscape.js/issues","Submit Feedback about the Visualization"]
      ]
    },
  ];
}

function addOptions()
{
  document.getElementById("options").innerHTML =
  `<span><input type="checkbox" id="cumulativesearch"/>cumulative search</span>
  <span><input type="checkbox" value="false" id="daymode" onclick="graph.invert(this.checked)"/>day mode</span> `;
}

function addMenu()
{
  //const frag = new DocumentFragment();
  const ul = document.createElement("ul");
  ul.classList.add("dropdown");
  for(const menu of menuData())
  {
    const li = document.createElement("li");
    ul.append(li);
    li.classList.add("dropdown");

    const div = document.createElement("div");
    li.append(div);
    div.classList.add("dropdown-content");
    div.setAttribute("id",menu.id);
    {
      const a = document.createElement("a");
      li.prepend(a);
      a.setAttribute("href","javascript:void(0)");
      a.innerText=menu.label;
      a.classList.add("dropbtn");
      a.addEventListener("click",()=>div.classList.toggle("show"));
    }
    for(const entry of menu.entries)
    {
      const a = document.createElement("a");
      div.append(a);
      a.innerText=entry[1];
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
      default: console.error("unknown menu entry action type: "+typeof entry[0]);
      }
      //
    }
  }
  document.getElementById("top").prepend(ul);
  addOptions();
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(e)
{//console.log(e);
  // don't close while user edits the text field of the custom filter
  if (!e.target.matches('.dropbtn')&&!e.target.matches('input#customfilter'))
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
