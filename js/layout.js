import * as graph from "./graph.js";
import * as log from "./log.js";
import timer from "./timer.js";
import * as rdfGraph from "./rdfGraph.js";
import * as file from "./files.js";

var activeLayout = undefined;

function activeGraphsStorageName(layoutName) {"layout-"+layoutName+[...rdfGraph.active].sort();}

export function run(config)
{
  const layoutTimer = timer("layout");
  if(activeLayout) {activeLayout.stop();}
  activeLayout = graph.cy.elements(":visible").layout(config);
  activeLayout.run();
  layoutTimer.stop();
  if(typeof(Storage)=== "undefined")
  {
    log.error("web storage not available, could not write to cache.");
    return;
  }
  const positions=[];
  const nodes = graph.cy.nodes();
  for(let i=0;i<nodes.size();i++)
  {
    const node = nodes[i];
    positions.push([node.data().id,node.position()]);
  }
  const storageName = activeGraphsStorageName(config.name);
  localStorage.setItem(storageName,JSON.stringify(positions));
}

export function presetLayout(positions)
{
  const map = new Map(positions);
  const config =
  {
    name: 'preset',
    fit:false,
    positions: node=>
    {
      let position;
      if((position= map.get(node._private.data.id))) {return position;}
      return {x:0,y:0};
    },
  };
  run(config);
}


export function runCached(config)
{
  if(typeof(Storage)=== "undefined")
  {
    log.error("web storage not available, could not access cache.");
    run(config);
    return;
  }
  const storageName = activeGraphsStorageName(config.name);
  // localStorage.removeItem(storageName); // clear cache for testing
  const positions=JSON.parse(localStorage.getItem(storageName));
  if(positions) // cache hit
  {
    log.info("loading layout from cache");
    file.loadLayout(positions);
  }
  else // cache miss
  {
    log.warn("layout not in cache, please wait");
    run(config);
  }
}


export var breadthfirst = {name: "breadthfirst"};
export var grid = {name: "grid"};

// tested but not viable:
// spread: too slow
export var euler =
{
  /*eslint no-unused-vars: "off"*/
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
