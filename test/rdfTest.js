var assert = require('assert');
var rdf = require('../js/rdf.js');

const shortlongs =
[
  ["meta:EntityType","http://www.snik.eu/ontology/meta/EntityType"],
  ["bb:Box","http://www.snik.eu/ontology/bb/Box"],
  ["ob:Orb","http://www.snik.eu/ontology/ob/Orb"],
  ["he:Test","http://www.snik.eu/ontology/he/Test"],
  ["ciox:Cio","http://www.snik.eu/ontology/ciox/Cio"],
  ["it4it:SomeClass","http://www.snik.eu/ontology/it4it/SomeClass"],
  ["it:someProperty","http://www.snik.eu/ontology/it/someProperty"],
  ["skos:closeMatch","http://www.w3.org/2004/02/skos/core#closeMatch"],
  ["rdfs:label","http://www.w3.org/2000/01/rdf-schema#label"],
  ["rdf:type","http://www.w3.org/1999/02/22-rdf-syntax-ns#type"],
];

describe('rdf', function()
{
  describe('#short()', function()
  {
    it('should replace uris with their prefixed form', function()
    {
      for(const sl of shortlongs)
      {
        assert.equal(sl[0], rdf.short(sl[1]));
      }
    });
  });
});

describe('rdf', function()
{
  describe('#long()', function()
  {
    it('should replace prefixed uris with their long form', function()
    {
      for(const sl of shortlongs)
      {
        assert.equal(rdf.long(sl[0]), sl[1]);
      }
    });
  });
});
