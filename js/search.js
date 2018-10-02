/**
Textual node search.
@module */
import * as graph from "./graph.js";
import * as sparql from "./sparql.js";
import * as log from "./log.js";

const USE_BIF_CONTAINS = false; // disable bif:contains search because it does not even accept all non-space strings and the performance hit is negliglible
var firstCumulativeSearch = true;


/** Hides the overlay that shows the class search results. */
export function hideSearchResults()
{
  document.getElementById("overlay").style.width = "0%";
  document.getElementById("overlay").display = "none";
}

/** Notifies the user of an error.
 * @param  {String} title   title of the error message
 * @param  {String} text    text of the error message
 */
function createFailDialog(title, text,/*uri*/)
{
  log.error(`${title}: ${text}`);
  //alert(`${title}: ${text}`);
  /*
  return document.createDocumentFragment("<div class='dialog' title='" + title + "'><p>" + text + "</p></div>")
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
      },
    });
    */
}


/** When user selects a URI from the search candidates, this URI gets centered and highlighted.
* @param  {String} uri The URI of a class in the graph. */
function presentUri(uri)
{
  graph.cy.zoom(0.6);
  var nodes = graph.cy.elements().nodes().filter(`node[id= "${uri}"]`);
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
        graph.hide(graph.cy.elements().nodes());
      }
    }
    else
    {
      graph.resetStyle();
    }
  }
  //graph.setSelectedNode(node);
  graph.highlight(nodes);
  hideSearchResults();
  graph.cy.center(node);
}

var resultNodes = [];

/** Presents all search results from the previous search.
* @return {Boolean} Whether the search results are nonempty.
*/
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
      graph.hide(graph.cy.elements());
    }
  }
  else
  {
    graph.resetStyle();
    firstCumulativeSearch=true;
  }
  graph.highlight(resultNodes);
  graph.cy.fit(resultNodes);
  return true;
}

/**
 * @param  {String} query description
 * @param  {Array} uris  description
 * @return {Boolean} Whether the search results are nonempty.
 */
function showSearchResults(query, uris)
{
  resultNodes = [];
  var table = document.getElementById("tab:searchresults");
  for(var i = 0; i < table.rows.length;)
  {
    table.deleteRow(i);
  }
  document.getElementById("overlay").display = "block";
  document.getElementById("overlay").style.width = "100%";
  if(uris.size===0)
  {
    document.getElementById("h2:searchresults").innerHTML=`No Search Results for "${query}"`;
    return false;
  }
  if(uris.size===1)
  {
    presentUri([...uris][0]);
    return true;
  }
  if(uris.size===sparql.SPARQL_LIMIT)
  {
    document.getElementById("h2:searchresults").innerHTML=`First ${sparql.SPARQL_LIMIT} Search Results for "${query}"`;
  }
  else
  {
    document.getElementById("h2:searchresults").innerHTML=`${uris.size} Search Results for "${query}"`;
  }
  uris.forEach(uri=>
  {
    var row = table.insertRow();
    var cell = row.insertCell(0);
    window.presentUri=presentUri;
    cell.innerHTML = `<a href="javascript:window.presentUri('${uri}');void(0)">
		${uri.replace(sparql.SPARQL_PREFIX,"")}</a>`;
  });

  var row = table.insertRow(0);
  var cell = row.insertCell(0);
  window.presentAll=presentAll;
  cell.innerHTML = `<a href="javascript:window.presentAll();void(0)">
		Highlight All</a>`;

  resultNodes = graph.cy.elements().nodes().filter((node)=>
  {
    return uris.has(node.data("name"));
  });
  return true;
}

/** Searches the SPARQL endpoint for classes with the given label.
Case and space insensitive when not using bif:contains. Can be used by node.js. */
export function search(userQuery)
{
  // prevent invalid SPARQL query and injection by keeping only alphanumeric English and German characters
  // if other languages with other characters are to be supported, extend the regular expression
  var searchQuery = userQuery.replace(/[^A-Za-zäöüÄÖÜßéèôáà0-9]/g, ''); //.split(' ')[0];
  // use this when labels are available, URIs are not searched
  let sparqlQuery;
  if(!USE_BIF_CONTAINS||searchQuery.includes(' ')) // regex is slower than bif:contains but we have no choice with a space character
  {
    sparqlQuery = `select distinct(?s) { {?s a owl:Class.} UNION {?s a rdf:Property.}
			{?s rdfs:label ?l.} UNION {?s skos:altLabel ?l.}	filter(regex(replace(str(?l)," ",""),"${searchQuery}","i")) } order by asc(strlen(str(?l))) limit ${sparql.SPARQL_LIMIT}`;
  }
  else // no space character and bif:contains is allowed, so use it
  {
    sparqlQuery = `select distinct(?s) { {?s a owl:Class.} UNION {?s a rdf:Property.}
			{?s rdfs:label ?l.		?l <bif:contains> "${searchQuery}".} UNION
			{?s skos:altLabel ?l.	?l <bif:contains> "${searchQuery}".}} order by asc(strlen(str(?l))) limit ${sparql.SPARQL_LIMIT}`;
  }
  log.debug(sparqlQuery);
  return sparql.sparql(sparqlQuery).then(bindings=>new Set(bindings.map(b=>b.s.value)));
  //		`select ?s {{?s a owl:Class.} UNION {?s a rdf:Property.}.
  //filter (regex(replace(replace(str(?s),"${SPARQL_PREFIX}",""),"_"," "),"${query}","i")).}
}

/**Search the class labels and display the result to the user.
* @return {false} false to prevent page reload triggered by submit.*/
function showSearch(userQuery)
{
  document.getElementById("overlay").style.display= "block";
  search(userQuery).then(uris =>
  {
    showSearchResults(userQuery,uris);
  });
  return false; // prevent page reload triggered by submit
}

/** Add search functionality to the text field with the "search" id.
 *  Add a click listener to hide the search results to the element with the "closelink" id.*/
export function addSearch()
{
  document.getElementById('closelink').addEventListener("click", hideSearchResults);
  document.getElementById("search").addEventListener("submit",(event)=>
  {
    event.preventDefault();
    hideSearchResults();
    showSearch(event.target.children.query.value);
  });
}
