import * as sparql from "../js/utils/sparql";
import "chai/register-should";

const EXPECTED_CLASSES_MIN = 4000;
const EXPECTED_CLASSES_MAX = 20000;
const EXPECTED_INSTANCES_MIN = 60;
const EXPECTED_INSTANCES_MAX = 100;
const EXPECTED_META_CLASSES_MIN = 10;
const EXPECTED_META_CLASSES_MAX = 25;
const GRAPH_GROUP_SNIK = "http://www.snik.eu/ontology";
const GRAPH_SNIK_META = "http://www.snik.eu/ontology/meta";

describe("sparql", () => {
	describe("#sparql()", () => {
		it(`${GRAPH_GROUP_SNIK} should contain between ${EXPECTED_CLASSES_MIN} and ${EXPECTED_CLASSES_MAX} classes`, () => {
			return sparql.select("select count(?class) as ?count {?class a [rdfs:subClassOf meta:Top].}", GRAPH_GROUP_SNIK).then((bindings: Array<any>) => {
				bindings[0].should.have.property("count");
				parseInt(bindings[0].count.value).should.be.within(EXPECTED_CLASSES_MIN, EXPECTED_CLASSES_MAX);
			});
		});
		it(`${GRAPH_GROUP_SNIK} should contain between ${EXPECTED_INSTANCES_MIN} and ${EXPECTED_INSTANCES_MAX} instances`, () => {
			return sparql.select("select count(?i) as ?count {?i a ?class. ?class a [rdfs:subClassOf meta:Top].}", GRAPH_GROUP_SNIK).then((bindings: Array<any>) => {
				bindings[0].should.have.property("count");
				parseInt(bindings[0].count.value).should.be.within(EXPECTED_INSTANCES_MIN, EXPECTED_INSTANCES_MAX);
			});
		});
		it(`${GRAPH_SNIK_META} should contain between ${EXPECTED_META_CLASSES_MIN} and ${EXPECTED_META_CLASSES_MAX} classes`, () => {
			return sparql.select("select count(?class) as ?count {?class a owl:Class.}", GRAPH_SNIK_META).then((bindings: Array<any>) => {
				bindings[0].should.have.property("count");
				parseInt(bindings[0].count.value).should.be.within(EXPECTED_META_CLASSES_MIN, EXPECTED_META_CLASSES_MAX);
			});
		});
		it("should contain the snik subontology graphs", () => {
			return sparql.select("select distinct(?g) {graph ?g {?x a|rdfs:subClassOf meta:EntityType.}}").then((bindings: Array<any>) => {
				const graphs = new Set();
				for (const binding of bindings) {
					graphs.add(binding.g.value);
				}
				const expectedGraphs = new Set([
					"http://www.snik.eu/ontology/meta",
					"http://www.snik.eu/ontology/ob",
					//'http://www.snik.eu/ontology/it',
					"http://www.snik.eu/ontology/ciox",
					"http://www.snik.eu/ontology/bb",
					"http://www.snik.eu/ontology/bb2",
					"http://www.snik.eu/ontology/he",
					"http://www.snik.eu/ontology/it4it",
				]);
				graphs.should.eql(expectedGraphs);
			});
		});
		/*
      it('should not contain the test triple now', function()
      {
      return sparql.ask("ask from <http://www.snik.eu/ontology/test> {<this> <isa> <test>.}")
      .then(b=>{assert(!b,"already contains the test triple");});
    });*/
		/*
    it('should add and delete the test triple', function()
    {
      return sparql.deleteTriple("this","isa","test","http://www.snik.eu/ontology/test")
        .then(()=>{return sparql.ask("ask from <http://www.snik.eu/ontology/test> {<this> <isa> <test>.}");})
        .then(b=>{assert(!b,"still contains the test triple even after deletion");})
        .then(()=>{return sparql.addTriple("this","isa","test","http://www.snik.eu/ontology/test");})
        .then(()=>{return sparql.ask("ask from <http://www.snik.eu/ontology/test> {<this> <isa> <test>.}");})
        .then(b=>{assert(b,"does not contain the test triple after addition");})
        .then(()=>{sparql.deleteTriple("this","isa","test","http://www.snik.eu/ontology/test");}); // cleanup
    });;*/
	});

	describe("#describe()", () => {
		it("should return a turtle description of meta:Top", () => {
			sparql.describe("http://www.snik.eu/ontology/meta/Top").then((nt) => assert(nt!.includes("meta:EntityType	rdfs:subClassOf	meta:Top")));
		});
	});
});

/* to test:
function deleteResource(resource,graph)
function addLabel(s,l,tag,graph)
*/
