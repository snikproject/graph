import { vi } from "vite-plus/test";
import { fuseIndex, graphClasses, graphTriples } from "../fixtures/sparqlResponses";

/** @param query - a SPARQL query as built by the application
 * @returns the recorded response matching that query */
function responseFor(query: string): object {
	if (query.includes("?c as ?uri")) {
		return fuseIndex; // js/fuseSearch.ts
	}
	if (query.includes("?c ?p ?d")) {
		return graphTriples; // loadGraphFromSparql.ts selectTriples
	}
	if (query.includes("SELECT DISTINCT(?c)")) {
		return graphClasses; // loadGraphFromSparql.ts selectClasses
	}
	throw new Error(`No SPARQL fixture for query: ${query.slice(0, 160)}`);
}

/**
 * Replace fetch with a stub that answers SPARQL queries from recorded fixtures,
 * so that the tests are deterministic and do not need the live endpoint.
 */
export function mockSparql(): void {
	vi.stubGlobal("fetch", async (input: string | URL | Request) => {
		const match = String(input).match(/[?&]query=([^&]*)/);
		if (!match) {
			throw new Error(`Unexpected fetch without a SPARQL query: ${String(input)}`);
		}
		const body = JSON.stringify(responseFor(decodeURIComponent(match[1])));
		return new Response(body, { status: 200, headers: { "Content-Type": "application/sparql-results+json" } });
	});
}
