import * as layout from "../js/layout";
import loadGraphFromSparql from "../js/loadGraphFromSparql";
import { SNIK_PREFIX } from "../js/sparql";
import cytoscape from "cytoscape";
import euler from "cytoscape-euler";
import "isomorphic-fetch";
cytoscape.use(euler);
import chai from "chai";
const assert = chai.assert;

describe("cytoscape", function () {
	let cy;
	const subs = ["meta", "bb"];
	const graphs = subs.map((s) => SNIK_PREFIX + s);
	test("create empty graph", function () {
		cy = cytoscape({});
		assert(cy);
		assert(cy._private.layout === null);
	});
	test("load graph from sparql", function () {
		return loadGraphFromSparql(cy, graphs).then(() => assert.closeTo(cy.nodes().size(), 1134, 100));
	});
	test("calculate layout", function () {
		// Causes "TypeError: Cannot read property 'pos' of undefined"
		// see https://github.com/cytoscape/cytoscape.js-euler/issues/14
		//layout.run(cy,layout.euler,subs);
		// cose is more realistic for SNIK Graph but takes over a minute
		//assert(layout.run(cy,layout.cose,subs));
		// use the faster grid layout
		assert(layout.run(cy, layout.grid, subs));

		const nodes = cy.nodes();
		for (let i = 0; i < nodes.size(); i++) {
			for (let j = i + 1; j < nodes.size(); j += 10) {
				assert(
					JSON.stringify(nodes[i].position()) !== JSON.stringify(nodes[j].position()),
					"2 nodes at the same position " + JSON.stringify(nodes[i].position())
				);
			}
		}
	});
	//test("load layout from file", function () {});
	//test("load layout from cache", function () {});
});
