import * as rdf from "../js/rdf";
import assert from "assert"; // 'assert.js' does not work for some reason, probably only works because of the transpilation to require

const shortlongs = [
	["meta:EntityType", "http://www.snik.eu/ontology/meta/EntityType"],
	["bb:Box", "http://www.snik.eu/ontology/bb/Box"],
	["bb2:Box2", "http://www.snik.eu/ontology/bb2/Box2"],
	["ob:Orb", "http://www.snik.eu/ontology/ob/Orb"],
	["he:Test", "http://www.snik.eu/ontology/he/Test"],
	["ciox:Cio", "http://www.snik.eu/ontology/ciox/Cio"],
	["it4it:SomeClass", "http://www.snik.eu/ontology/it4it/SomeClass"],
	["it:someProperty", "http://www.snik.eu/ontology/it/someProperty"],
	["skos:closeMatch", "http://www.w3.org/2004/02/skos/core#closeMatch"],
	["rdfs:label", "http://www.w3.org/2000/01/rdf-schema#label"],
	["rdf:type", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"],
];

describe("rdf", function () {
	describe("#short()", function () {
		test("should replace uris with their prefixed form", function () {
			for (const sl of shortlongs) {
				assert.equal(sl[0], rdf.short(sl[1]));
			}
		});
	});

	describe("#long()", function () {
		test("should replace prefixed uris with their long form", function () {
			for (const sl of shortlongs) {
				assert.equal(sl[1], rdf.long(sl[0]));
			}
		});
	});

	describe("#longPrefix()", function () {
		test("should return the URI expansion of the matching prefix", function () {
			assert.equal(rdf.longPrefix("http://www.snik.eu/ontology/bb/Box"), "http://www.snik.eu/ontology/bb/");
			assert.equal(rdf.longPrefix("https://example.com/Box"), null);
		});
	});

	describe("#sub()", function () {
		test("should return the subontology of path style uris", function () {
			assert.equal(rdf.sub("http://www.snik.eu/ontology/bb/Function"), "http://www.snik.eu/ontology/bb");
			assert.equal(rdf.sub("http://www.snik.eu/ontology/bb2/Function"), "http://www.snik.eu/ontology/bb2");
			assert.equal(rdf.sub("http://www.snik.eu/ontology/it4it/Function"), "http://www.snik.eu/ontology/it4it");
		});
		test("should return the subontology of fragment style uris", function () {
			assert.equal(rdf.sub("http://www.snik.eu/ontology/bb#Function"), "http://www.snik.eu/ontology/bb");
			assert.equal(rdf.sub("http://www.snik.eu/ontology/bb2#Function"), "http://www.snik.eu/ontology/bb2");
		});
		test("should return null for non-snik uris", function () {
			assert.equal(rdf.sub("https://example.com/Function"), null);
		});
	});

	describe("#short() and #long() should only replace at the start", function () {
		test("long should not replace prefix-like substrings in the middle of a string", function () {
			assert.equal(rdf.long("path/with/it:colon"), "path/with/it:colon");
		});
		test("short should not replace expansion-like substrings in the middle of a string", function () {
			assert.equal(rdf.short("http://example.com/http://www.snik.eu/ontology/bb/"), "http://example.com/http://www.snik.eu/ontology/bb/");
		});
	});
});
