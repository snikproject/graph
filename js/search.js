/** When user selects a URI from the search candidates, this URI gets centered and highlighted.  */
function presentUri(uri)
{
	var nodes = cy.elements().nodes().filter(`node[name= "${uri}"]`);
	if(nodes.length<1)
	{
		alert("This search result is only available on the SPARQL endpoint but not in the graph.");
		return false;
	}
	var node = nodes[0];
	cy.center(node);
	highlightNodes(nodes)
	hideSearchResults();
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
	cy.fit(resultNodes);
	highlightNodes(resultNodes,30)
}

function showSearchResults(query, bindings)
{
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
	document.getElementById("h2:searchresults").innerHTML=`Search Results for "${query}"`;

	var table = document.getElementById("tab:searchresults");
	for(var i = 0; i < table.rows.length;) {table.deleteRow(i);}

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
	// for now use uris, so single words are not a problem
	var query = document.getElementById('query').value.replace('/[^A-Z a-z0-9]/g', ''); //.split(' ')[0];
	//console.log(query);
	// use this when labels are available
	//var sparql = 'select ?s ?l {{?s a owl:Class.} UNION {?s a rdf:Property.} ?s rdfs:label ?l. ?l <bif:contains> "' + input + '".} limit 11';
	// labels are not yet on SPARQL endpoint, so use URI in the meantime
	var sparql =
		`select ?s {{?s a owl:Class.} UNION {?s a rdf:Property.}.
filter (regex(replace(replace(str(?s),"${SPARQL_PREFIX}",""),"_"," "),"${query}")).}
limit ${SPARQL_LIMIT}`;
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