/** @module graph*/
/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "^_" }]*/
import {progress} from "./progress.js";
import {style} from "./style.js";
import {colorschemenight} from "./colorschemenight.js";
import {colorschemeday} from "./colorschemeday.js";
import * as sparql from "./sparql.js";
import * as log from "./log.js";
import {registerMenu} from "./contextmenu.js";
import timer from "./timer.js";

// Handles the cytoscape.js canvas. Call initGraph(container) to start.
var cy = null;
var styledEdges = null;
var styledNodes = null;
var selectedNode = null;
var path = null;
var pathSource = null;
var pathTarget = null;
var starMode = false;

const REMOVE_SINGLE_ELEMENTS_ONLY = true;

/** Set whether star mode is active, where further stars will not hide other nodes but unhide instead.
@param {boolean} mode whether star mode is active
*/
function setStarMode(mode) {starMode=mode;}

/** Hide the given nodes.
@param {cy.collection} nodes the nodes to hide
*/
function hideNodes(nodes)
{
  nodes.hide();
  styledNodes = styledNodes.union(nodes);
}

/** Show (unhide) the given nodes.
@param {cy.collection} nodes the nodes to show
*/
function showNodes(nodes)
{
  nodes.show();
  styledNodes = styledNodes.subtract(nodes);
}

/** Highlight the given edges using the 'highlighted' css class from the stylesheet.
@param {cy.collection} the edges to highlight
*/
function highlightEdges(edges)
{
  edges.show();
  styledEdges = styledEdges.union(edges);
  edges.addClass('highlighted');
}


/**  Highlight the given nodes using the 'highlighted' css class from the stylesheet.
@param {cy.collection} the nodes to highlight
*/
function highlightNodes(nodes)
{
  nodes.show();
  styledNodes = styledNodes.union(nodes);
  // styled nodes is an array of arraylike objects
  // show edges between new nodes and all other highlighted ones
  highlightEdges(nodes.edgesWith(styledNodes));
  nodes.addClass('highlighted');
}

/** Highlight all nodes and edges on a shortest path between "from" and "to".
Hide all other nodes except when in star mode.
@param {node} from path start node
@param {node} to path target node
@returns whether a path could be found
*/
function showPath(from, to)
{
  starMode=true;
  progress(0);
  var aStar = cy.elements().aStar(
    {
      root: from,
      goal: to,
    });
  path = aStar.path;
  if (path)
  {
    cy.startBatch();
    hideNodes(cy.elements().nodes());
    cy.add(path);
    highlightEdges(path.edges());
    highlightNodes(path.nodes());
    cy.endBatch();
  }
  else
  {
    alert('no path found');
    progress(100);
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
    var edges = to.connectedEdges();
    highlightEdges(edges);
    highlightNodes(edges.connectedNodes());
    cy.endBatch();
    progress(100);
    return true;
  }
  return false;
}

/** Highlight the give node and all its directly connected nodes (in both directions).
Hide all other nodes except when in star mode.
@param {node} node center of the star
*/
function showStar(node)
{
  progress(0);
  if(!starMode)
  {
    hideNodes(cy.elements().nodes());
  }
  starMode=true;
  cy.startBatch();
  highlightNodes(node);
  var edges = node.connectedEdges();
  highlightEdges(edges);
  highlightNodes(edges.connectedNodes());
  // open 2 levels deep on closeMatch
  var closeMatch = edges.filter('edge[interactionLabel="closeMatch"]').connectedNodes().connectedEdges();
  highlightEdges(closeMatch);
  highlightNodes(closeMatch.connectedNodes());
  cy.endBatch();
  progress(100);
}

/** Highlight the give nodes, all their directly connected nodes (in both directions) and a shortest path between the two.
Hide all other nodes except when in star mode.
@param {node} from path start node
@param {node} to path target node
@returns whether a path could be found
*/
function showDoubleStar(from, to)
{
  if(showWorm(from, to))
  {
    progress(0);
    cy.startBatch();
    var edges = from.connectedEdges();
    highlightEdges(edges);
    highlightNodes(edges.connectedNodes());
    cy.endBatch();
    progress(100);
    return true;
  }
  return false;
}

/**
/** Highlight the shortest path between the two given nodes and nodes directly connected (in both directions) to a node on the path.
Hide all other nodes except when in star mode.
@param {node} from path start node
@param {node} to path target node
@returns whether a path could be found
*/
function showStarPath(from, to)
{
  starMode=true;
  progress(0);
  var aStar = cy.elements().aStar(
    {
      root: from,
      goal: to,
    });
  path = aStar.path;
  if (path)
  {
    cy.startBatch();
    hideNodes(cy.elements().nodes());
    progress(10);
    cy.add(path);
    highlightEdges(path.edges());
    progress(20);
    highlightNodes(path.nodes());
    progress(30);
    var edges = path.nodes().connectedEdges();
    highlightEdges(edges);
    highlightNodes(edges.connectedNodes());
    cy.endBatch();
    progress(50);
  }
  else
  {
    alert('no path found');
    progress(100);
    return false;
  }
  progress(100);
  return true;
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
  if(pathTarget !== undefined)
  {
    /*
        document.getElementById('shortestpath').hidden=false;
        document.getElementById('spiderworm').hidden=false;
        document.getElementById('doublestar').hidden=false;
        document.getElementById('starpath').hidden=false;
        */
    cy.resize(); // may move cytoscape div which it needs to be informed about, else there may be mouse pointer errrors.
  }
  if(pathSource!==undefined)
  {
    pathSource.removeClass('source');
  }
  pathSource = node;
  pathSource.addClass('source');
  /*
      document.getElementById('sourcelabel').innerHTML=
      pathSource.data('name').replace(sparql.SPARQL_PREFIX,'');
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
  if(pathSource !== undefined)
  {
    document.getElementById('shortestpath').hidden=false;
    document.getElementById('spiderworm').hidden=false;
    document.getElementById('doublestar').hidden=false;
    document.getElementById('starpath').hidden=false;
    cy.resize(); // may move cytoscape div which it needs to be informed about, else there may be mouse pointer errrors.
  }
  if(pathTarget!==undefined)
  {
    pathTarget.removeClass('target');
  }
  pathTarget = node;
  pathTarget.addClass('target');
  document.getElementById('targetlabel').innerHTML=
      pathTarget.data('name').replace(sparql.SPARQL_PREFIX,'');
}

/** Removes all highlighting (except selection) and shows all hidden nodes. */
function resetStyle()
{
  starMode=false;
  progress(0);
  //setFirstCumulativeSearch(true);
  //selectedNode = undefined;
  cy.startBatch();
  styledNodes.show();
  styledNodes.removeClass('highlighted');
  styledNodes = cy.collection();
  styledEdges.show();
  styledEdges.removeClass('highlighted');
  styledEdges = cy.collection();
  cy.endBatch();
  progress(100);
}

/** Inverts the screen colors in the canvas for day mode. Uses an inverted node js style file to keep node colors.
@param {boolean} enabled whether the canvas colors should be inverted
*/
function invert(enabled)
{
  const CSS =
      `#cy {
        -webkit-filter: invert(100%);
        -moz-filter: invert(100%);
        -o-filter: invert(100%);
        -ms-filter: invert(100%);
      }`;

  const invertStyle = document.getElementById('invert');
  if (invertStyle)
  {
    document.head.removeChild(invertStyle);
  }
  if (enabled)
  {
    {
      const styleElement = document.createElement('style');
      styleElement.type = 'text/css';
      styleElement.id = 'invert';
      styleElement.appendChild(document.createTextNode(CSS));
      //injecting the css to the head
      document.head.appendChild(styleElement);
    }
    cy.style().fromJson(style.style.concat(colorschemeday)).update();
  }
  else
  {
    cy.style().fromJson(style.style.concat(colorschemenight)).update();
  }
}

/** Creates a new cytoscape graph, assigns it to the #cy container and sets up basic event listeners.
@returns a cytoscape graph
*/
function initGraph()
{
  const initTimer = timer("graph-init");
  /*
  document.addEventListener('keydown',function(e)
  {
    if(e.keyCode === 46)
    {
      removeNodes(cy.$('node:selected'));
      removeEdges(cy.$('edge:selected'));
    }
  });
  */
  cy = cytoscape(
    {
      container: document.getElementById('cy'),
      style: style.style.concat(colorschemenight),
      wheelSensitivity: 0.3,
      minZoom: 0.02,
      maxZoom: 7,
    });
  registerMenu();

  cy.on('select', 'edge', function(event)
  {
    //cy.startBatch();
    //resetStyle();
    highlightEdges(event.target);
    //cy.endBatch();
  });

  cy.on('select', 'node', function(event)
  {
    //cy.startBatch();
    //resetStyle();
    selectedNode = event.target;
    //highlightNodes(selectedNode);
    //cy.endBatch();
  });

  styledEdges = cy.collection();
  styledNodes = cy.collection();
  initTimer.stop();
  return cy;
}

/** Selects a node.
@param {node} node the node to select
*/
function setSelectedNode(node) {selectedNode=node;}

export {invert,resetStyle,showDoubleStar,showWorm,showPath,showStarPath,initGraph,cy,
  getSource,pathTarget,highlightNodes,setSelectedNode,setSource,setTarget,showStar,setStarMode,hideNodes,showNodes};
