/** @module */
const prefixes = // order important! substrings of other prefixes must come later
[
  ["meta","http://www.snik.eu/ontology/meta/"],
  ["bb","http://www.snik.eu/ontology/bb/"],
  ["ob","http://www.snik.eu/ontology/ob/"],
  ["he","http://www.snik.eu/ontology/he/"],
  ["ciox","http://www.snik.eu/ontology/ciox/"],
  ["it4it","http://www.snik.eu/ontology/it4it/"],
  ["it","http://www.snik.eu/ontology/it/"],
  ["skos","http://www.w3.org/2004/02/skos/core#"],
  ["rdfs","http://www.w3.org/2000/01/rdf-schema#"],
  ["rdf","http://www.w3.org/1999/02/22-rdf-syntax-ns#"],
];

export function short(uri)
{
  for(const prefix of prefixes) {uri=uri.replace(prefix[1],prefix[0]+":");}
  return uri;
}

export function long(uri)
{
  for(const prefix of prefixes) {uri=uri.replace(prefix[0]+":",prefix[1]);}
  return uri;
}
