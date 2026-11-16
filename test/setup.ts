/** Vitest setup: apply public/config.json to the configuration so that the tests use the same endpoint as the development server.
 * The file is optional, missing files and parse errors are ignored so that the static defaults apply. */
import { readFileSync } from "fs";
import { config } from "../js/config/config";
import { deepMerge } from "../js/config/loader";

try {
	deepMerge(config, JSON.parse(readFileSync("public/config.json", "utf8")));
} catch {
	// no public/config.json, use the defaults
}
