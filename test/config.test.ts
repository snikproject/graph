/** Tests for the runtime configuration layer.*/
import { describe, it, expect, vi, afterEach } from "vitest";
import { config } from "../js/config/config";
import { deepMerge, loadConfigJson } from "../js/config/loader";

describe("config", () => {
	const defaultEndpoint = config.ontology.sparql.endpoint;

	afterEach(() => {
		vi.unstubAllGlobals();
		config.ontology.sparql.endpoint = defaultEndpoint;
	});

	describe("#deepMerge()", () => {
		it("should overwrite scalar values and merge nested objects", () => {
			const target = { a: 1, nested: { x: 1, y: 2 }, keep: "yes" };
			deepMerge(target, { a: 2, nested: { y: 3 }, added: { deep: true } });
			expect(target).toEqual({ a: 2, nested: { x: 1, y: 3 }, keep: "yes", added: { deep: true } });
		});

		it("should replace arrays wholesale instead of merging them", () => {
			const target = { list: [1, 2, 3] };
			deepMerge(target, { list: [9] });
			expect(target.list).toEqual([9]);
		});

		it("should create missing intermediate objects", () => {
			const target: any = {};
			deepMerge(target, { ontology: { sparql: { endpoint: "http://example.org/sparql" } } });
			expect(target.ontology.sparql.endpoint).toBe("http://example.org/sparql");
		});
	});

	describe("#loadConfigJson()", () => {
		it("should merge a fetched config.json into the configuration", async () => {
			const instancesBefore = config.ontology.sparql.instances;
			vi.stubGlobal(
				"fetch",
				vi.fn(async () => ({ ok: true, json: async () => ({ ontology: { sparql: { endpoint: "http://example.org/sparql" } } }) }))
			);
			await loadConfigJson("config.json");
			expect(config.ontology.sparql.endpoint).toBe("http://example.org/sparql");
			expect(config.ontology.sparql.instances).toBe(instancesBefore); // unspecified keys keep their values
		});

		it("should keep the defaults when config.json is missing", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn(async () => ({ ok: false, json: async () => ({}) }))
			);
			await loadConfigJson("config.json");
			expect(config.ontology.sparql.endpoint).toBe(defaultEndpoint);
		});

		it("should keep the defaults when fetching throws", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn(async () => {
					throw new TypeError("Failed to fetch");
				})
			);
			await loadConfigJson("config.json");
			expect(config.ontology.sparql.endpoint).toBe(defaultEndpoint);
		});
	});
});
