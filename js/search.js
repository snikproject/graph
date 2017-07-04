import * as graph from "./graph.js";
import * as sparql from "./sparql.js";

const USE_BIF_CONTAINS = false; // disable bif:contains search because it does not even accept all non-space strings and the performance hit is negliglible
var firstCumulativeSearch = true;

function hideSearchResults()
{
  document.getElementById("overlay").style.width = "0%";
}

function createFailDialog(title, text,uri)
{
  return $("<div class='dialog' title='" + title + "'><p>" + text + "</p></div>")
    .dialog({
      resizable: false,
      height:240,
      width:600,
      modal: true,
      buttons: {
        "Browse on LodView": function()
        {
          window.open(uri);
          $(this).dialog("close");
        },
        "LodLive": function()
        {
          window.open('http://en.lodlive.it/?'+uri);
          $(this).dialog("close");
        },
        "Close": function()
        {
          $(this).dialog("close");
        },
      }
    });
}

// When user selects a URI from the search candidates, this URI gets centered and highlighted.
function presentUri(uri)
{
  graph.cy.zoom(0.6);
  var nodes = graph.cy.elements().nodes().filter(`node[name= "${uri}"]`);
  if(nodes.length<1)
  {
    //alert(uri+' is only available on the SPARQL endpoint but not in the graph.');
    createFailDialog("Class not in graph",uri+' is only available on the SPARQL endpoint but not in the graph.',uri);
    //return false;
  }
  else
  {
    var node = nodes[0];
    if(document.getElementById('cumulativesearch').checked)
    {
      if(firstCumulativeSearch)
      {
        firstCumulativeSearch=false;
        graph.hideNodes(graph.cy.elements().nodes());
      }
    }
    else
    {
      graph.resetStyle();
    }
  }
  graph.setSelectedNode(node);
  graph.highlightNodes(nodes);
  hideSearchResults();
  graph.cy.center(node);
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
      graph.hideNodes(graph.cy.elements().nodes());
    }
  }
  else
  {
    graph.resetStyle();
    firstCumulativeSearch=true;
  }
  graph.highlightNodes(resultNodes,30);
  graph.cy.fit(resultNodes);
}

function showSearchResults(query, bindings)
{
  resultNodes = [];
  var table = document.getElementById("tab:searchresults");
  for(var i = 0; i < table.rows.length;)
  {
    table.deleteRow(i);
  }

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
  if(bindings.length===sparql.SPARQL_LIMIT)
  {
    document.getElementById("h2:searchresults").innerHTML=`First ${sparql.SPARQL_LIMIT} Search Results for "${query}"`;
  }
  else
  {
    document.getElementById("h2:searchresults").innerHTML=`${bindings.length} Search Results for "${query}"`;
  }

  var uris = [];

  bindings.forEach(b=>
  {
    var row = table.insertRow();
    var cell = row.insertCell(0);
    window.presentUri=presentUri;
    cell.innerHTML = `<a href="javascript:window.presentUri('${b.s.value}');void(0)">
			${b.s.value.replace(sparql.SPARQL_PREFIX,"")}</a>`;
    uris.push(b.s.value);
  });

  var row = table.insertRow(0);
  var cell = row.insertCell(0);
  window.presentAll=presentAll;
  cell.innerHTML = `<a href="javascript:window.presentAll();void(0)">
		Highlight All</a>`;

  resultNodes = graph.cy.elements().nodes().filter((node)=>
  {
    return uris.indexOf(node.data("name")) >= 0;
  });
}

function search(userQuery)
{
  // prevent invalid SPARQL query and injection by just keeping basic characters
  var searchQuery = userQuery.replace('/[^A-Z a-z0-9]/g', ''); //.split(' ')[0];
  // use this when labels are available
  let sparqlQuery;
  if(!USE_BIF_CONTAINS||searchQuery.includes(' ')) // regex is slower but we have no choice with a space
  {
    sparqlQuery = `select distinct(?s) { {?s a owl:Class.} UNION {?s a rdf:Property.}
			{?s rdfs:label ?l.} UNION {?s skos:altLabel ?l.}	filter(regex(str(?l),"${searchQuery}","i")) } limit ${sparql.SPARQL_LIMIT}`;
  }
  else // no space so we can use the faster bif:contains
  {
    sparqlQuery = `select distinct(?s) { {?s a owl:Class.} UNION {?s a rdf:Property.}
			{?s rdfs:label ?l.		?l <bif:contains> "${searchQuery}".} UNION
			{?s skos:altLabel ?l.	?l <bif:contains> "${searchQuery}".}} limit ${sparql.SPARQL_LIMIT}`;
  }
  // labels are not yet on SPARQL endpoint, so use URI in the meantime
  //	var sparql =
  //		`select ?s {{?s a owl:Class.} UNION {?s a rdf:Property.}.
  //filter (regex(replace(replace(str(?s),"${SPARQL_PREFIX}",""),"_"," "),"${query}","i")).}
  //limit ${SPARQL_LIMIT}`;
  //console.log(sparql);
  sparql.sparql(sparqlQuery).then(bindings =>
  {
    showSearchResults(searchQuery, bindings);
  });
  return false; // prevent page reload triggered by submit
}

function setFirstCumulativeSearch(value)
{
  firstCumulativeSearch=value;
}

function addSearch()
{
  document.getElementById('closelink').addEventListener("click", hideSearchResults);
  document.getElementById("search").addEventListener("submit",(event)=>
  {
    event.preventDefault();
    hideSearchResults();
    search(event.target.children.query.value);
  });
}

export default addSearch;
