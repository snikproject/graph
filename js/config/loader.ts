/** Runtime configuration layer.
 * Fetches config.json (if present) and deep merges it into the configuration object, after the static defaults
 * from config.dist.ts / the ontology configs and before the GET parameters, which still have the highest priority.
 * This allows changing the configuration, such as the SPARQL endpoint, after the build step without rebuilding,
 * for example by mounting a config.json into the Docker container.
 * See https://github.com/snikproject/graph/issues/451. */
import { config } from "./config";

/** Recursively merge the properties of the source object into the target object, modifying the target in place.
 * Nested plain objects are merged, all other values, including arrays, are replaced. */
export function deepMerge(target: any, source: any): void {
	for (const key of Object.keys(source)) {
		const value = source[key];
		if (value !== null && typeof value === "object" && !Array.isArray(value)) {
			if (target[key] === null || typeof target[key] !== "object") {
				target[key] = {};
			}
			deepMerge(target[key], value);
		} else {
			target[key] = value;
		}
	}
}

/** Load config.json from the same path as the application and merge it into the configuration.
 * Does nothing when the file is missing or invalid so that the static defaults apply. */
export async function loadConfigJson(url: string = "config.json"): Promise<void> {
	let json: any;
	try {
		const response = await fetch(url);
		if (!response.ok) {
			return;
		}
		json = await response.json();
	} catch {
		return; // no config.json, for example in a fresh checkout without one or when running outside a browser
	}
	deepMerge(config, json);
}
