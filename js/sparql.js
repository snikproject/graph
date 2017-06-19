const SPARQL_ENDPOINT = "http://www.snik.eu/sparql";
const SPARQL_GRAPH = "http://www.snik.eu/ontology";
const SPARQL_PREFIX = "http://www.snik.eu/ontology/";//problem: different prefixes for different partial ontologies
const SPARQL_LIMIT = 100;

function sparql(query)
{
  const url = SPARQL_ENDPOINT +
 '?default-graph-uri=' + encodeURIComponent(SPARQL_GRAPH) +
 '&query=' + escape(query) +
 '&format=json';
  return fetch(url).then(response => {return response.json();})
    .then(json => {return json.results.bindings;})
    .catch(err =>alert(`Error executing SPARQL query ${query}: ${err}`));
}

export {SPARQL_ENDPOINT,SPARQL_GRAPH,SPARQL_PREFIX,SPARQL_LIMIT,sparql};
