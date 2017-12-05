/** @module */
import * as log from "./log.js";

export const SPARQL_ENDPOINT = "http://www.snik.eu/sparql";
export const SPARQL_GRAPH = "http://www.snik.eu/ontology";
export const SPARQL_PREFIX = "http://www.snik.eu/ontology/";//problem: different prefixes for different partial ontologies
export const SPARQL_LIMIT = 100;

export function sparql(query,graphOpt)
{
  const url = SPARQL_ENDPOINT +
  '?query=' + escape(query) +
  '&format=json'+
  (graphOpt?('&default-graph-uri=' + encodeURIComponent(graphOpt)):"");
  return fetch(url)
    .then(response => {return response.json();})
    .then(json => {return json.results.bindings;})
    .catch(err =>log.error(`Error executing SPARQL query ${query}: ${err}`));
}

export function ask(query,graphOpt)
{
  const url = SPARQL_ENDPOINT +
  '?query=' + escape(query) +
  '&format=json'+
  (graphOpt?('&default-graph-uri=' + encodeURIComponent(graphOpt)):"");
  return fetch(url)
    .then(response => {return response.json();})
    .then(json=>{return json.boolean;});
}
