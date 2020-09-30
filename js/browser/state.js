/** @module */
import * as filter from "./filter.js";
import {menu} from "./menu.js";

export const state =
{
  "version": "1.6.0",
};

/** Saves the visibility values of all filters.*/
export function toJSON()
{
  const json = {};
  json.filters = filter.toJSON();
  json.options = menu.optionsToJSON();
  return json;
}

/** Loads the visibility values and apllies it to all filters.*/
export function fromJSON(json)
{
  filter.fromJSON(json.filters);
  menu.optionsFromJSON(json.options);
}
