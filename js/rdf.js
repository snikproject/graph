const prefixes =
[
  ["meta","http://www.snik.eu/ontology/meta/"],
  ["bb","http://www.snik.eu/ontology/bb/"],
  ["ob","http://www.snik.eu/ontology/ob/"],
  ["he","http://www.snik.eu/ontology/he/"],
  ["ciox","http://www.snik.eu/ontology/ciox/"],
  ["it","http://www.snik.eu/ontology/it/"],
  ["it4it","http://www.snik.eu/ontology/it4it/"],
  ["skos","http://www.w3.org/2004/02/skos/core#"],
  ["rdfs","http://www.w3.org/2000/01/rdf-schema#"],
];

export function short(uri)
{
  return uri.replace("http://www.snik.eu/ontology/","").replace("/",":");
}

export function long(uri)
{
  for(const prefix of prefixes) {uri=uri.replace(prefix[0]+":",prefix[1]);}
  return uri;
}
