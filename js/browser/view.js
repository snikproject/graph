/** @module */
import * as util from "./util.js";

const config = {
  content: [{
    type: 'row',
    content: [],
  }],
};

const layout = new GoldenLayout(config);
layout.on('stackCreated', function(stack)
{
  const template = util.getElementById('goldenlayout-header');
  const zoomButtons = document.importNode(template.content, true);

  // Add the zoomButtons to the header
  stack.header.controlsContainer.prepend(zoomButtons);

  const controls = stack.header.controlsContainer[0];

  controls.querySelector('.plussign').addEventListener("click",function()
  {
    const item = stack.getActiveContentItem();
    const state = item.config.componentState;
    if(state.cy) {state.cy.zoom(state.cy.zoom()*1.2);}
  });

  controls.querySelector('.minussign').addEventListener("click",function()
  {
    const item = stack.getActiveContentItem();
    const state = item.config.componentState;
    if(state.cy) {state.cy.zoom(state.cy.zoom()/1.2);}
  });
});
layout.init();

export default class View
{
  /** Initialize the layout. */
  constructor()
  {
    const name = 'Gesamtmodell'+Math.random();
    this.state = {};
    const itemConfig = {
      title:name,
      type: 'component',
      componentName: name,
      componentState: this.state,
    };
    const thisView = this; // supply this to callback
    layout.registerComponent(name, function(container, state)
    {
      thisView.cyContainer = document.createElement("div");
      container.getElement()[0].appendChild(thisView.cyContainer);
    });

    layout.root.contentItems[0].addChild(itemConfig);
  }
}
