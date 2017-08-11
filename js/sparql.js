import * as log from "./log.js";
//import * as rdf from "./rdf.js";

export const SPARQL_ENDPOINT = "http://www.snik.eu/sparql";
export const SPARQL_GRAPH = "http://www.snik.eu/ontology";
export const SPARQL_PREFIX = "http://www.snik.eu/ontology/";//problem: different prefixes for different partial ontologies
export const SPARQL_LIMIT = 100;
//const HISTORY_GRAPH = "http://www.snik.eu/ontology/history";
//const TEST_GRAPH = "http://www.snik.eu/ontology/history";

export function sparql(query,graphOpt)
{
  const url = SPARQL_ENDPOINT +
  '?query=' + escape(query) +
  '&format=json'+
  (graphOpt?('&default-graph-uri=' + encodeURIComponent(graphOpt)):"");
  return fetch(url).then(response => {return response.json();})
    .then(json => {return json.results.bindings;})
    .catch(err =>log.error(`Error executing SPARQL query ${query}: ${err}`));
}

export function ask(query,graphOpt)
{
  const url = SPARQL_ENDPOINT +
  '?query=' + escape(query) +
  '&format=json'+
  (graphOpt?('&default-graph-uri=' + encodeURIComponent(graphOpt)):"");
  return fetch(url).then(response => {return response.json();})
    .then(json=>{return json.boolean;});
}
/*
export function deleteResource(resource,graph)
{
  log.info(`deleting ${rdf.short(resource)} from graph ${graph}...`);
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

// Records a deletion in the history.
function recordDeleteTripleHistory(s,p,o,graph)
{
  const date = new Date();
  const dateTime = date.toISOString()+'+'+(date.getTimezoneOffset() / 60) + ":00";
  const time=new Date().getTime();
  const cs = "http://www.snik.eu/ontology/history/cs"+time;
  const rm = "http://www.snik.eu/ontology/history/rm"+time;
  const historyQuery =
  `PREFIX cs: <http://purl.org/vocab/changeset/schema#>
  INSERT DATA INTO <${HISTORY_GRAPH}>
  {
    <${cs}> a cs:ChangeSet;
    cs:creatorName "Max Mustermann";
    cs:changeReason "some reason";
    cs:subjectOfChange <${s}>;
    cs:createdDate "${dateTime}"^^xsd:dateTime;
    cs:removal <${rm}>.
    <${rm}> rdf:subject <${s}>;
    rdf:predicate <${p}>;
    rdf:object<${o}>.
  }`;
  //log.info(historyQuery);
  const historyUri = SPARQL_ENDPOINT + '?query=' +escape(historyQuery) + '&format=json';
  fetch(historyUri)
    .then(response => {return response.json();})
    .then(json => {return json.results.bindings;})
    .then(bindings=> {log.info(bindings[0]["callret-0"].value);return true;})
    .catch(err =>{log.error(`Error creating history for deletion of triple (${s}, ${p}, ${o}): ${err}`);return false;});
}

// Deletes the given triple from the SPARQL endpoint.
export function deleteTriple(s,p,o,graph)
{
  log.info(`Deleting triple (${rdf.short(s)}, ${rdf.short(p)}, ${rdf.short(o)}) from graph ${graph}...`);
  const query = `DELETE DATA FROM <${graph}> {<${s}> <${p}> <${o}>.}`;
  const url = SPARQL_ENDPOINT + '?query=' +escape(query) + '&format=json';
  return fetch(url)
    .then(response => {return response.json();})
    .then(json => {return json.results.bindings;})
    .then(bindings=> {log.debug(bindings[0]["callret-0"].value);return true;})
    .catch(err =>{log.error(`Error deleting triple (${s}, ${p}, ${o}) from graph ${graph}: ${err}`);return false;});
}

/// Deletes the given triple from the SPARQL endpoint and records the deletion in the history./
export function deleteTripleAndRecordHistory(s,p,o,graph)
{
  recordDeleteTripleHistory(s,p,o,graph);
  return deleteTriple(s,p,o,graph);
}

/// s,p and o all need to be uris (not literal or blank node)./
export function addTriple(s,p,o,graph)
{
  log.info(`Adding triple (${rdf.short(s)}, ${rdf.short(p)}, ${rdf.short(o)}) to graph ${graph}...`);
  const query = `INSERT DATA INTO <${graph}> {<${s}> <${p}> <${o}>.}`;
  const url = SPARQL_ENDPOINT + '?query=' +escape(query) + '&format=json';
  return fetch(url)
    .then(response => {return response.json();})
    .then(json => {return json.results.bindings;})
    .then(bindings=> {log.debug(bindings[0]["callret-0"].value);return true;})
    .catch(err =>{log.error(`Error inserting triple (${s}, ${p}, ${o}) to graph ${graph}: ${err}`);return false;});
}

export function undo(cs)
{
  const query = `PREFIX cs: <http://purl.org/vocab/changeset/schema#>
  SELECT ?removal ?addition ?s ?p ?o
  {
    {
      <${cs}> cs:removal ?removal.
      ?removal  rdf:subject ?s;
      rdf:predicate ?p;
      rdf:object ?o.
    } UNION
    {
      <${cs}> cs:addition ?addition.
      ?addition  rdf:subject ?s;
      rdf:predicate ?p;
      rdf:object ?o.
    }
  }`;
  sparql(query).then(bindings=>
  {
    for(const b of bindings)
    {
      const op = b.removal?addTriple:deleteTriple;
      op(b.s.value,b.p.value,b.o.value,TEST_GRAPH);
      const statement = b.removal?b.removal.value:b.addition.value;
      deleteResource(statement,HISTORY_GRAPH);
    }
    deleteResource(cs,HISTORY_GRAPH);
  }
  );
}

/// s,p and o all need to be uris (not literal or blank node)./
export function addLabel(s,l,tag,graph)
{
  log.info(`Adding triple (${rdf.short(s)}, rdfs:label, ${l}) to graph ${graph}...`);
  const query = `INSERT DATA INTO <${graph}> {<${s}> rdfs:label "${l}"@${tag}.}`;
  const url = SPARQL_ENDPOINT + '?query=' +escape(query) + '&format=json';
  return fetch(url)
    .then(response => {return response.json();})
    .then(json => {return json.results.bindings;})
    .then(bindings=> {log.debug(bindings[0]["callret-0"].value);return true;})
    .catch(err =>{log.error(`Error inserting triple (${s}, rdfs:label, ${l}@${tag}) to graph ${graph}: ${err}`);return false;});
}
*/
