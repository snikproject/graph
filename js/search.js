var firstCumulativeSearch = true;

/** When user selects a URI from the search candidates, this URI gets centered and highlighted.  */
function presentUri(uri)
{
	cy.zoom(0.6);
	var nodes = cy.elements().nodes().filter(`node[name= "${uri}"]`);
	if(nodes.length<1)
	{
		alert("This search result is only available on the SPARQL endpoint but not in the graph.");
		return false;
	}
	var node = nodes[0];
	if(document.getElementById('cumulativesearch').checked)
	{
		if(firstCumulativeSearch)
		{
			firstCumulativeSearch=false;
			hideNodes(cy.elements().nodes());
		}
	}
	else
	{
		resetStyle();
	}
	selectedNode = node;
	highlightNodes(nodes)
	hideSearchResults();
	cy.center(node);
}

var resultNodes = [];

function presentAll()
{
	if(resultNodes.length<1)
	{
		hideSearchResults();
		alert("All search results are only available on the SPARQL endpoint but not in the graph.");
		return false;
	}
	hideSearchResults();
	if(document.getElementById('cumulativesearch').checked)
	{
		if(firstCumulativeSearch)
		{
			firstCumulativeSearch=false;
			hideNodes(cy.elements().nodes());
		}
	}
	else
	{
		resetStyle();
		firstCumulativeSearch=true;
	}
	highlightNodes(resultNodes,30);
	cy.fit(resultNodes);
}

function showSearchResults(query, bindings)
{
	resultNodes = [];
	var table = document.getElementById("tab:searchresults");
	for(var i = 0; i < table.rows.length;) {table.deleteRow(i);}

	document.getElementById("overlay").style.width = "100%";

	if(bindings.length===0)
	{
		document.getElementById("h2:searchresults").innerHTML=`No Search Results for "${query}"`;
		return false;
	}
	if(bindings.length===1)
	{
		presentUri(bindings[0].s.value);
		return true;
	}
	if(bindings.length===SPARQL_LIMIT)
	{
		document.getElementById("h2:searchresults").innerHTML=`First ${SPARQL_LIMIT} Search Results for "${query}"`;
	} else
	{
		document.getElementById("h2:searchresults").innerHTML=`${bindings.length} Search Results for "${query}"`;
	}

	var uris = [];

	bindings.forEach(b=>
	{
		var row = table.insertRow();
		var cell = row.insertCell(0);
		cell.innerHTML = `<a href="javascript:presentUri('${b.s.value}');void(0)">
											${b.s.value.replace(SPARQL_PREFIX,"")}</a>`;
		uris.push(b.s.value);
	});

	var row = table.insertRow(0);
	var cell = row.insertCell(0);
	cell.innerHTML = `<a href="javascript:presentAll();void(0)">
										Highlight All</a>`;

	resultNodes = cy.elements().nodes().filter(
		function() {return uris.indexOf(this.data("name")) >= 0;});

}

function hideSearchResults() {document.getElementById("overlay").style.width = "0%";}

$('#search').submit(function()
{
	// prevent invalid SPARQL query, make sure by just keeping basic characters
	// bif:contains only works with a single word
	var query = document.getElementById('query').value.replace('/[^A-Z a-z0-9]/g', ''); //.split(' ')[0];
	//console.log(query);
	// use this when labels are available
	var sparql;
	if(query.includes(' ')) // regex is slower but we have no choice with a space
	{
		sparql = `select ?s ?l { {?s a owl:Class.} UNION {?s a rdf:Property.}
			{?s rdfs:label ?l.} UNION {?s skos:altLabel ?l.}	filter(regex(str(?l),"${query}","i")) } limit ${SPARQL_LIMIT}`;
	} else // no space so we can use the faster bif:contains
	{
		sparql = `select ?s ?l { {?s a owl:Class.} UNION {?s a rdf:Property.}
			{?s rdfs:label ?l.		?l <bif:contains> "${query}".} UNION
			{?s skos:altLabel ?l.	?l <bif:contains> "${query}".}} limit ${SPARQL_LIMIT}`;
	}
	console.log(sparql);
	// labels are not yet on SPARQL endpoint, so use URI in the meantime
	//	var sparql =
	//		`select ?s {{?s a owl:Class.} UNION {?s a rdf:Property.}.
	//filter (regex(replace(replace(str(?s),"${SPARQL_PREFIX}",""),"_"," "),"${query}","i")).}
	//limit ${SPARQL_LIMIT}`;
	//console.log(sparql);
	var http = SPARQL_ENDPOINT +
		'?default-graph-uri=' + encodeURIComponent(SPARQL_GRAPH) +
		'&query=' + escape(sparql) +
		'&format=json';
	//console.log(http);
	$.getJSON(http, function(data)
	{
		//console.log(data.results.bindings.length+" results");
		showSearchResults(query, data.results.bindings);
	}).fail(function(jqXHR, textStatus, errorThrown)
	{
		alert('getJSON request failed! ' + textStatus);
	});
	return false;
});
