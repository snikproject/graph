/** Populates the menu bar on the top and initializes the context menu.*/
/**
@module */
import * as download from "./download.js";
import * as layout from "../layout.js";
import * as NODE from "../node.js";
import loadGraphFromSparql from "../loadGraphFromSparql.js";
import * as language from "../lang/language.js";
import * as util from "./util.js";
import config from "../config.js";
import progress from "./progress.js";
import {showChapterSearch} from "./chaptersearch.js";
import addFilterEntries from "./filter.js";
import * as file from "./file.js";
import {Graph} from "./graph.js";
import {activeState, activeView, views} from "./view.js";
// grid picture as base64
// eslint-disable-next-line
const grid = "iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAYAAACoYAD2AAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TxSItDnYQUchQnSyIijhqFYpQIdQKrTqYXPoFTRqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxcnRSdJES/5cUWsR4cNyPd/ced+8AoVFhmtU1Dmi6baaTCTGbWxV7XhFCBGEMIyIzy5iTpBR8x9c9Any9i/Ms/3N/joiatxgQEIlnmWHaxBvE05u2wXmfOMpKskp8Tjxm0gWJH7muePzGueiywDOjZiY9TxwlFosdrHQwK5ka8RRxTNV0yheyHquctzhrlRpr3ZO/MJzXV5a5TnMISSxiCRJEKKihjApsxGnVSbGQpv2Ej3/Q9UvkUshVBiPHAqrQILt+8D/43a1VmJzwksIJoPvFcT5GgJ5doFl3nO9jx2meAMFn4Epv+6sNYOaT9Hpbix0BfdvAxXVbU/aAyx1g4MmQTdmVgjSFQgF4P6NvygH9t0Dvmtdbax+nD0CGukrdAAeHwGiRstd93h3q7O3fM63+fgAltnKI89jkWgAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+QIDQwpAiBJZ4sAAABFSURBVFjD7dfBDQAgCARBtHI61yYgYjJbwGW+F1FcZp7qzR0fBAkJCQkJCQkJCQk5odXxScbniEFCQkJCQkJCQkJCPuwCY9AHy8qKGCgAAAAASUVORK5CYII=";
/** main menu bar */
export default class Menu
{
  /** construct the main menu bar for the given graph */
  constructor(showInstancesBoxChecked)
  {
    document.body.addEventListener("click",Menu.closeListener);
    // bind this to the class instance instead of the event source
    this.showCloseMatches = this.showCloseMatches.bind(this);
    this.addMenu(showInstancesBoxChecked);
  }

  /** @return whether subontologies are to be displayed separately. */
  separateSubs()
  {
    return this.separateSubsBox.checked;
  }

  /** Sets the preferred node label language attribute. Use the values from node.js. */
  setLanguage(lang)
  {
    if(!language.setLanguage(lang)) {return;}
    language.updateHtml();
    // this.graph.cy.style(style); // does not display the style correctly and doesn't update the labels
    // this.graph.cy.forceRender(); // does not update the labels either
    // the nuclear option works
    for (const view of views)
    {
      const elements = view.state.graph.cy.elements();
      view.state.graph.cy.remove(elements);
      elements.restore();
    }
  }

  /** Notifies the user of the program version so that errors can be properly reported. */
  static about() {window.alert("SNIK Graph version "+"[AIV]{version} {date}[/AIV]");}

  /** Creates a GitHub issue for the visualization. */
  static visualizationFeedback()
  {
    util.createGitHubIssue(util.REPO_APPLICATION,"","Please type your issue here:\n\n\n\n"+
    "!!Please do not delete the following text, because its the log for developers!!\n\n", log.logs);
  }

  /** Show all nodes that are connected via close matches to visible nodes. */
  showCloseMatches()
  {
    log.debug("show close matches start");
    const visible = activeState().graph.cy.elements('.unfiltered').not('.hidden');
    //const closeMatchEdges = this.graph.cy.edges('[pl="closeMatch"]');
    const newEdges = visible.connectedEdges(".unfiltered").filter('[pl="closeMatch"]');
    Graph.setVisible(newEdges,true);
    Graph.setVisible(newEdges.connectedNodes(".unfiltered"),true);
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
  menuData()
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
            await loadGraphFromSparql(this.graph.cy,[]);
            progress(()=>layout.runCached(this.graph.cy,layout.euler,config.defaultSubOntologies,this.separateSubs()));
          },
          "Load from SPARQL Endpoint","load-sparql"],
          [()=>download.downloadSession(),"Save Session","save-session"],
          [()=>download.downloadGraph(activeState().graph),"Save the full SNIK Graph","save-snik-graph"],
          [()=>download.downloadView(activeView()),"Save currently active view (partial graph)","save-view"],
          [()=>
          {
            progress(()=>layout.run(activeState().cy,layout.euler,config.defaultSubOntologies,this.separateSubs(),true));
          },"Recalculate Layout and Replace in Browser Cache","recalculate-layout-replace"],
          [()=>download.downloadPng(activeState().graph,this,false,false),"Save Image of Current View","save-image-current-view"],
          [()=>download.downloadPng(activeState().graph,this,true,false),"Save Image of Whole Graph","save-image-whole-graph"],
          [()=>download.downloadPng(activeState().graph,this,false,true),"Save Image of Current View (high res)","save-image-current-view-high-res"],
          [()=>download.downloadPng(activeState().graph,this,true,true),"Save Image of Whole Graph (high res)","save-image-whole-graph-high-res"],
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
              [this.showCloseMatches,"show close matches","show-close-matches"],
              [()=>{layout.run(activeState().graph.cy,layout.euler,config.defaultSubOntologies,this.separateSubs()&&!activeState().graph.getStarMode(),true);}, "recalculate layout", "recalculate-layout","ctrl+alt+l"],
              [()=>{layout.run(activeState().graph.cy,layout.eulerTight,config.defaultSubOntologies,this.separateSubs()&&!activeState().graph.getStarMode(),false);}, "tight layout","tight-layout","ctrl+alt+t"],
              [()=>{layout.run(activeState().graph.cy,layout.cose,config.defaultSubOntologies,this.separateSubs()&&!activeState().graph.getStarMode(),false);}, "compound layout","compound-layout","ctrl+alt+c"],
              [()=>activeState().graph.moveAllMatches(0), "move matches on top of each other","move-match-on-top"],
              [()=>activeState().graph.moveAllMatches(100), "move matches nearby","move-match-nearby"],
              [()=>{showChapterSearch("bb");},"BB chapter search","bb-chapter-search"],
              [()=>{showChapterSearch("ob");},"OB chapter search","ob-chapter-search"],
              [activeState().graph.subOntologyConnectivity, "subontology connectivity","subontology-connectivity"],
              [views[0].state.graph.resetStyle, "reset view","reset-view","ctrl+alt+r"],
              [()=>{activeView().setTitle(prompt("Rename: "+activeView().config.title) || activeView().config.title);activeState().title=activeView().config.title;}, "change title of active View", "change-title"],
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
              [()=>this.setLanguage(NODE.LABEL_ENGLISH),"english","english"],
              [()=>this.setLanguage(NODE.LABEL_GERMAN),"german","german"],
              [()=>this.setLanguage(NODE.LABEL_PERSIAN),"persian","persian"],
            ],
      },
      {
        "label": "Help",
        "i18n": "help",
        "entries":
            [
              ["manual.html","Manual"],
              ["https://www.snik.eu/sites/www.snik.eu/files/files/uploads/Einfuehrung/snik-tutorial.pdf","Tutorial"],
              ["layoutHelp.html","Layout Help"],
              ["https://www.youtube.com/channel/UCV8wbTpOdHurbaHqP0sAOng/featured","YouTube Channel"],
              ["troubleshooting.html","Troubleshooting"],
              ["contribute.html","Contribute"],
              ["http://www.snik.eu/","Project Homepage"],
              [Menu.about,"About SNIK Graph"],
              ["https://github.com/IMISE/snik-ontology/issues","Submit Feedback about the Ontology"],
              [Menu.visualizationFeedback,"Submit Feedback about the Visualization"],
            ],
      },
    ];
  }

  /** @param as an empty array that will be filled with the anchor elements
      Add the menu entries of the options menu. Cannot be done with an entries array because they need an event listener so they have its own function.*/
  addOptions(as,showInstancesBoxChecked)
  {
    const optionsContent = util.getElementById("options-menu-content");
    const names = ["separateSubs","cumulativeSearch","grid","dayMode","devMode","extMode","combineMatchMode","showInstances"];
    for(const name of names)
    {
      log.trace("Add option "+name);
      const a = document.createElement("a");
      as.push(a);
      optionsContent.appendChild(a);
      a.setAttribute("tabindex",-1);
      a.classList.add("dropdown-entry");

      const box = document.createElement("input");
      a.appendChild(box);
      box.type="checkbox";
      box.autocomplete="off";
      this[name+"Box"] = box;
      box.id = [name+"Box"];

      a.addEventListener("keydown",util.checkboxKeydownListener(box));

      const span = document.createElement("span");
      a.appendChild(span);
      span.setAttribute("data-i18n",name);
      span.innerText=language.getString(name);
    }

    this.separateSubsBox.addEventListener("change",()=>{log.debug("Set separate Subontologies to "+this.separateSubsBox.checked);});
    this.dayModeBox.addEventListener("change",()=>{for(const view of views){view.state.graph.invert(this.dayModeBox.checked);log.debug("Set dayMode to "+this.dayModeBox.checked);}});
    this.gridBox.addEventListener("change",()=>
    {
      for(const view of views)
      {
        view.state.graph.container.style.backgroundImage = this.gridBox.checked?"url('data:image/png;base64,"+grid+"')":"";
        log.debug("set gridBox to "+this.gridBox.checked);
      }
    });
    if(config.activeOptions.includes("day")) {this.dayModeBox.click();}
    if(config.activeOptions.includes("ext")) {this.extModeBox.click();}
    if(config.activeOptions.includes("dev")) {this.devModeBox.click();}
    /** @type {HTMLInputElement} */
    this.cumulativeSearchBox.addEventListener("change",()=>{log.debug("Set cumulative search to "+this.cumulativeSearchBox.checked);});
    /** @type {HTMLInputElement} */
    this.combineMatchModeBox.addEventListener("change",()=>
    {
      activeState().graph.combineMatch(this.combineMatchModeBox.checked);
      log.debug("Set combine match mode to "+this.combineMatchModeBox.checked);
    });

    // Initial state based on URL parameter. This checkbox is the only place where it is stored to prevent different values in different places.
    this.showInstancesBox.checked = showInstancesBoxChecked;
    this.showInstancesBox.addEventListener("change",()=>
    {
      if(this.graph.instancesLoaded)
      {
        Graph.setVisible(this.graph.instances,this.showInstancesBox.checked);
        Graph.setVisible(this.graph.instances.connectedEdges(),this.showInstancesBox.checked);
      }
      else
      {
        if(this.showInstancesBox.checked)
        {
          alert("Instances are not loaded. Please reload with the 'instances' URL parameter.");
          //log.debug("Show instances: Not in memory. Reloading.");
          //Graph.setVisible(this.graph.instances,this.showInstancesBox.checked);
          //Graph.setVisible(this.graph.instances.connectedEdges(),this.showInstancesBox.checked);
        }
        else
        {
          log.warn("Cannot hide instances as they are not loaded.");
        }
      }
    });
  }

  /** Adds the menu to the graph parent DOM element and sets up the event listeners. */
  addMenu(showInstancesBoxChecked)
  {
    console.groupCollapsed("Add menu");
    //const frag = new DocumentFragment();
    const ul = document.createElement("ul");
    //this.graph.parent.prepend(ul); // for multiple graphs at the same time with a menu each
    util.getElementById("top").prepend(ul); // a single menu for a single graph
    ul.classList.add("dropdown-bar");
    // see https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets
    ul.setAttribute("tabindex","0");

    const data = this.menuData();
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

    file.addFileLoadEntries(activeState().graph,util.getElementById("file-menu-content"),aas[0]); // update index when "File" position changes in the menu
    log.debug('fileLoadEntries added');

    addFilterEntries(util.getElementById("filter-menu-content"),aas[1]);  // update index when "Filter" position changes in the menu
    log.debug('filter entries added');

    this.addOptions(aas[2],showInstancesBoxChecked); // update index when "Options" position changes in the menu

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

    // fix mouse position after container change, see https://stackoverflow.com/questions/23461322/cytoscape-js-wrong-mouse-pointer-position-after-container-change
    //this.graph.cy.resize();
    log.debug('Menu added');
    console.groupEnd();
  }

  /** Close the dropdown if the user clicks outside of the menu */
  static closeListener(e)
  {
    if (e&&e.target&&e.target.matches&&!e.target.matches('.dropdown-entry')&&!e.target.matches('.dropdown-menu')
        &&!e.target.matches('input.filterbox')) // don't close while user edits the text field of the custom filter
    {
      const dropdowns = document.getElementsByClassName("dropdown-content");
      Array.from(dropdowns).forEach(d=>d.classList.remove('show'));
    }
  }
}
