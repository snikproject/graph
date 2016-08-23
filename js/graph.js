// Handles the cytoscape.js canvas. Call initGraph(container) to start.
var cy;

var styledEdges = [];
var styledNodes = [];
var selectedNode;
var path;

function highlightEdges(edges)
{
	edges.show();
	styledEdges.push(edges);
	edges.style(
	{
		"opacity": 1.0,
		"text-opacity": 1,
		"color": "rgb(128,255,128)",
		'mid-target-arrow-color': 'rgb(128,255,128)',
		'mid-target-arrow-shape': 'triangle',
		'line-color': 'rgb(128,255,128)',
		'width': 4.0
	});
}

// should use the same color as "selector" : "node:selected" in style.js
function highlightNodes(nodes,width=7)
{
	nodes.show();
	highlightEdges(nodes.edgesWith(nodes));
	styledNodes.push(nodes);
	nodes.style(
	{
		'border-width': width
	});
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
	cy.startBatch();
	for (var i = 0; i < styledNodes.length; i++)
	{
		styledNodes[i].show();
		styledNodes[i].style(
		{
			//'background-color': 'rgb(254,196,179)' // debug, see which ones have their style resetted
			//'background-color': 'rgb(254,196,79)' // production
			'border-width': '0'
		});
	}
	styledNodes = [];
	for (var i = 0; i < styledEdges.length; i++)
	{
		styledEdges[i].show();
		styledEdges[i].style(
		{
			'width': 1,
			'line-color': 'white',
			'mid-target-arrow-shape': 'none',
			"text-opacity": 0,
		});
	}
	cy.endBatch();
	$('body').removeClass('waiting');
}

function showpath(from, to)
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

function showworm(from, to)
{
	$('body').addClass('waiting');
	if(showpath(from, to))
	{
			cy.startBatch();
			var edges = to.connectedEdges();
			hideNodes(cy.elements().nodes());
			highlightEdges(edges);
			highlightNodes(edges.connectedNodes());
			cy.endBatch();
	}
	$('body').removeClass('waiting');
}

function initGraph(container)
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
				select: function(node)
				{
					window.open(node._private.data.name
						.replace("http://www.imise.uni-leipzig.de/snik.owl#", "http://linkedspending.aksw.org/snik/"));
				}
			},
			{
				content: 'submit ticket',
				select: function(node)
				{
					window.open("https://github.com/IMISE/snik-ontology/issues/new");
					//encodeURIComponent(node._private.data.name).replace("http://www.imise.uni-leipzig.de/snik.owl#", ""));
				}
			},
			{
				content: 'shortest path to here',
				select: function(node)
				{
					if (selectedNode)
					{
						resetStyle();
						showpath(selectedNode, node);
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
						showworm(selectedNode, node);
					}
				}
			},
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
						window.open("http://www.example.com/bb.pdf#page="+page);
						break;

						case 'ob':
						window.open("http://www.example.com/ob.pdf#page="+page);
						break;
					}
				}
			}
		],
		fillColor: 'rgba(255, 255, 50, 0.35)', // the background colour of the menu
		activeFillColor: 'rgba(255, 255, 80, 0.35)', // the colour used to indicate the selected command
		openMenuEvents: 'cxttapstart taphold', // cytoscape events that will open the menu (space separated)
		itemColor: 'white', // the colour of text in the command's content
		itemTextShadowColor: 'gray', // the text shadow colour of the command's content
		zIndex: 9999, // the z-index of the ui div
	};

	var cxtmenuApi = cy.cxtmenu(defaults);
	cy.add(blueorange.elements);
	//cy.on('cxttap',"node",function(event) {showpath(selectedNode,event.cyTarget);});
	cy.on('unselect', resetStyle);
	// cy.on('unselect', "node", function(event)
	// {
	// 	console.log("unselect");
	// });
	cy.on('select', "edge", function(event)
	{
		cy.startBatch();
		resetStyle();
		highlightEdges(event.cyTarget);
		cy.endBatch();
	});


	cy.on('select', "node", function(event)
	{
		cy.startBatch();
		selectedNode = event.cyTarget;
		resetStyle();
		highlightNodes(selectedNode);
		cy.endBatch();
	});
}