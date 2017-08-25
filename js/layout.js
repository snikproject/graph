//** @module */
import * as log from "./log.js";
import timer from "./timer.js";
import * as rdfGraph from "./rdfGraph.js";
import * as file from "./file.js";

var activeLayout = undefined;

/**
@param {string} layoutName Cytoscape.js layout name
@param {Set} subs the subontology identifiers included in the graph. Used to retrieve the correct layout later.
@returns the storage name coded by the layout and the subontologies
@example storageName("euler",new Set(["meta","ob","bb"]));
*/
function storageName(layoutName,subs) {return "layout"+layoutName+[...subs].sort().toString().replace(/[^a-z]/g,"");}

/** Returns an array containing the positions of the given nodes
@param {cy.collection} nodes the nodes whose positions are returned
@returns an array containing the positions of the given nodes
@example
// returns [["http://www.snik.eu...",{"x":0,"y":0}],...]
positions(cy.nodes());
*/
export function positions(nodes)
{
  const pos=[];
  for(let i=0;i<nodes.size();i++)
  {
    const node = nodes[i];
    pos.push([node.data().id,node.position()]);
  }
  return pos;
}

/** Layouts all visible nodes in a graph. Saves to cache but doesn't load from it (use {@link module:layout.runCached} for that).
@param {cy.cytoscape} cy the Cytoscape.js graph to run the layout on
@param {json} layoutConfig the layout configuration, which includes the layout name and options
@param {Set} subs Set of subontologies. If the subs are not given the layout still works but it is not cached.
@returns whether the layout could successfully be applied. Does not indicate success of saving to cache.
@example
run(cy,{"name":"grid"},new Set(["meta","ciox"]))
*/
export function run(cy,layoutConfig,subs)
{
  if(cy.nodes().size()===0)
  {
    log.warn("layout.js#run: Graph empty. Nothing to layout.");
    return false;
  }
  const layoutTimer = timer("layout");
  if(activeLayout) {activeLayout.stop();}
  activeLayout = cy.elements(":visible").layout(layoutConfig);
  activeLayout.run();
  layoutTimer.stop();
  if(subs)
  {
    if(typeof(localStorage)=== "undefined")
    {
      log.error("web storage not available, could not write to cache.");
      return true;
    }
    const pos=positions(cy.nodes());
    const name = storageName(layoutConfig.name,subs);
    localStorage.setItem(name,JSON.stringify(pos));
  }
  return true;
}

/** Applies a preset layout matching the node id's to the first element of each subarray in pos. Nodes without matching entry
in pos are set to position {x:0,y:0}, positions without matching node id are ignored.
@param {cytoscape} cy the Cytoscape.js graph to apply the positions on, node id's need to match those in the given positions
@param {array} pos an array of arrays, each of which contains the positions for a node id
@returns whether the layout could be successfully applied
@example
presetLayout(cy,[["http://www.snik.eu...",{"x":0,"y":0}],...]);
*/
export function presetLayout(cy,pos)
{
  const map = new Map(pos);
  let hits = 0;
  let misses = 0;
  const layoutConfig =
  {
    name: 'preset',
    fit:false,
    positions: node=>
    {
      let position;
      if((position= map.get(node._private.data.id)))
      {
        hits++;
        return position;
      }
      misses++;
      return {x:0,y:0};
    },
  };
  const status = run(cy,layoutConfig);
  if(misses>0||hits<positions.length)
  {
    log.warn(`...${hits}/${cy.nodes().size()} node positions set. ${pos.length-hits} superfluous layout positions .`);
    const precision = hits/pos.length;
    const recall = hits/cy.nodes().size();
    if(precision<config.layoutCacheMinPrecision)
    {
      log.warn(`Precision of ${precision} less than minimal required precision of ${config.layoutCacheMinPrecision}.`);
      return false;
    }
    if(recall<config.layoutCacheMinRecall)
    {
      log.warn(`Recall of ${recall} less than minimal required of recall of ${config.layoutCacheMinRecall}.`);
      return false;
    }
  }
  else
  {
    log.debug("...layout applied with 100% overlap.");
  }
  if(hits===0) {return false;}
  return status;
}

/** Cached version of {@link module:layout.run}.
@param {cy.cytoscape} cy the Cytoscape.js graph to run the layout on
@param {json} layoutConfig the layout configuration, which includes the layout name and options
@param {Set} subs Set of subontologies. If the subs are not given the layout still works but it is not cached.
@returns whether the layout could successfully be applied. Does not indicate success of loading from cache,
in which case it is calculated anew.
*/
export function runCached(cy,layoutConfig,subs)
{
  if(typeof(localStorage)=== "undefined")
  {
    log.error("Web storage not available, could not access browser-based cache.");
    run(layoutConfig);
    return;
  }
  const name = storageName(layoutConfig.name,subs);
  // web storage
  const cacheItem = localStorage.getItem(name);
  // file
  /*
  if(!cacheItem)
  {
  log.warn("Web storage cache miss, trying to load from file...");
  file.readTextFile("cache/"+storageName)
  .then(text=>
  {
  cacheItem = text;
})
.catch(e=>{log.warn("File cache miss.");});
}
*/
  if(cacheItem) // cache hit
  {
    try
    {
      const pos=JSON.parse(cacheItem);
      log.info(`Loaded layout from cache, applying ${pos.length} positions...`);
      const status = presetLayout(cy,pos);
      if(status) {return true;}
      log.warn("Could not apply layout to active graph, recalculating layout...");
    }
    catch(e)
    {
      log.error("Could not load cache item, recalculating layout...",e);
    }
  }
  else // cache miss
  {
    log.warn("Layout not in cache, recalculating layout...");
  }
  return run(cy,layoutConfig,subs);
}

/** Very fast but useless for most purposes except for testing.*/
export var grid = {name: "grid"};

/**Fastest (but still slow) force directed Cytoscape.js layout found.*/
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
