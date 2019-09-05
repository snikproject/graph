/**
Textual node search.
@module */
import * as graph from "./graph.js";
import * as sparql from "../sparql.js";
import * as menu from "./menu.js";
import * as NODE from "../node.js";
import * as util from "./util.js";
import * as fuse from "../fuse.js";

// disable bif:contains search because it does not even accept all non-space strings and the performance hit is negliglible
// BIF contains also breaks space insensitiveness, which we require and also check in the unit test
// const USE_BIF_CONTAINS = false;

let resultNodes = [];

/** Presents all search results from the previous search.
* @return {Boolean} Whether the search results are nonempty.
*/
function presentAll()
{
  if(resultNodes.length<1)
  {
    log.warn("All search results are only available on the SPARQL endpoint but not in the graph.");
    return false;
  }

  return true;
}

/**
 * @param  {String} query The user query.
 * @param  {Array<String>} uris An array of OWL class URIs
 * @return {Boolean} Whether the search results are nonempty.
 */
export function showSearchResults(query, uris)
{
  resultNodes = [];
  /** @type{HTMLTableElement} */
  const table = util.getElementById("tab:search-results");

  // clear leftovers from last time
  while(table.rows.length>0) {table.deleteRow(0);}

  if(uris.length===0)
  {
    util.getElementById("h2:search-results").innerHTML=`No Search Results for "${query}"`;
    return false;
  }
  if(uris.length===1)
  {
    MicroModal.close("search-results");
    graph.presentUri(uris[0]);
    return true;
  }
  if(uris.length===sparql.SPARQL_LIMIT)
  {
    util.getElementById("h2:search-results").innerHTML=`First ${sparql.SPARQL_LIMIT} Search Results for "${query}"`;
  }
  else
  {
    util.getElementById("h2:search-results").innerHTML=`${uris.length} Search Results for "${query}"`;
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
  uris.sort((a,b)=>(uriType[a]-uriType[b]));
  uris.forEach(uri=>
  {
    const row = table.insertRow();
    const locateCell = row.insertCell();
    const lodLiveCell = row.insertCell();
    // @ts-ignore
    window.presentUri=graph.presentUri;
    locateCell.innerHTML = `<a class="search-class${uriType[uri]}" href="javascript:MicroModal.close('search-results');window.presentUri('${uri}');void(0)">
		${uri.replace(sparql.SPARQL_PREFIX,"")}</a>`;
    lodLiveCell.innerHTML = `<a class="search-class0"" href="${uri}" target="_blank">Description</a>`;
  });

  const row = table.insertRow(0);
  const cell = row.insertCell();

  cell.innerHTML = "Highlight All";
  cell.addEventListener("click",()=>{MicroModal.close("search-results");graph.presentUris(uris);});

  return true;
}

/** Searches the SPARQL endpoint for classes with the given label.
Case and space insensitive when not using bif:contains. Can be used by node.js.
@return {Promise<Array<String>>} A promise with an array of class URIs.
*/
export async function search(userQuery)
{
  // prevent invalid SPARQL query and injection by keeping only alphanumeric English and German characters
  // if other languages with other characters are to be supported, extend the regular expression
  // remove space to make queries space insensitive, as people might search for URI suffixes which can be similar to the label so we get more recall
  // works in conjuction with also ignoring whitespace for labels in the SPARQL query
  // If this results in too low of a precision, the search can be made space sensitive again by changing /[\x22\x27\x5C\x0A\x0D ]/ to /[\x22\x27\x5C\x0A\x0D]/
  // and adapting the SPARQL query along with it.
  // Does not work with bif:contains.
  // to avoid injection attacks and errors, so not allowed characters are replaced to match sparul syntax
  // [156]  	STRING_LITERAL1	  ::=  	"'" ( ([^#x27#x5C#xA#xD]) | ECHAR )* "'"
  // [157]  	STRING_LITERAL2	  ::=  	'"' ( ([^#x22#x5C#xA#xD]) | ECHAR )* '"'
  // source: https://www.w3.org/TR/sparql11-query/#func-lcase
  // Hexadecimal escape sequences require a leading zero in JavaScript, see https://mathiasbynens.be/notes/javascript-escapes.
  const searchQuery = userQuery.replace(/[\x22\x27\x5C\x0A\x0D -]/g, '');
  // use this when labels are available, URIs are not searched
  const sparqlQuery = `select distinct(?s) { {?s a owl:Class.} UNION {?s a rdf:Property.}
			{?s rdfs:label ?l.} UNION {?s skos:altLabel ?l.}	filter(regex(lcase(replace(str(?l),"[ -]","")),lcase("${searchQuery}"))) } order by asc(strlen(str(?l))) limit ${sparql.SPARQL_LIMIT}`;
  log.debug(sparqlQuery);
  const bindings = await sparql.select(sparqlQuery,"http://www.snik.eu/ontology");
  return bindings.map(b=>b.s.value);
  //		`select ?s {{?s a owl:Class.} UNION {?s a rdf:Property.}.
  //filter (regex(replace(replace(str(?s),"${SPARQL_PREFIX}",""),"_"," "),"${query}","i")).}
}

/**Search the class labels and display the result to the user.
* @return {Promise<false>} false to prevent page reload triggered by submit.*/
async function showSearch(userQuery)
{
  MicroModal.show("search-results");
  const uris = await fuse.search(userQuery);
  showSearchResults(userQuery,uris);
  return false; // prevent page reload triggered by submit
}

/** Add search functionality to the text field with the "search" id. */
export function addSearch()
{
  util.getElementById("search").addEventListener("submit",(event)=>
  {
    event.preventDefault();
    // @ts-ignore
    showSearch(event.target.children.query.value);
  });
  log.debug('search initialized');
}
