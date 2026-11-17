import { mockSparql } from "./helpers/sparqlMock";
import * as layout from "../js/layout";
import { loadGraphFromSparql } from "../js/loadGraphFromSparql";
import { SNIK } from "../js/sparql";
import cytoscape from "cytoscape";
import { assert } from "vite-plus/test";

// Serve the recorded SPARQL responses so the test does not need the live endpoint.
mockSparql();

describe("cytoscape", () => {
	let cy;
	const subs = ["meta", "bb"];
	const graphs = subs.map((s) => SNIK.PREFIX + s);
	test("create empty graph", function () {
		cy = cytoscape({});
		assert(cy);
		assert(cy._private.layout === null);
	});
	test("load graph from SPARQL", async () => {
		await loadGraphFromSparql(cy, graphs);
		// exact counts against the recorded fixture (test/fixtures/graph-*.json)
		assert.equal(cy.nodes().size(), 34);
		assert.equal(cy.edges().size(), 25);
	});
	test("calculate layout", async () => {
		assert(await layout.run(cy, layout.euler, subs));
		// cose is more realistic for SNIK Graph but takes over a minute
		//assert(await layout.run(cy,layout.cose,subs));
		// use the faster grid layout
		//await layout.run(cy, layout.grid);

		const nodes = cy.nodes();
		for (let i = 0; i < nodes.size(); i++) {
			for (let j = i + 1; j < nodes.size(); j += 10) {
				assert(
					JSON.stringify(nodes[i].position()) !== JSON.stringify(nodes[j].position()),
					`2 nodes ${i} and ${j} at the same position ` + JSON.stringify(nodes[i].position())
				);
			}
		}
	});
	//test("load layout from file", function () {});
	//test("load layout from cache", function () {});
});
