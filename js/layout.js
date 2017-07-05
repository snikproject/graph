import {cy} from "./graph.js";

var activeLayout = undefined;

export function run(config)
{
  if(activeLayout) {activeLayout.stop();}
  activeLayout = cy.elements(":visible").layout(config);
  activeLayout.run();
}

export var breadthfirst = {name: "breadthfirst"};
export var grid = {name: "grid"};

export var cose =
  {
    name:"cose",
    animate: true,
    animationThreshold: 250,
    numIter: 5000,
    nodeDimensionsIncludeLabels: false,
	//nodeRepulsion: function(node){ return 400; },
	//initialTemp: 2000,
  };

export var coseBilkent =
  {
    name:"cose",
    animate: true,
    animationThreshold: 250,
    numIter: 5000,
    nodeDimensionsIncludeLabels: false,
	//nodeRepulsion: function(node){ return 400; },
	//initialTemp: 2000,
  };

export var colaInf =
  {
    name:"cola",
    infinite: true,
    fit: false,
    nodeSpacing: function(node) {return 40;}
  };

export var cola =
  {
    name:"cola",
    maxSimulationTime: 4000,
    nodeSpacing: function(node) {return 40;},
    fit:false
  };
