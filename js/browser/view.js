/** @module */
import * as util from "./util.js";
import {Graph} from "./graph.js";
import config from "../config.js";
import * as layout from "../layout.js";
import {fillInitialGraph} from "./main.js";
import ContextMenu from "./contextmenu.js";

const goldenLayoutConfig = {
  settings: {selectionEnabled: true},
  content: [{
    type: 'stack',
    content: [],
  }],
};

const goldenLayout = new GoldenLayout(goldenLayoutConfig);
const stacks = [];
// TODO: update stack on focus change

/** Returns the state of the active (focussed) view. */
export function activeState()
{
  return goldenLayout.selectedItem.getActiveContentItem().config.componentState;
}

goldenLayout.on("selectionChanged ",event=>
{
  // TODO TP: This event is not firing despite following the docs. Please investigate and fix.
  log.info("SELECTION CHANGED");
  log.info(event);
});

goldenLayout.on('stackCreated', function(stack)
{
  goldenLayout.selectItem(stack);
  stacks.push(stack); // TODO: remove after destruction of the stack
  const template = util.getElementById('goldenlayout-header');
  const zoomButtons = document.importNode(template.content, true);

  // Add the zoomButtons to the header
  stack.header.controlsContainer.prepend(zoomButtons);
  const controls = stack.header.controlsContainer[0];

  // When a tab is selected then select its stack. For unknown reasons this is not default behaviour of GoldenLayout.
  // What happens when a tab is moved out of a stack? Testing showed no problems but this should be investigated for potential bugs.
  stack.on("activeContentItemChanged",()=>{goldenLayout.selectItem(stack);});

  controls.querySelector('.plussign').addEventListener("click",()=>
  {
    log.info(goldenLayout.selectedItem);
    const cy = activeState().cy;
    cy.zoom(cy.zoom()*1.2);
  });

  controls.querySelector('.minussign').addEventListener("click",()=>
  {
    const cy = activeState().cy;
    cy.zoom(cy.zoom()/1.2);
  });

  controls.querySelector('.addsign').addEventListener("click",()=>
  {
    /* eslint-disable no-use-before-define*/
    new View();
    /* eslint-enable no-use-before-define*/
  });

  controls.querySelector('.recalculatesign').addEventListener("click",()=>
  {
    //layout.run(state.cy,layout.euler,config.defaultSubOntologies,this.menu.separateSubs()&&!state.graph.starMode,true);
    layout.run(activeState().cy,layout.euler,config.defaultSubOntologies,false,true); // TODO TP: put menu back in
  });
});
goldenLayout.init();


let viewCount = 0; // only used for the name, dont decrement on destroy to prevent name conflicts
export const views = [];
let firstFinished = null; // following instances need to wait for the first to load



export class View
{
  /** Create an empty graph and add it to the state of this view along with its Cytoscape.js instance. */
  async addGraph()
  {
    const graph = new Graph(this.cyContainer);
    const cy = graph.cy;
    this.state.graph = graph;
    this.state.cy = cy; // easier access for frequent use than this.state.graph.cy, also better separation

    if(views.length===1)
    {
      firstFinished = fillInitialGraph(graph);
      await firstFinished;
      new ContextMenu(graph, graph.menu);
      log.debug(`Main view ${this.state.name} loaded with ${cy.elements().size()} elements.`);
      // TODO Thomas: Disable closing of the first view
    }
    else
    {
      await firstFinished;
      cy.add(views[0].state.cy.elements()); // don't load again, copy from first view
      log.debug(`Create view ${this.state.name} with ${cy.elements().size()} hidden elements copied from ${views[0].state.name}.`);
      const elements = cy.elements();
      Graph.setVisible(elements,false);
      Graph.setVisible(elements.edgesWith(elements),false);
      new ContextMenu(graph, views[0].state.graph.menu); // attach to the first views menu
    }
  }

  /***/
  constructor()
  {
    const name = viewCount++===0?"Gesamtmodell":"Teilmodell "+(viewCount-1);
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

    goldenLayout.registerComponent(name, function(container, state)
    {
      thisView.cyContainer = document.createElement("div");
      thisView.element = container.getElement()[0];
      container.getElement()[0].appendChild(thisView.cyContainer);
    });
    goldenLayout.root.contentItems[0].addChild(itemConfig);
    this.initialized = this.addGraph();
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
  console.log(goldenLayout.root);
  removeTabsArray = [];
  traverse(goldenLayout.root,0);
  for(const content of removeTabsArray) {content.remove();}
}
