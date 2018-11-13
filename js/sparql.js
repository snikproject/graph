/**
Functions for querying the SNIK SPARQL endpoint.
@module */
import * as log from "./log.js";

export const SPARQL_ENDPOINT = "http://www.snik.eu/sparql";
export const SPARQL_GRAPH = "http://www.snik.eu/ontology";
export const SPARQL_PREFIX = "http://www.snik.eu/ontology/";//problem: different prefixes for different partial ontologies
export const SPARQL_LIMIT = 100;

/** Query public SNIK SPARQL endpoint.
Intended for SELECT queries, DESCRIBE may also be possible but not tested.
ASK queries should also work but better use {@link ask} instead as it is more convenient.
{@param query} A valid SPARQL query.
{@param graphOpt} An optional SPARQL graph.
*/
export function sparql(query,graphOpt)
{
  if (!graphOpt){ graphOpt = SPARQL_GRAPH; }//to ensure that dbpedia matches are not shown
  const url = SPARQL_ENDPOINT +
  '?query=' + encodeURIComponent(query) +
  '&format=json'+
  (graphOpt?('&default-graph-uri=' + encodeURIComponent(graphOpt)):"");
  return fetch(url)
    .then(response => {return response.json();})
    .then(json => {return json.results.bindings;})
    .catch(err =>log.error(`Error executing SPARQL query ${query}: ${err}`));
}

/** Query public SNIK SPARQL endpoint with an ASK (boolean) query.
{@param query} A valid SPARQL ask query.
{@param graphOpt} An optional SPARQL graph.
*/
export function ask(query,graphOpt)
{
  if (!graphOpt){ graphOpt = SPARQL_GRAPH; }//to ensure that dbpedia matches are not shown
  const url = SPARQL_ENDPOINT +
  '?query=' + encodeURIComponent(query) +
  '&format=json'+
  (graphOpt?('&default-graph-uri=' + encodeURIComponent(graphOpt)):"");
  return fetch(url)
    .then(response => {return response.json();})
    .then(json=>{return json.boolean;});
}
