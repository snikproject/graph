/*eslint no-unused-vars: ["warn", { "argsIgnorePattern": "^_" }]*/
import {progress} from "./progress.js";
import {style} from "./style.js";
import {colorschemenight} from "./colorschemenight.js";
import {colorschemeday} from "./colorschemeday.js";
import * as sparql from "./sparql.js";
import {registerMenu} from "./contextmenu.js";
//import {setFirstCumulativeSearch} from "./search.js";



// Handles the cytoscape.js canvas. Call initGraph(container) to start.
var cy;
var removedNodes = [];
var removedEdges = [];
var styledEdges = [];
var styledNodes = [];
var selectedNode;
var path;
var pathSource;
var pathTarget;
var starMode=false;

function mergeJsonArraysByKey(a1,a2)
{
  const map1 = new Map();
  const map2 = new Map();
  for(let i=0;i<a1.length;i++)
  {
    if(a1[i].selector)
    {
      map1.set(a1[i].selector,a1[i]);
    }
  }
  for(let i=0;i<a2.length;i++)
  {
    if(a2[i].selector)
    {
      map2.set(a2[i].selector,a2[i]);
    }
  }
  const merged = [];
  map1.forEach((value,key,_) =>
  {
    if(map2.has(key))
    {
      merged.push($.extend(true,{},value,map2.get(key)));
    }
    else
    {
      merged.push(value);
    }
  });
  map2.forEach((value,key,_) =>
  {
    if(!map1.has(key))
    {
      merged.push(value);
    }
  });
  return merged;
}

function hideNodes(nodes)
{
  nodes.hide();
  styledNodes.push(nodes);
}

function highlightEdges(edges)
{
  edges.show();
  styledEdges.push(edges);
  edges.addClass('highlighted');
}

// should use the same color as "selector" : "node:selected" in style.js
function highlightNodes(nodes)
{
  nodes.show();
  styledNodes.push(nodes);
  // styled nodes is an array of arraylike objects
  // show edges between new nodes and all other highlighted ones
  for(var i=0;i<styledNodes.length;i++)
  {
    highlightEdges(nodes.edgesWith(styledNodes[i]));
  }
  nodes.addClass('highlighted');
}

function showPath(from, to)
{
  starMode=true;
  progress(0);
  var aStar = cy.elements().aStar(
    {
      root: from,
      goal: to
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
      goal: to
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

function setSource(node)
{
  if(node === undefined)
  {
    return false;
  }
  document.getElementById('centersource').hidden=false;
  if(pathTarget !== undefined)
  {
    document.getElementById('shortestpath').hidden=false;
    document.getElementById('spiderworm').hidden=false;
    document.getElementById('doublestar').hidden=false;
    document.getElementById('starpath').hidden=false;
    cy.resize(); // may move cytoscape div which it needs to be informed about, else there may be mouse pointer errrors.
  }
  if(pathSource!==undefined)
  {
    pathSource.removeClass('source');
  }
  pathSource = node;
  pathSource.addClass('source');
  document.getElementById('sourcelabel').innerHTML=
   pathSource.data('name').replace(sparql.SPARQL_PREFIX,'');
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
  for (let i = 0; i < styledNodes.length; i++)
  {
    styledNodes[i].show();
    styledNodes[i].removeClass('highlighted');
  }
  styledNodes = [];
  for (let i = 0; i < styledEdges.length; i++)
  {
    styledEdges[i].show();
    styledEdges[i].removeClass('highlighted');
  }
  styledEdges = [];
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
  const head = $('head')[0];

  const invertStyle = $('#invert')[0];
  if (invertStyle)
  {
    head.removeChild(invertStyle);
  }
  if (enabled)
  {
    {
      const styleElement = document.createElement('style');
      styleElement.type = 'text/css';
      styleElement.id = 'invert';
      styleElement.appendChild(document.createTextNode(CSS));
      //injecting the css to the head
      head.appendChild(styleElement);
    }
    const merged = mergeJsonArraysByKey(style.style,colorschemeday);
    cy.style().fromJson(merged).update();
  }
  else
  {
    const merged = mergeJsonArraysByKey(style.style,colorschemenight);
    cy.style().fromJson(merged).update();
  }
}

function remove(nodes)
{
  $('body').addClass('waiting');
  cy.startBatch();
  removedNodes.push(nodes);
  removedEdges.push(nodes.connectedEdges());
  nodes.remove();
  cy.endBatch();
  $('body').removeClass('waiting');
}

function restore()
{
  $('body').addClass('waiting');
  cy.startBatch();
  // all nodes first so that edges have their sources and targets
  for (let i = 0; i < removedNodes.length; i++)	{removedNodes[i].restore();}
  for (let i = 0; i < removedEdges.length; i++)	{removedEdges[i].restore();}
  removedNodes = [];
  removedEdges = [];
  cy.endBatch();
  $('body').removeClass('waiting');
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
      elements.restore();
    }
  }
  else // unselected checkbox, hide elements by applying filter
  {
    const elements = cy.elements(selector);
    if(elements)
    {
      // if just saving nodes, the edges would get lost
      filtered[selector]=elements.union(elements.connectedEdges());
      elements.remove();
    }
  }
}

function initGraph()
{
  $(document).bind('keydown',function(e)
  {
    if(e.keyCode === 46) {remove(cy.$('node:selected'));}
  });
  $.ajaxSetup({beforeSend:function(xhr)
  {
    if (xhr.overrideMimeType)
    {xhr.overrideMimeType("application/json");}
  }});

  const merged = mergeJsonArraysByKey(style.style,colorschemenight);
  cy = cytoscape(
    {
      container: document.getElementById('cy'),
      style: merged,
      wheelSensitivity: 0.3,
    });
  registerMenu();

  /*
function setSelectedNode(node)
{
lastSelectedNode = selectedNode;
selectedNode = node;
if(!lastSelectedNode) lastSelectedNode = selectedNode; // first selection
document.getElementById('lastselected').innerHTML=
lastSelectedNode.data('name').replace(sparql.SPARQL_PREFIX,"");
}
*/
  //cy.on('cxttap',"node",function(event) {showPath(selectedNode,event.target);});
  //cy.on('unselect', resetStyle);
  // cy.on('unselect', "node", function(event)
  // {
  // 	console.log("unselect");
  // });
  cy.on('select', 'edge', function(event)
  {
    //cy.startBatch();
    //resetStyle();
    highlightEdges(event.target);
    //cy.endBatch();
  });
  /*
cy.on('tap', function(event)
{
var evtTarget = event.target;
if(evtTarget === cy) {resetStyle();} // background
});
*/
  cy.on('select', 'node', function(event)
  {
    //cy.startBatch();
    //resetStyle();
    selectedNode = event.target;
    highlightNodes(selectedNode);
    //cy.endBatch();
  });
}

function setSelectedNode(node) {selectedNode=node;}

export {invert,resetStyle,showDoubleStar,showWorm,showPath,showStarPath,initGraph,cy,remove,restore,layout,filter,pathSource,pathTarget,highlightNodes,setSelectedNode,setSource,setTarget,showStar};
