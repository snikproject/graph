import * as log from "./log.js";

const SPARQL_ENDPOINT = "http://www.snik.eu/sparql";
const SPARQL_GRAPH = "http://www.snik.eu/ontology";
const SPARQL_PREFIX = "http://www.snik.eu/ontology/";//problem: different prefixes for different partial ontologies
const SPARQL_LIMIT = 100;

function short(uri)
{
  return uri.replace("http://www.snik.eu/ontology/","").replace("/",":");
}

function sparql(query,graphOpt)
{
  const url = SPARQL_ENDPOINT +
  '?query=' + escape(query) +
  '&format=json'+
  (graphOpt?('&default-graph-uri=' + encodeURIComponent(graphOpt)):"");
  return fetch(url).then(response => {return response.json();})
    .then(json => {return json.results.bindings;})
    .catch(err =>alert(`Error executing SPARQL query ${query}: ${err}`));
}

function deleteResource(resource,graph)
{
  log.info(`deleting ${short(resource)} from graph ${graph}...`);
  const url = SPARQL_ENDPOINT +
  '?query=' + escape(`DELETE {?s ?p ?o} FROM <${graph}>
    {
      ?s ?p ?o.
      filter(
        ?s=<${resource}>
        OR ?p=<${resource}>
        OR ?o=<${resource}>
      )}`) +
    '&format=json';
  return fetch(url)
    .then(response => {return response.json();})
    .then(json => {return json.results.bindings;})
    .then(bindings=> {log.debug(bindings[0]["callret-0"].value);return true;})
    .catch(err =>{log.error(`Error deleting uri ${resource} from SPARQL endpoint: ${err}`);return false;});
}

/** s,p and o all need to be uris (not literal or blank node).*/
function addTriple(s,p,o,graph)
{
  log.info(`Adding triple (${short(s)}, ${short(p)}, ${short(o)}) to graph ${graph}...`);
  const query =  `INSERT DATA INTO <${graph}> {<${s}> <${p}> <${o}>.}`;
  const url = SPARQL_ENDPOINT + '?query=' +escape(query) + '&format=json';
  return fetch(url)
    .then(response => {return response.json();})
    .then(json => {return json.results.bindings;})
    .then(bindings=> {log.debug(bindings[0]["callret-0"].value);return true;})
    .catch(err =>{log.error(`Error inserting triple ${s} ${p} ${o} to graph ${graph}: ${err}`);return false;});
}

export {SPARQL_ENDPOINT,SPARQL_GRAPH,SPARQL_PREFIX,SPARQL_LIMIT,sparql,deleteResource,addTriple,short};
