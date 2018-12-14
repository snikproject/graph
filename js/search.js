/**
Textual node search.
@module */
import * as graph from "./graph.js";
import * as sparql from "./sparql.js";
import * as log from "./log.js";
import * as NODE from "./node.js";

// disable bif:contains search because it does not even accept all non-space strings and the performance hit is negliglible
// BIF contains also breaks space insensitiveness, which we require and also check in the unit test
const USE_BIF_CONTAINS = false;
let firstCumulativeSearch = true;

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
  const nodes = graph.cy.elements().nodes().filter(`node[id= "${uri}"]`);
  const node = nodes[0];
  if(nodes.length<1)
  {
    //alert(uri+' is only available on the SPARQL endpoint but not in the graph.');
    createFailDialog("Class not in graph",uri+' is only available on the SPARQL endpoint but not in the graph.',uri);
    return false;
  }
  else
  {
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

let resultNodes = [];

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
 * @param  {String} query The user query.
 * @param  {Set<String>} uris A set of OWL class URIs
 * @return {Boolean} Whether the search results are nonempty.
 */
function showSearchResults(query, uris)
{
  resultNodes = [];
  const table = document.getElementById("tab:searchresults");
  // clear leftovers from last time
  for(let i = 0; i < table.rows.length;)
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
  // Preprocessing: Classify URIs as (0) in graph and visible, (1) in graph and invisible and (2) not in the graph.
  const uriType = {};

  uris.forEach(uri=>
  {
    const node = graph.cy.getElementById(uri)[0];
    if(node)
    {
      uriType[uri]=0;
      if(!node.visible()) {uriType[uri]=1;}
    }
    else {uriType[uri]=2;}
  });
  const sortedUris = Array.from(uris);
  sortedUris.sort((a,b)=>(uriType[a]-uriType[b]));
  sortedUris.forEach(uri=>
  {
    const row = table.insertRow();
    const cell = row.insertCell(0);
    window.presentUri=presentUri;
    cell.innerHTML = `<a class="search-class${uriType[uri]}"" href="javascript:window.presentUri('${uri}');void(0)">
		${uri.replace(sparql.SPARQL_PREFIX,"")}</a>`;
  });

  const row = table.insertRow(0);
  const cell = row.insertCell(0);
  window.presentAll=presentAll;
  cell.innerHTML = `<a href="javascript:window.presentAll();void(0)">
		Highlight All</a>`;

  resultNodes = graph.cy.elements().nodes().filter((node)=>
  {
    return uris.has(node.data(NODE.ID));
  });
  return true;
}

/** Searches the SPARQL endpoint for classes with the given label.
Case and space insensitive when not using bif:contains. Can be used by node.js.
@return {Promise<Set>} A promise with a set of class URIs.
*/
export function search(userQuery)
{
  // prevent invalid SPARQL query and injection by keeping only alphanumeric English and German characters
  // if other languages with other characters are to be supported, extend the regular expression
  // remove space to make queries space insensitive, as people might search for URI suffixes which can be similar to the label so we get more recall
  // works in conjuction with also ignoring whitespace for labels in the SPARQL query
  // If this results in too low of a precision, the search can be made space sensitive again by changing /[\x22\x27\x5C\xA\xD ]/ to /[\x22\x27\x5C\xA\xD]/
  // and adapting the SPARQL query along with it.
  // Does not work with bif:contains.
  const searchQuery = userQuery.replace(/[\x22\x27\x5C\xA\xD ]/g, '');
  // use this when labels are available, URIs are not searched
  let sparqlQuery;
  if(!USE_BIF_CONTAINS||searchQuery.includes(' ')) // regex is slower than bif:contains but we have no choice with a space character
  {
    sparqlQuery = `select distinct(?s) { {?s a owl:Class.} UNION {?s a rdf:Property.}
			{?s rdfs:label ?l.} UNION {?s skos:altLabel ?l.}	filter(regex(lcase(replace(str(?l)," ","")),lcase("${searchQuery}"))) } order by asc(strlen(str(?l))) limit ${sparql.SPARQL_LIMIT}`;
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
