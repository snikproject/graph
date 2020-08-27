/** @module */
import * as util from "./util.js";
import {activeState, View} from "./view.js";
import * as layout from "../layout.js";
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

  const viewLayout = new GoldenLayout(config);
  // TODO: update stack on focus change

  viewLayout.on("selectionChanged ",event=>
  {
  // TODO TP: This event is not firing despite following the docs. Please investigate and fix.
    log.info("SELECTION CHANGED");
    log.info(event);
  });

  viewLayout.on('stackCreated', function(stack)
  {
    viewLayout.selectItem(stack);
    const template = util.getElementById('goldenlayout-header');
    const zoomButtons = document.importNode(template.content, true);

    // Add the zoomButtons to the header
    stack.header.controlsContainer.prepend(zoomButtons);
    const controls = stack.header.controlsContainer[0];

    // When a tab is selected then select its stack. For unknown reasons this is not default behaviour of GoldenLayout.
    // What happens when a tab is moved out of a stack? Testing showed no problems but this should be investigated for potential bugs.
    stack.on("activeContentItemChanged",()=>{viewLayout.selectItem(stack);});

    controls.querySelector('.plussign').addEventListener("click",()=>
    {
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

    controls.querySelector('.tightlayoutsign').addEventListener("click",()=>
    {
      layout.run(activeState().cy,layout.eulerTight,config.defaultSubOntologies,false,true);
    });

    controls.querySelector('.compoundlayoutsign').addEventListener("click",()=>
    {
      layout.run(activeState().cy,layout.cose,config.defaultSubOntologies,false,true);
    });
  });
  viewLayout.init();
  return viewLayout;
}
