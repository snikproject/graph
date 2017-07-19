import * as sparql from "../js/sparql.js";
import chai from 'chai';
chai.should();
const assert = chai.assert;

describe('sparql', function()
{
  describe('#sparql()', function()
  {
    it('endpoint should contain between 4000 and 10000 classes', function()
    {
      return sparql.sparql("select count(?class) as ?count {?class a owl:Class}")
        .then(bindings=>
        {
          bindings[0].should.have.property("count");
          parseInt(bindings[0].count.value).should.be.within(4000,10000);
        }
        );
    });
    it('should contain the snik subontology graphs', function()
    {
      return sparql.sparql("select distinct(?g) {graph ?g {?class a owl:Class.}}")
        .then(bindings=>
        {
          const graphs = new Set();
          for(const binding of bindings) {graphs.add(binding.g.value);}
          const expectedGraphs = [
            'http://www.snik.eu/ontology/meta',
            'http://www.snik.eu/ontology/ob',
            'http://www.snik.eu/ontology/it',
            'http://www.snik.eu/ontology/ciox',
            'http://www.snik.eu/ontology/bb',
            'http://www.snik.eu/ontology/he',
            'http://www.snik.eu/ontology/it4it'];
          const union = new Set([...graphs, expectedGraphs]);
          const difference = new Set(expectedGraphs.filter(x => !graphs.has(x)));
          assert.deepEqual([...difference],[]);
        }
        );
    });
    /*
      it('should not contain the test triple now', function()
      {
      return sparql.ask("ask from <http://www.snik.eu/ontology/test> {<this> <isa> <test>.}")
      .then(b=>{assert(!b,"already contains the test triple");});
    });*/
    it('should add and delete the test triple', function()
    {
      return sparql.deleteTriple("this","isa","test","http://www.snik.eu/ontology/test")
        .then(()=>{return sparql.ask("ask from <http://www.snik.eu/ontology/test> {<this> <isa> <test>.}");})
        .then(b=>{assert(!b,"still contains the test triple even after deletion");})
        .then(()=>{return sparql.addTriple("this","isa","test","http://www.snik.eu/ontology/test");})
        .then(()=>{return sparql.ask("ask from <http://www.snik.eu/ontology/test> {<this> <isa> <test>.}");})
        .then(b=>{assert(b,"does not contain the test triple after addition");})
        .then(()=>{sparql.deleteTriple("this","isa","test","http://www.snik.eu/ontology/test");}); // cleanup
    });
  });
});

/* to test:
function deleteResource(resource,graph)
function addTriple(s,p,o,graph)
function addLabel(s,l,tag,graph)
*/
