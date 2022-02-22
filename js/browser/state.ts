import * as filter from "./filter";
import { menu } from "./menu";
import { VERSION } from "./util";

export const state = {
	version: VERSION,
};

export interface StateJson {
	filters;
	options;
}

/** Saves the visibility values of all filters.
 * @returns the JSON representation of the state */
export function toJSON(): StateJson {
	const json: StateJson = { filters: filter.toJSON(), options: menu.optionsToJSON() };
	Object.assign(json, state);
	return json;
}

/** Loads the visibility values and apllies it to all filters.
 * @param json - the JSON representation of the state */
export function fromJSON(json: StateJson): void {
	filter.fromJSON(json.filters);
	menu.optionsFromJSON(json.options);
}
