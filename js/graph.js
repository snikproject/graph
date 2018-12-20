/**
Provides graph operations such as initialization, wayfinding, highlighting, showing and hiding.
While star operations and reset style use the Cytoscape.js visibility attribute while filters use the "display" attribute
This ensures that filters and star operations interact properly, for example that resetting the style does not show filtered nodes.
See http://js.cytoscape.org/#style/visibility.

@module graph*/
/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "^_" }]*/
import {progress} from "./progress.js";
import {style} from "./style.js";
import {colorschemenight} from "./colorschemenight.js";
import {colorschemeday} from "./colorschemeday.js";
import * as sparql from "./sparql.js";
import {registerMenu} from "./contextmenu.js";
import timer from "./timer.js";
import * as NODE from "./node.js";
// Handles the cytoscape.js canvas. Call initGraph(container) to start.
let cy = null;
let selectedNode = null;
let path = null;
let pathSource = null;
let pathTarget = null;
let starMode = false;

/** Set whether star mode is active, where further stars will not hide other nodes but unhide instead.
@param {boolean} mode whether star mode is active
*/
function setStarMode(mode) {starMode=mode;}

/** @return whether star mode is active */
function getStarMode() {return starMode;}

/** Hides elements using visibility: hidden.
Do not use this for filters as they use the "display" attribute to properly interact with the other operations.
@param {eles} eles the nodes to hide
*/
function hide(eles)
{
  eles.style("visibility","hidden");
  // Merge is in place. See http://js.cytoscape.org/#eles.merge
}

/** Show (unhide) the given elements using visibility: visible.
Do not use this for filters as they use the "display" attribute to properly interact with the other operations.
@param {cy.collection} eles the elements to show
*/
function show(eles)
{
  eles.style("visibility","visible");
  // Unmerge is in place. See http://js.cytoscape.org/#eles.unmerge
}

/** Highlight the given elements using the 'highlighted' css class from the color scheme stylesheet and show them.
@param {cy.collection} eles the elements to highlight
*/
function highlight(eles)
{
  eles.style("visibility","visible");
  //highlight(eles.edgesWith(styled)); // is this needed? if yes, prevent endless loop
  eles.addClass('highlighted');
}

/** Removes all highlighting (except selection) and shows all hidden nodes. */
function resetStyle()
{
  starMode=false;
  progress(0);
  //setFirstCumulativeSearch(true);
  //selectedNode = undefined;
  cy.startBatch();
  cy.elements(".highlighted").removeClass("highlighted");
  cy.elements(":hidden").style("visibility","visible");
  cy.endBatch();
  progress(100);
}

/** Highlight all nodes and edges on a shortest path between "from" and "to".
Hide all other nodes except when in star mode.
@param {node} from path start node
@param {node} to path target node
@returns whether a path could be found
*/
function showPath(from, to)
{
  progress(0);
  if(starMode) {show(cy.elements(":hidden"));} // temporarily make all hidden nodes visible so that they can be used for pathfinding
  const elements = cy.elements(":visible");
  hide(cy.elements());
  if(starMode) {show(cy.elements(".highlighted"));}
  const aStar = elements.aStar(
    {
      root: from,
      goal: to,
    });
  path = aStar.path;
  if (path)
  {
    cy.startBatch();
    starMode=true;
    cy.add(path);
    highlight(path);
    cy.endBatch();
  }
  else
  {
    progress(100);
    if(!starMode) {resetStyle();} // keep it as it was before the path operation
    alert('no path found');
    return false;
  }
  progress(100);
  return true;
}

/** Show a "spider worm" between two nodes, which combines a star around "from" with a shortest path to "to".
Hide all other nodes except when in star mode.
@param {node} from path start node
@param {node} to path target node, gets a "star" around it as well
@returns whether a path could be found
*/
function showWorm(from, to)
{
  if(showPath(from, to))
  {
    progress(0);
    cy.startBatch();
    show(to.connectedEdges());
    const edges = to.connectedEdges(":visible");
    hide(to.connectedEdges());
    highlight(edges);
    highlight(edges.connectedNodes());
    cy.endBatch();
    progress(100);
    return true;
  }
  return false;
}

/** Highlight the give node and all its directly connected nodes (in both directions).
Hide all other nodes except when in star mode.
@param {node} node center of the star
@param {Boolean} changeLayout arrange the given node and it's close matches in the center and the connected nodes in a circle around them.
@param {Boolean} directed only show edges that originate from node, not those that end in it. Optional and defaults to false.
*/
function showStar(node, changeLayout, directed)
{
  progress(0);
  cy.startBatch();
  if(starMode) {show(cy.elements(":hidden"));}
  starMode=true;
  // open 2 levels deep on closeMatch
  //const inner = node; // if you don't want to include close match, define inner like this
  const closeMatchEdges = node.connectedEdges(":visible").filter('[pl="closeMatch"]');
  const innerNodes = closeMatchEdges.connectedNodes(":visible");
  innerNodes.merge(node); // in case there is no close match edge
  const edges = directed?
    innerNodes.edgesTo('node')
    :innerNodes.connectedEdges(":visible");
  const nodes  = edges.connectedNodes(":visible");
  const outerNodes = nodes.difference(innerNodes);
  hide(cy.elements());
  highlight(node);
  highlight(nodes);
  highlight(edges);
  show(cy.elements(".highlighted"));

  if(changeLayout)
  {
    nodes.layout(
      {
        name: 'concentric',
        fit: true,
        levelWidth: function() {return 1;},
        minNodeSpacing: 175,
        concentric: function(layoutNode)
        {
          if(innerNodes.contains(layoutNode)) {return 2;}
          if(outerNodes.contains(layoutNode)) {return 1;}
          throw new Error("unexpected node in star");
        },
      }
    ).run();
  }

  cy.endBatch();
  progress(100);
}

/** Highlight the given two nodes, directly connected nodes (in both directions) of both of them and a shortest path between the two.
Hide all other nodes except when in star mode.
@param {node} from path start node
@param {node} to path target node
@returns whether a path could be found
*/
function showDoubleStar(from, to)
{
  if(showWorm(from, to))
  {
    return showWorm(to, from);
  }
  return false;
}

/**
/** Highlight the shortest path between the two given nodes and nodes directly connected (in both directions) to all nodes on the path.
Hide all other nodes except when in star mode.
@param {node} from path start node
@param {node} to path target node
@returns whether a path could be found
*/
function showStarPath(from, to)
{
  progress(0);
  cy.startBatch();
  if(starMode) {show(cy.elements(":hidden"));}
  starMode=true;
  const aStar = cy.elements(":visible").aStar(
    {
      root: from,
      goal: to,
    });
  path = aStar.path;
  if (path)
  {
    cy.add(path);
    highlight(path.edges());
    highlight(path.nodes());
    const edges = path.nodes().connectedEdges(":visible");
    highlight(edges);
    highlight(edges.connectedNodes(":visible"));
    hide(cy.elements());
    show(cy.elements(".highlighted"));
    cy.endBatch();
    progress(100);
    return true;
  }
  else
  {
    cy.endBatch();
    progress(100);
    // keep it as it was before the operation
    if(starMode)
    {
      hide(cy.elements());
      show(cy.elements(".highlighted"));
    }
    else {resetStyle();}
    alert('no path found');
    return false;
  }
}

/** Returns the start node for all path operations
@returns the start node for all path operations, or null if none exists. */
function getSource()
{
  if(pathSource) {return pathSource;}
  if(selectedNode) {return selectedNode;}
  return null;
}

/** Set the given node as source for all path operations.
@param {node} node the new source
@returns whether node is not null
*/
function setSource(node)
{
  if(!node) {return false;}
  //document.getElementById('centersource').hidden=false;
  if(pathTarget !== null)
  {
    /*
        document.getElementById('shortestpath').hidden=false;
        document.getElementById('spiderworm').hidden=false;
        document.getElementById('doublestar').hidden=false;
        document.getElementById('starpath').hidden=false;
        */
    cy.resize(); // may move cytoscape div which it needs to be informed about, else there may be mouse pointer errrors.
  }
  if(pathSource!==null)
  {
    pathSource.removeClass('source');
  }
  pathSource = node;
  pathSource.addClass('source');
  /*
      document.getElementById('sourcelabel').innerHTML=
      pathSource.data(NODE.ID).replace(sparql.SPARQL_PREFIX,'');
      */
  return true;
}

/** Set the given node as target for all path operations.
@param {node} node the new source
@returns whether node is not null
*/
function setTarget(node)
{
  if(!node) {return false;}
  document.getElementById('centertarget').hidden=false;
  if(pathSource !== null)
  {
    document.getElementById('shortestpath').hidden=false;
    document.getElementById('spiderworm').hidden=false;
    document.getElementById('doublestar').hidden=false;
    document.getElementById('starpath').hidden=false;
    cy.resize(); // may move cytoscape div which it needs to be informed about, else there may be mouse pointer errrors.
  }
  if(pathTarget!==null)
  {
    pathTarget.removeClass('target');
  }
  pathTarget = node;
  pathTarget.addClass('target');
  document.getElementById('targetlabel').innerHTML=
      pathTarget.data(NODE.ID).replace(sparql.SPARQL_PREFIX,'');
}

/** Inverts the screen colors in the canvas for day mode. Uses an inverted node js style file to keep node colors.
@param {boolean} enabled whether the canvas colors should be inverted
*/
function invert(enabled)
{
  if (enabled)
  {
    document.getElementById("cy").style.backgroundColor = "white";
    cy.style().fromJson(style.style.concat(colorschemeday)).update();
  }
  else
  {
    document.getElementById("cy").style.backgroundColor = "black";
    cy.style().fromJson(style.style.concat(colorschemenight)).update();
  }
}

/** Creates a new cytoscape graph, assigns it to the #cy container and sets up basic event listeners.
@returns a cytoscape graph
*/
function initGraph()
{
  const initTimer = timer("graph-init");

  // remove nodes or edges from the graph (not the SPARQL endpoint) with the delete key
  document.addEventListener('keydown',function(e)
  {
    if(e.keyCode === 46) // delete key
    {
      cy.remove(':selected');
    }
  });

  cy = cytoscape(
    {
      container: document.getElementById('cy'),
      style: style.style.concat(colorschemenight),
      wheelSensitivity: 0.3,
      minZoom: 0.02,
      maxZoom: 7,
    });
  cy.panzoom(); // Google Maps like zoom UI element
  selectedNode = cy.collection();
  registerMenu();

  cy.on('select', 'edge', function(event)
  {
    highlight(event.target);
  });

  cy.on('select', 'node', function(event)
  {
    selectedNode = event.target;
  });

  initTimer.stop();
  return cy;
}

/** Selects a node.
@param {node} node the node to select
*/
function setSelectedNode(node) {selectedNode=node;}

export {invert,resetStyle,showDoubleStar,showWorm,showPath,showStarPath,initGraph,cy,
  getSource,pathTarget,highlight,setSelectedNode,setSource,setTarget,showStar,setStarMode,getStarMode,hide,show};
