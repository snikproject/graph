import {cy} from "./graph.js";
import * as log from "./log.js";

var activeLayout = undefined;


export function run(config)
{
  if(activeLayout) {activeLayout.stop();}
  activeLayout = cy.elements(":visible").layout(config);
  activeLayout.run();
}

export var breadthfirst = {name: "breadthfirst"};
export var grid = {name: "grid"};

// tested but not viable:
// spread: too slow

export var euler =
{
  name: "euler",
  springLength: edge => 200,
  maxSimulationTime: 2000,
  randomize: true,
  fit:false,
  mass: node => 40,
};

export var cose =
  {
    name: "cose",
    animate: true,
    animationThreshold: 250,
    refresh: 5,
    numIter: 30,
    nodeDimensionsIncludeLabels: true,
    nodeRepulsion: function(){ return 400000; },
    idealEdgeLength: function(){ return 200; },
    nodeOverlap: 100,
    gravity: 80,
    fit: false,
    randomize: true,
    initialTemp: 200,
    //weaver: Weaver,
    weaver: false,
  };

export var coseBilkent =
  {
    name:"cose-bilkent",
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
    nodeSpacing: function() {return 40;},
  };

export var cola =
  {
    name:"cola",
    maxSimulationTime: 4000,
    nodeSpacing: function() {return 40;},
    fit:false,
  };
