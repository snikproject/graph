/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "^_" }]*/
import {progress} from "./progress.js";
import {style} from "./style.js";
import {colorschemenight} from "./colorschemenight.js";
import {colorschemeday} from "./colorschemeday.js";
import * as sparql from "./sparql.js";
import {registerMenu} from "./contextmenu.js";
import timer from "./timer.js";
//import {setFirstCumulativeSearch} from "./search.js";


// Handles the cytoscape.js canvas. Call initGraph(container) to start.
var cy = null;
var removedNodes = null;
var removedEdges = null;
var styledEdges = null;
var styledNodes = null;
var selectedNode = null;
var path = null;
var pathSource = null;
var pathTarget = null;
var starMode = false;

function setStarMode(mode) {starMode=mode;}

function hideNodes(nodes)
{
  nodes.hide();
  styledNodes = styledNodes.union(nodes);
}

function showNodes(nodes)
{
  nodes.show();
  styledNodes = styledNodes.subtract(nodes);
}

function highlightEdges(edges)
{
  edges.show();
  styledEdges = styledEdges.union(edges);
  edges.addClass('highlighted');
}

// should use the same color as "selector" : "node:selected" in style.js
function highlightNodes(nodes)
{
  nodes.show();
  styledNodes = styledNodes.union(nodes);
  // styled nodes is an array of arraylike objects
  // show edges between new nodes and all other highlighted ones
  highlightEdges(nodes.edgesWith(styledNodes));
  nodes.addClass('highlighted');
}

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

// Extended all along the path
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

/** Get the starting node for a path operation. If there is no starting node defined, use the selected node. If that is not defined as well, return null. */
function getSource()
{
  if(pathSource) {return pathSource;}
  if(selectedNode) {return selectedNode;}
  return null;
}

function setSource(node)
{
  if(!node)
  {
    return false;
  }
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

function setTarget(node)
{
  if(node === undefined)
  {
    return false;
  }
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

function resetStyle()
{
  starMode=false;
  progress(0);
  //setFirstCumulativeSearch(true);
  selectedNode = undefined;
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

function remove(nodes)
{
  progress(0);
  cy.startBatch();
  removedNodes.add(nodes);
  for(let i=0;i<nodes.length;i++)
  {
    const node = nodes[i];
    //console.log(node.data().name);
    sparql.deleteResource(node.data().name,"http://www.snik.eu/ontology/test");
  }
  {removedEdges.add(nodes.connectedEdges());}
  nodes.remove();
  cy.endBatch();
  progress(100);
}

function restore()
{
  progress(0);
  cy.startBatch();
  // all nodes first so that edges have their sources and targets
  for (let i = 0; i < removedNodes.length; i++)
  {removedNodes[i].restore();}
  for (let i = 0; i < removedEdges.length; i++)	{removedEdges[i].restore();}
  removedNodes = cy.collection();
  removedEdges = cy.collection();
  cy.endBatch();
  progress(100);
}

function layout(name)
{
  cy
  //.nodes(":visible")
    .layout({ name: name }).run();
}

var filtered = {};

//** Hide or show certain nodes or edges.**/
function filter(checkbox)
{
  var selector = checkbox.getAttribute("value");
  if(checkbox.checked) // selected means the elements shall be shown, undo the filter
  {
    const elements = filtered[selector];
    if(elements)
    {
      filtered[selector] = undefined;
      elements.show();
    }
  }
  else // unselected checkbox, hide elements by applying filter
  {
    const elements = cy.elements(selector);
    if(elements)
    {
      // if just saving nodes, the edges would get lost
      filtered[selector]=elements.union(elements.connectedEdges());
      elements.hide();
    }
  }
}

function initGraph()
{
  const initTimer = timer("graph-init");
  document.addEventListener('keydown',function(e)
  {
    if(e.keyCode === 46) {remove(cy.$('node:selected'));}
  });
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
    highlightNodes(selectedNode);
    //cy.endBatch();
  });

  // workaround to create empty collections until better known
  removedNodes = cy.collection() ;
  removedEdges = cy.collection() ;
  styledEdges = cy.collection();
  styledNodes = cy.collection();
  initTimer.stop();
}

function setSelectedNode(node) {selectedNode=node;}

export {invert,resetStyle,showDoubleStar,showWorm,showPath,showStarPath,initGraph,cy,remove,restore,layout,filter,
  getSource,pathTarget,highlightNodes,setSelectedNode,setSource,setTarget,showStar,setStarMode,hideNodes,showNodes};
