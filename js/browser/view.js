/** @module */
import {Graph} from "./graph.js";
import {fillInitialGraph} from "./main.js";
import ContextMenu from "./contextmenu.js";
import {goldenLayout} from "./viewLayout.js";
import {toJSON} from "./state.js";

let viewCount = 0; // only used for the name, dont decrement on destroy to prevent name conflicts
export let mainView = null;
export const partViews = new Set();
export const views = () => [mainView,...partViews];

let firstFinished = null; // following instances need to wait for the first to load
let viewLayout=goldenLayout();

/** Returns the state of the active (focussed) view. */
export function activeState()
{
  return viewLayout.selectedItem.getActiveContentItem().config.componentState;
}

/** Returns the active (focussed) view. */
export function activeView()
{
  return viewLayout.selectedItem.getActiveContentItem();
}

export class View
{
  /** Create an empty graph and add it to the state of this view along with its Cytoscape.js instance. */
  async fill(graph)
  {
    if(mainView===null)
    {
      mainView = this;
      firstFinished = fillInitialGraph(graph);
      await firstFinished;
      log.debug(`Main view ${this.state.name} loaded with ${graph.cy.elements().size()} elements.`);
    }
    else
    {
      await firstFinished;
      graph.cy.add(mainView.state.cy.elements()); // don't load again, copy from first view
      log.debug(`Create view ${this.state.title} with ${graph.cy.elements().size()} hidden elements copied from ${mainView.state.title}.`);
      const elements = graph.cy.elements();
      Graph.setVisible(elements,false);
      Graph.setVisible(elements.edgesWith(elements),false);
      graph.starMode=true;
    }
  }

  /***/
  constructor(initialize=true,title)
  {
    //find initial title of the new View
    title = title ?? (viewCount++===0?"Gesamtmodell":"Teilmodell "+(viewCount-1));
    this.state = {title:title};
    //const closable = views.length>1;
    const itemConfig = {
      title:title,
      type: 'component',
      componentName: title,
      componentState: this.state,
      isClosable: mainView!==null,
    };
    const thisView = this; // supply this to callback
    if(mainView!==null) {partViews.add(this);}

    viewLayout.registerComponent(title, function(container/*, state*/) // State is defined but never used, maybe it is needed for sth. later on.
    {
      thisView.cyContainer = document.createElement("div");
      thisView.element = container.getElement()[0];
      container.getElement()[0].appendChild(thisView.cyContainer);
      container.on("destroy",()=>{partViews.delete(thisView);});
    });
    viewLayout.root.contentItems[0].addChild(itemConfig);

    const graph = new Graph(this.cyContainer);
    const cy = graph.cy;
    this.state.graph = graph;
    this.state.cy = cy; // easier access for frequent use than this.state.graph.cy, also better separation
    this.initialized = initialize?this.fill(graph):Promise.resolve();
    this.initialized.then(() =>
    {
      this.state.graph.invert(toJSON().options.dayMode);
      this.cxtMenu = new ContextMenu(graph);
    });
  }
}

let removeTabsArray = [];

/** helper function that traverses the component tree */
function traverse(x,depth)
{
  if(x.type==="component"&&x.componentName!=="Gesamtmodell") {removeTabsArray.push(x); return;}
  for(const y of x.contentItems)
  {
    traverse(y,++depth);
  }
}
/** close all tabs except the first one */
export function reset()
{
  removeTabsArray = [];
  traverse(viewLayout.root,0);
  for(const content of removeTabsArray){content.remove();}
  for(const view of partViews){view.cxtMenu.reset();}
  partViews.clear();
  viewCount=0;
  viewLayout.destroy();
  viewLayout=goldenLayout();
}
