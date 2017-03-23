// Handles the cytoscape.js canvas. Call initGraph(container) to start.
var cy;

var styledEdges = [];
var styledNodes = [];
var selectedNode;
var path;
var pathSource;
var pathTarget;

function setSource(node)
{
	if(node === undefined) {return false;}
	document.getElementById('centersource').hidden=false;
	if(pathTarget !== undefined)
	{
		document.getElementById('shortestpath').hidden=false;
		document.getElementById('spiderworm').hidden=false;
		document.getElementById('doublestar').hidden=false;
	}
	if(pathSource!==undefined) {pathSource.removeClass('source');}
	pathSource = node;
	pathSource.addClass('source');
	document.getElementById('sourcelabel').innerHTML=
		pathSource.data('name').replace(SPARQL_PREFIX,"");
}

function setTarget(node)
{
	if(node === undefined) {return false;}
	document.getElementById('centertarget').hidden=false;
	if(pathSource !== undefined)
	{
		document.getElementById('shortestpath').hidden=false;
		document.getElementById('spiderworm').hidden=false;
		document.getElementById('doublestar').hidden=false;
	}
	if(pathTarget!==undefined) {pathTarget.removeClass('target');}
	pathTarget = node;
	pathTarget.addClass('target');
	document.getElementById('targetlabel').innerHTML=
		pathTarget.data('name').replace(SPARQL_PREFIX,"");
}

function highlightEdges(edges)
{
	edges.show();
	styledEdges.push(edges);
	edges.addClass("highlighted");
}

// should use the same color as "selector" : "node:selected" in style.js
function highlightNodes(nodes)
{
	nodes.show();
	styledNodes.push(nodes);
	// styled nodes is an array of arraylike objects
	// show edges between new nodes and all other highlighted ones
	for(var i=0;i<styledNodes.length;i++)
			{highlightEdges(nodes.edgesWith(styledNodes[i]));}
	nodes.addClass("highlighted");
}

function hideEdges(edges)
{
	edges.hide();
	styledEdges.push(edges);
}

function hideNodes(nodes)
{
	nodes.hide();
	styledNodes.push(nodes);
}

function resetStyle()
{
	$('body').addClass('waiting');
	firstCumulativeSearch = true;
	selectedNode = undefined;
	cy.startBatch();
	for (var i = 0; i < styledNodes.length; i++)
	{
		styledNodes[i].show();
		styledNodes[i].removeClass("highlighted");
	}
	styledNodes = [];
	for (var i = 0; i < styledEdges.length; i++)
	{
		styledEdges[i].show();
		styledEdges[i].removeClass("highlighted");
	}
	styledEdges = [];
	cy.endBatch();
	$('body').removeClass('waiting');
}

function showPath(from, to)
{
	$('body').addClass('waiting');
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
		alert("no path found");
		$('body').removeClass('waiting');
		return false;
	}
	$('body').removeClass('waiting');
	return true;
}

function showWorm(from, to)
{
	if(showPath(from, to))
	{
			cy.startBatch();
			var edges = to.connectedEdges();
			highlightEdges(edges);
			highlightNodes(edges.connectedNodes());
			cy.endBatch();
			return true;
	}
	return false;
}

function showDoubleStar(from, to)
{
	if(showWorm(from, to))
	{
			cy.startBatch();
			var edges = from.connectedEdges();
			highlightEdges(edges);
			highlightNodes(edges.connectedNodes());
			cy.endBatch();
			return true;
	}
	return false;
}


function initGraph(container, graph)
{
	cy = cytoscape(
	{
		container: container,
		style: style[0].style,
		wheelSensitivity: 0.3,
	});

	var defaults = {
		menuRadius: 100, // the radius of the circular menu in pixels
		selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
		commands: [
			{
				content: 'description',
				//select: function(node) {window.open(node._private.data.name);}
				select: function(node)
				{
					window.open(node._private.data.name);
				}
			},
			{
				content: 'submit ticket',
				select: function(node)
				{
					//var b = confirm("Please only use this ticket tracker for problems with the ontology data, not the javascript visualization web application. Continue?");
					//window.open("https://github.com/IMISE/snik-ontology/issues/new");
					//if(b)
					{
						//window.open("https://bitbucket.org/imise/snik-ontology/issues/new?title="+
						if(confirm(ONTOLOGY_ISSUE_WARNING))
						{
							var url = "https://github.com/IMISE/snik-ontology/issues/new?title="+
							encodeURIComponent(node._private.data.name)+" v"+ONTOLOGY_MODIFIED+
							"&body="+encodeURIComponent("The class "+node._private.data.name+
							" has [incorrect/missing attribute values | incorrect/missing relations to other classes, other (please specify and remove not applicable ones).]\n\n**Details**\n");
							console.log(url);
							window.open(url);
						}
					}
				}
			},
			{
				content: 'set as path target',
				select: function(node) {setTarget(node);}
			},
			{
				content: 'set as path source',
				select: function(node) {setSource(node);}
			},
			{
				content: 'star',
				select: function(node) {showWorm(node,node);}
			},

/*
			{
				content: 'shortest path to here',
				select: function(node)
				{
					if (selectedNode)
					{
						resetStyle();
						showPath(selectedNode, node);
					}
				}
			},
			{
				content: 'spiderworm to here',
				select: function(node)
				{
					if (selectedNode)
					{
						resetStyle();
						showWorm(selectedNode, node);
					}
				}
			},
			*/
			/* commented out until denethor pdf links in browser work
			{
				content: 'book page (in development)',
				select: function(node)
				{
					var page = node.data()['Definition_DE_Pages'][0];
					if(!page) {page = node.data()['Definition_EN_Pages'][0];}
					var source = node.data().Sources;
					if(!page || !(source === 'bb' || source === 'ob'))
					{
						alert("no book page defined");
						return;
					}
					switch(source)
					{
						case 'bb':
						window.open("https://denethor.imise.uni-leipzig.de/remote.php/webdav/Shared/SNIK/bb.pdf#page="+page,"_blank");
						break;

						case 'ob':
						window.open("https://denethor.imise.uni-leipzig.de/remote.php/webdav/Shared/SNIK/ob.pdf#page="+page,"_blank");
						break;
					}
				}
			}
			*/
		],
		fillColor: 'rgba(255, 255, 50, 0.35)', // the background colour of the menu
		activeFillColor: 'rgba(255, 255, 80, 0.35)', // the colour used to indicate the selected command
		openMenuEvents: 'cxttapstart taphold', // cytoscape events that will open the menu (space separated)
		itemColor: 'white', // the colour of text in the command's content
		itemTextShadowColor: 'gray', // the text shadow colour of the command's content
		zIndex: 9999, // the z-index of the ui div
	};

	var defaultsRelations = {
		menuRadius: 100, // the radius of the circular menu in pixels
		selector: 'edge', // elements matching this Cytoscape.js selector will trigger cxtmenus
		commands: [
			{
				content: 'submit ticket',
				select: function(edge)
				{
					//window.open("https://bitbucket.org/imise/snik-ontology/issues/new?title="+
					window.open
					(
						"https://github.com/IMISE/snik-ontology/issues/new?title="+
						encodeURIComponent(edge._private.data.name+" v"+ONTOLOGY_MODIFIED)+
						"&body="+encodeURIComponent('The edge "'+edge._private.data.name+'" is incorrect.\n\n**Details**\n')
					);
				}
			},
		],
		fillColor: 'rgba(255, 255, 50, 0.35)', // the background colour of the menu
		activeFillColor: 'rgba(255, 255, 80, 0.35)', // the colour used to indicate the selected command
		openMenuEvents: 'cxttapstart taphold', // cytoscape events that will open the menu (space separated)
		itemColor: 'white', // the colour of text in the command's content
		itemTextShadowColor: 'gray', // the text shadow colour of the command's content
		zIndex: 9999, // the z-index of the ui div
	};


	var cxtmenuApi = cy.cxtmenu(defaults);
	var cxtmenuApiRelations = cy.cxtmenu(defaultsRelations);

/*
	function setSelectedNode(node)
	{
		lastSelectedNode = selectedNode;
		selectedNode = node;
		if(!lastSelectedNode) lastSelectedNode = selectedNode; // first selection
		document.getElementById('lastselected').innerHTML=
		 lastSelectedNode.data('name').replace(SPARQL_PREFIX,"");
	}
	*/

	cy.add(graph.elements);
	//cy.on('cxttap',"node",function(event) {showPath(selectedNode,event.cyTarget);});
	//cy.on('unselect', resetStyle);
	// cy.on('unselect', "node", function(event)
	// {
	// 	console.log("unselect");
	// });
	cy.on('select', "edge", function(event)
	{
		//cy.startBatch();
		//resetStyle();
		highlightEdges(event.cyTarget);
		//cy.endBatch();
	});
/*
	cy.on('tap', function(event)
	{
	  var evtTarget = event.cyTarget;
	  if(evtTarget === cy) {resetStyle();} // background
	});
*/
	cy.on('select', "node", function(event)
	{
		//cy.startBatch();
		//resetStyle();
		selectedNode = event.cyTarget;
		highlightNodes(selectedNode);
		//cy.endBatch();
	});
}
