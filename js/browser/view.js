/** @module */
import * as util from "./util.js";
import {Graph} from "./graph.js";
import config from "../config.js";
import * as layout from "../layout.js";

const goldenLayoutConfig = {
  content: [{
    type: 'stack',
    content: [],
  }],
};

const goldenLayout = new GoldenLayout(goldenLayoutConfig);
export let stack = null;

export function activeState()
{
  return stack.getActiveContentItem().config.componentState;
}

goldenLayout.on('stackCreated', function(newStack)
{
  stack = newStack;
  const template = util.getElementById('goldenlayout-header');
  const zoomButtons = document.importNode(template.content, true);

  // Add the zoomButtons to the header
  newStack.header.controlsContainer.prepend(zoomButtons);
  const controls = newStack.header.controlsContainer[0];

  controls.querySelector('.plussign').addEventListener("click",function()
  {
    const cy = activeState().cy;
    cy.zoom(cy.zoom()*1.2);
  });

  controls.querySelector('.minussign').addEventListener("click",function()
  {
    const cy = activeState().cy;
    cy.zoom(cy.zoom()/1.2);
  });
  controls.querySelector('.addsign').addEventListener("click",function()
  {
    /* eslint-disable no-use-before-define*/
    new View();
    /* eslint-enable no-use-before-define*/
  });
  controls.querySelector('.recalculatesign').addEventListener("click",function()
  {
    //layout.run(state.cy,layout.euler,config.defaultSubOntologies,this.menu.separateSubs()&&!state.graph.starMode,true);
    layout.run(activeState().cy,layout.euler,config.defaultSubOntologies,false,true); // todo: put menu back in
  });
});
goldenLayout.init();

let viewCount = 0;

export class View
{
  /** Initialize the layout. */
  addEmptyGraph()
  {
    this.graph = new Graph(this.cyContainer);
    console.log(this.state);
    this.state.graph = this.graph;
    this.state.cy = this.graph.cy;
  }
  /***/
  constructor()
  {
    const name = viewCount++===0?"Gesamtmodell":"Teilmodell "+(viewCount-1);
    this.state = {};
    const itemConfig = {
      title:name,
      type: 'component',
      componentName: name,
      componentState: this.state,
    };
    const thisView = this; // supply this to callback
    goldenLayout.registerComponent(name, function(container, state)
    {
      thisView.cyContainer = document.createElement("div");
      container.getElement()[0].appendChild(thisView.cyContainer);
    });
    goldenLayout.root.contentItems[0].addChild(itemConfig);
    this.addEmptyGraph();
  }
}
