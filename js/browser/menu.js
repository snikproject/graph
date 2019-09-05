/**
Populates the menu bar on the top and initializes the context menu.
@module */
import * as download from "./download.js";
import * as graph from "./graph.js";
import * as layout from "../layout.js";
import * as NODE from "../node.js";
import loadGraphFromSparql from "../loadGraphFromSparql.js";
import * as language from "../lang/language.js";
import * as util from "./util.js";
import config from "../config.js";
import progress from "./progress.js";
import {registerContextMenu} from "./contextmenu.js";
import {showChapterSearch} from "./chaptersearch.js";
import addFilterEntries from "./filter.js";
import * as file from "./file.js";


/** @return whether subontologies are to be displayed separately. */
export function separateSubs()
{
  return util.getElementById('separate-subs-checkbox').checked;
}

/** Sets the preferred node label language attribute. Use the values from node.js. */
function setLanguage(lang)
{
  if(!language.setLanguage(lang))
  {
    log.warn("could not set language "+lang);
  }
  const strings = language.getIdStrings();
  for(const key of Object.keys(strings))
  {
    const elements = document.querySelectorAll(`[data-i18n="${key}"]`);
    if(elements.length===0)
    {
      log.warn(`i18n key ${key} not used`);
      continue;
    }
    for(const element of elements)
    {
      const s = strings[key];
      switch(element.tagName)
      {
        case "A":
        case "BUTTON":
        case "SPAN": element.textContent = s; break;
        default: log.warn(`Cannot assign text "${s}" to element with i18n key ${key} because its tag type ${element.tagName} is unsupported.`);
      }
    }
    // element.textContent = strings[id];
  }
  // graph.cy.style(style); // does not display the style correctly and doesn't update the labels
  // graph.cy.forceRender(); // does not update the labels either
  // the nuclear option works
  const elements = graph.cy.elements();
  graph.cy.remove(elements);
  elements.restore();
}

/** Notifies the user of the program version so that errors can be properly reported. */
function about() {window.alert("SNIK Graph version "+"[AIV]{version} {date}[/AIV]");}

/** Creates a GitHub issue for the visualization. */
function visualizationFeedback()
{
  util.createGitHubIssue(util.REPO_APPLICATION,"","Please type your issue here:\n\n\n\n"+
  "!!Please do not delete the following text, because its the log for developers!!\n\n", log.logs);
}

let parents = null;

/** Sets whether close matches are grouped in compound nodes. */
function combineMatch(enabled)
{
  if(!enabled)
  {
    if(parents)
    {
      parents.remove();
      graph.cy.nodes().move({parent:null});
    }
    return;
  }
  parents = graph.cy.collection();
  // Can be calculated only once per session but then it needs to be synchronized with in-visualization ontology edits.
  const matchEdges = graph.cy.edges('[pl="closeMatch"]').filter('.unfiltered').not('.hidden');
  const matchGraph = graph.cy.nodes('.unfiltered').not('.hidden').union(matchEdges);
  //graph.hide(graph.cy.elements());
  //graph.show(matchGraph);

  const components = matchGraph.components();
  for(let i=0; i < components.length; i++)
  {
    const comp = components[i];
    if(comp.length===1) {continue;}

    const id = 'parent'+i;
    let labels = {};
    const nodes = comp.nodes();

    for(let j=0; j < nodes.length ;j++) {labels = {...labels,...nodes[j].data("l")};}

    const priorities = {"jkbb":0, "ob": 1, "he": 2, "it4it": 3, "ciox": 4};
    const priority = prefix =>
    {
      const p = priorities[prefix];
      return p?p:99; // prevent null value on new prefix
    };
    nodes.sort((a,b)=>priority(a.data(NODE.PREFIX))-priority(b.data(NODE.PREFIX)));

    graph.cy.add({
      group: 'nodes',
      data: { id: id,   l: labels },
    });
    const parent = graph.cy.getElementById(id);
    parents.add(parent);

    for(let j=0; j < nodes.length ;j++) {nodes[j].move({parent:id});}

    // nearby but not exactly the same spot
    nodes.positions(nodes[0].position());
    // position in a circle around the first node
    for(let j=1; j < nodes.length ;j++) {nodes[j].shift({x: 100*Math.cos(2*Math.PI*j/(nodes.length-1)), y: 100*Math.sin(2*Math.PI*j/(nodes.length-1))});}
  }


  //const closeMatchNodes = closeMatchEdges.connectedNodes();
}

/** Show all nodes that are connected via close matches to visible nodes. */
function showCloseMatches()
{
  log.debug("show close matches start");
  const visible = graph.cy.elements('.unfiltered').not('.hidden');
  //const closeMatchEdges = graph.cy.edges('[pl="closeMatch"]');
  const newEdges = visible.connectedEdges(".unfiltered").filter('[pl="closeMatch"]');
  graph.show(newEdges);
  graph.show(newEdges.connectedNodes(".unfiltered"));
  log.debug("show close matches end");
  //closeMatchEdges.connectedNodes();
  //".unfiltered";
}

/**
Creates and returns the menus for the top menu bar.
The format is an array of menu elements.
Each menu element is an object with a "label", unique "id" and an "entries" array.
entries is an array of arrays of size two.
entries[i][0] is either a link as a string (will be opened on another tab) or a function that will be executed.
entries[i][1] is a label as a string.
* @return {Object} the array of menu elements.
*/
function menuData()
{
  return [
    {
      "label": "File",
      "i18n": "file",
      "id": "file",
      "entries":
      [
        [async ()=>
        {
          await loadGraphFromSparql(graph.cy,new Set(config.defaultSubOntologies));
          progress(()=>layout.runCached(graph.cy,layout.euler,config.defaultSubOntologies,separateSubs()));
        },
        "Load from SPARQL Endpoint","load-sparql"],
        [download.downloadGraph,"Save Full Graph with Layout as Cytoscape File","save-cytoscape-full"],
        [download.downloadVisibleGraph,"Save Visible Graph with Layout as Cytoscape File","save-cytoscape-visible"],
        [download.downloadLayout,"Save Layout only","save-layout"],
        [()=>
        {
          progress(()=>layout.run(graph.cy,layout.euler,config.defaultSubOntologies,separateSubs(),true));
        },"Recalculate Layout and Replace in Browser Cache","recalculate-layout-replace"],
        [()=>download.downloadPng(false,false),"Save Image of Current View","save-image-current-view"],
        [()=>download.downloadPng(true,false),"Save Image of Whole Graph","save-image-whole-graph"],
        [()=>download.downloadPng(false,true),"Save Image of Current View (high res)","save-image-current-view-high-res"],
        [()=>download.downloadPng(true,true),"Save Image of Whole Graph (high res)","save-image-whole-graph-high-res"],
      ],
    },
    {
      "label": "Filter",
      "i18n": "filter",
      "id": "filter",
      "entries": [], // filled by addFilterEntries() from filter.js
    },
    {
      "label": "Options",
      "i18n": "options",
      "id": "options",
      "entries": [], // filled by addOptions()
    },
    {
      "label": "Layout",
      "i18n":"layout",
      "entries":
          [
            [showCloseMatches,"show close matches","show-close-matches"],
            [()=>{layout.run(graph.cy,layout.euler,config.defaultSubOntologies,separateSubs()&&!graph.getStarMode(),true);}, "recalculate layout", "recalculate-layout","ctrl+alt+l"],
            [()=>{layout.run(graph.cy,layout.eulerTight,config.defaultSubOntologies,separateSubs()&&!graph.getStarMode(),false);}, "tight layout","tight-layout","ctrl+alt+t"],
            //[()=>{layout.run(graph.cy,layout.eulerVariable(util.getElementById("layout-range").value),config.defaultSubOntologies,separateSubs()&&!graph.getStarMode(),false);}, "custom layout","custom-layout"],
            [()=>{layout.run(graph.cy,layout.cose,config.defaultSubOntologies,separateSubs()&&!graph.getStarMode(),false);}, "compound layout","compound-layout","ctrl+alt+c"],
            [()=>{showChapterSearch();},"chapter search","chapter-search"],
            [graph.resetStyle, "reset view","reset-view","ctrl+alt+r"],
          ],
    },
    {
      "label": "Services",
      "i18n":"services",
      "entries":
          [
            ["http://www.snik.eu/sparql","SPARQL Endpoint","sparql-endpoint"],
            ["http://www.snik.eu/ontology","RDF Browser","rdf-browser"],
            //["http://snik.eu/evaluation","Data Quality Evaluation","data-quality-evaluation"],
          ],
    },
    {
      "label": "Language",
      "i18n": "language",
      "entries":
          [
            [()=>setLanguage(NODE.LABEL_ENGLISH),"english","english"],
            [()=>setLanguage(NODE.LABEL_GERMAN),"german","german"],
            [()=>setLanguage(NODE.LABEL_PERSIAN),"persian","persian"],
          ],
    },
    {
      "label": "Help",
      "i18n": "help",
      "entries":
          [
            ["manual.html","Manual"],
            ["http://www.snik.eu/de/snik-tutorial.pdf","Tutorial"],
            ["layoutHelp.html","Layout Help"],
            ["https://www.youtube.com/channel/UCV8wbTpOdHurbaHqP0sAOng/featured","YouTube Channel"],
            ["troubleshooting.html","Troubleshooting"],
            ["contribute.html","Contribute"],
            ["http://www.snik.eu/","Project Homepage"],
            [about,"About SNIK Graph"],
            ["https://github.com/IMISE/snik-ontology/issues","Submit Feedback about the Ontology"],
            [visualizationFeedback,"Submit Feedback about the Visualization"],
          ],
    },
  ];
}

/** @param as an empty array that will be filled with the anchor elements
    Add the menu entries of the options menu. Cannot be done with an entries array because they need an event listener so they have its own function.*/
function addOptions(as)
{
  const optionsContent = util.getElementById("options-menu-content");
  const names = ["separate-subs","cumulative-search","day-mode","dev-mode","ext-mode","combine-match"];
  for(const name of names)
  {
    const a = document.createElement("a");
    as.push(a);
    optionsContent.appendChild(a);
    a.setAttribute("tabindex",-1);
    a.classList.add("dropdown-entry");

    const box = document.createElement("input");
    a.appendChild(box);
    box.type="checkbox";
    box.autocomplete="off";
    box.id=name+"-checkbox";

    a.addEventListener("keydown",util.checkboxKeydownListener(box));

    const span = document.createElement("span");
    a.appendChild(span);
    span.setAttribute("data-i18n",name);
    span.innerText=language.getString(name);
  }
  /*
      "options-menu-content").innerHTML =
      `<a class="dropdown-entry"><input type="checkbox" id="separate-subs-checkbox" autocomplete="off"/><span data-i18n="separate-subs">separate subontologies</span></a>
      <a class="dropdown-entry"> <input type="checkbox" id="cumulative-search-checkbox" autocomplete="off"/><span data-i18n="cumulative-search">cumulative search</span></a>
      <a class="dropdown-entry"><input type="checkbox" id="day-mode-checkbox" autocomplete="off"/><span data-i18n="day-mode">day mode</span></a>
      <a class="dropdown-entry"><input type="checkbox" id="dev-mode-checkbox" autocomplete="off"/><span data-i18n="dev-mode">dev mode</span></a>
      <a class="dropdown-entry"><input type="checkbox" id="ext-mode-checkbox" autocomplete="off"/><span data-i18n="ext-mode">extended mode</span></a>
      <a class="dropdown-entry"><input type="checkbox" id="combine-match-checkbox" autocomplete="off"/><span data-i18n="combine-match">combine matches</span></a>`;
      */

  /** @type {HTMLInputElement} */
  const separateSubs = util.getElementById("separate-subs-checkbox");
  separateSubs.addEventListener("change",()=>{log.debug("Set separate Subontologies to "+separateSubs.checked);});
  /** @type {HTMLInputElement} */
  const dayMode = util.getElementById("day-mode-checkbox");
  dayMode.addEventListener("change",()=>{graph.invert(dayMode.checked);log.debug("Set dayMode to "+dayMode.checked);});
  if(config.activeOptions.includes("day")) {dayMode.click();}
  /** @type {HTMLInputElement} */
  const devMode = util.getElementById("dev-mode-checkbox");
  /** @type {HTMLInputElement} */
  const extMode = util.getElementById("ext-mode-checkbox");
  devMode.addEventListener("change",()=>{log.debug("Set devMode to "+devMode.checked);registerContextMenu(devMode.checked,extMode.checked);});
  extMode.addEventListener("change",()=>{log.debug("Set extMode to "+extMode.checked);registerContextMenu(devMode.checked,extMode.checked);});
  if(config.activeOptions.includes("ext")) {extMode.click();}
  if(config.activeOptions.includes("dev")) {devMode.click();}
  /** @type {HTMLInputElement} */
  const cumuSearch = util.getElementById("cumulative-search-checkbox");
  cumuSearch.addEventListener("change",()=>{log.debug("Set cumulative search to "+cumuSearch.checked);});
  /** @type {HTMLInputElement} */
  const combineMatchMode  = util.getElementById("combine-match-checkbox");
  combineMatchMode.addEventListener("change",()=>
  {
    combineMatch(combineMatchMode.checked);
    log.debug("Set combine match mode to "+combineMatchMode.checked);
  });
}

/** Adds the menu to the DOM element with the "top" id and sets up the event listeners. */
export function addMenu()
{
  console.groupCollapsed("Add menu");
  //const frag = new DocumentFragment();
  const ul = document.createElement("ul");
  ul.classList.add("dropdown-bar");
  // see https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets
  ul.setAttribute("tabindex","0");

  const data = menuData();
  const spans = [];
  const aas = []; // 2-dimensional array of anchors

  for(let i=0; i<data.length; i++)
  {
    const menuDatum = data[i];
    const li = document.createElement("li");
    li.setAttribute("tabindex","-1");
    ul.appendChild(li);

    const span = document.createElement("span");
    spans.push(span);
    li.appendChild(span);
    span.classList.add("dropdown-menu");
    span.innerText=menuDatum.label;
    span.setAttribute("data-i18n",menuDatum.i18n);
    span.setAttribute("tabindex","-1");

    const div = document.createElement("div");
    li.appendChild(div);
    div.classList.add("dropdown-content");
    div.setAttribute("tabindex","-1");
    if(menuDatum.id) {div.id=menuDatum.id+"-menu-content";}

    span.addEventListener("click",()=>
    {
      for(const otherDiv of document.getElementsByClassName("dropdown-content"))
      {
        if(div!==otherDiv) {otherDiv.classList.remove("show");}
      }
      div.classList.toggle("show");
    });

    const as = [];
    aas.push(as);

    for(const entry of menuDatum.entries)
    {
      const a = document.createElement("a");
      as.push(a);
      a.classList.add("dropdown-entry");
      a.setAttribute("data-i18n",entry[2]);
      a.setAttribute("tabindex","-1");
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
          // we only use hotkeys for functions
          const hotkey = entry[3];
          if(hotkey)
          {
            hotkeys(hotkey,entry[0]);
            a.innerHTML=a.innerHTML+` (${hotkey.toUpperCase()})`;
          }
          break;
        }
        default: log.error("unknown menu entry action type: "+typeof entry[0]);
      }
    }
    span.addEventListener("keydown",(event)=>
    {
      switch(event.key)
      {
        case "ArrowLeft":
          spans[(i-1+spans.length)%spans.length].focus(); // positive modulo
          spans[(i-1+spans.length)%spans.length].click();
          break;
        case "ArrowRight":
          spans[(i+1)%spans.length].focus();
          spans[(i+1)%spans.length].click();
          break;
        case "ArrowDown":
          as[0].focus();
          break;
      }
    });
  }
  util.getElementById("top").prepend(ul);

  file.addFileLoadEntries(util.getElementById("file-menu-content"),aas[0]); // update index when "File" position changes in the menu
  log.debug('fileLoadEntries added');

  addFilterEntries(graph.cy,util.getElementById("filter-menu-content"),aas[1]);  // update index when "Filter" position changes in the menu
  log.debug('filter entries added');

  addOptions(aas[2]); // update index when "Options" position changes in the menu


  for(let i=0; i<aas.length; i++)
  {
    const as = aas[i];
    for(let j=0; j<as.length; j++)
    {
      as[j].addEventListener("keydown",(event)=>
      {
        switch(event.key)
        {
          case "ArrowLeft":
            spans[(i-1+spans.length)%spans.length].focus(); // positive modulo
            spans[(i-1+spans.length)%spans.length].click();
            break;
          case "ArrowRight":
            spans[(i+1)%spans.length].focus();
            spans[(i+1)%spans.length].click();
            break;
          case "ArrowUp":
            as[(j-1+as.length)%as.length].focus();
            break;
          case "ArrowDown":
            as[(j+1)%as.length].focus();
            break;
        }
      });
    }
  }

  log.debug('Menu added');
  console.groupEnd();
}

/** Close the dropdown if the user clicks outside of the menu */
function closeListener(e)
{
  if (e&&e.target&&e.target.matches&&!e.target.matches('.dropdown-entry')&&!e.target.matches('.dropdown-menu')
      &&!e.target.matches('input.filterbox')) // don't close while user edits the text field of the custom filter
  {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    Array.from(dropdowns).forEach(d=>d.classList.remove('show'));
  }
}
window.addEventListener("click",closeListener);
