/** @module */
import * as util from "./util.js";
import {activeState, View} from "./view.js";

/** Create, configure and return a GoldenLayout instance.*/
export function goldenLayout()
{
  const config = {
    settings: {selectionEnabled: true},
    content: [{
      type: 'stack',
      content: [],
    }],
  };

  const layout = new GoldenLayout(config);
  // TODO: update stack on focus change

  layout.on("selectionChanged ",event=>
  {
  // TODO TP: This event is not firing despite following the docs. Please investigate and fix.
    log.info("SELECTION CHANGED");
    log.info(event);
  });

  layout.on('stackCreated', function(stack)
  {
    layout.selectItem(stack);
    const template = util.getElementById('goldenlayout-header');
    const zoomButtons = document.importNode(template.content, true);

    // Add the zoomButtons to the header
    stack.header.controlsContainer.prepend(zoomButtons);
    const controls = stack.header.controlsContainer[0];

    // When a tab is selected then select its stack. For unknown reasons this is not default behaviour of GoldenLayout.
    // What happens when a tab is moved out of a stack? Testing showed no problems but this should be investigated for potential bugs.
    stack.on("activeContentItemChanged",()=>{layout.selectItem(stack);});

    controls.querySelector('.plussign').addEventListener("click",()=>
    {
      log.info(layout.selectedItem);
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
      new View();
    });

    controls.querySelector('.recalculatesign').addEventListener("click",()=>
    {
    //layout.run(state.cy,layout.euler,config.defaultSubOntologies,this.menu.separateSubs()&&!state.graph.starMode,true);
      layout.run(activeState().cy,layout.euler,config.defaultSubOntologies,false,true); // TODO TP: put menu back in
    });
  });
  layout.init();
  return layout;
}
