/** @module */
import {Graph} from "./graph.js";
import {fillInitialGraph} from "./main.js";
import ContextMenu from "./contextmenu.js";
import {goldenLayout} from "./viewLayout.js";

let viewCount = 0; // only used for the name, dont decrement on destroy to prevent name conflicts
export const views = [];
let firstFinished = null; // following instances need to wait for the first to load
let viewLayout=goldenLayout();

/** Returns the state of the active (focussed) view. */
export function activeState()
{
  return viewLayout.selectedItem.getActiveContentItem().config.componentState;
}

export class View
{
  /** Create an empty graph and add it to the state of this view along with its Cytoscape.js instance. */
  async fill(graph)
  {
    if(views.length===1)
    {
      firstFinished = fillInitialGraph(graph);
      await firstFinished;
      new ContextMenu(graph, graph.menu);
      log.debug(`Main view ${this.state.name} loaded with ${graph.cy.elements().size()} elements.`);
    }
    else
    {
      await firstFinished;
      graph.cy.add(views[0].state.cy.elements()); // don't load again, copy from first view
      log.debug(`Create view ${this.state.name} with ${graph.cy.elements().size()} hidden elements copied from ${views[0].state.name}.`);
      const elements = graph.cy.elements();
      Graph.setVisible(elements,false);
      Graph.setVisible(elements.edgesWith(elements),false);
      new ContextMenu(graph, views[0].state.graph.menu); // attach to the first views menu
    }
  }

  /***/
  constructor(initialize=true)
  {
    const name = viewCount++===0?"Gesamtmodell":"Teilmodell "+(viewCount-1);
    console.log("Aktueller Count:"+viewCount);
    this.state = {name:name};
    views.push(this);
    const closable = views.length>1;
    const itemConfig = {
      title:name,
      type: 'component',
      componentName: name,
      componentState: this.state,
      isClosable: closable,
    };
    const thisView = this; // supply this to callback

    viewLayout.registerComponent(name, function(container, state)
    {
      thisView.cyContainer = document.createElement("div");
      thisView.element = container.getElement()[0];
      container.getElement()[0].appendChild(thisView.cyContainer);
    });
    viewLayout.root.contentItems[0].addChild(itemConfig);

    const graph = new Graph(this.cyContainer);
    const cy = graph.cy;
    this.state.graph = graph;
    this.state.cy = cy; // easier access for frequent use than this.state.graph.cy, also better separation

    this.initialized = initialize?this.fill(graph):Promise.resolve();
  }
}


let removeTabsArray = [];

/** helper function that traverses the component tree */
function traverse(x,depth)
{
  if(x.type==="component"&&x.componentName!=="Gesamtmodell") {removeTabsArray.push(x); return;}
  if(depth>100) {console.log("I'm too deep.");return;}
  for(const y of x.contentItems)
  {
    traverse(y,++depth);
  }
}
/** close all tabs except the first one */
export function reset()
{
  console.log(viewLayout.root);
  removeTabsArray = [];
  traverse(viewLayout.root,0);
  for(const content of removeTabsArray){content.remove();}
  views.length=0;
  viewCount=0;
  viewLayout.destroy();
  viewLayout=goldenLayout();
  // console.log(goldenLayoutConfig);
}
