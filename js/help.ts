import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import "../css/tippy.css";
import log from "loglevel";
import { flatHelp } from "./helpData";

export { help, flatHelp } from "./helpData";

/** Add event listeners for popups. */
export function initHelp(): void {
	const placement = "right-end";
	const theme = "reddark";
	for (const key in flatHelp) {
		const value = flatHelp[key];
		if (typeof value !== "string") {
			console.error("value " + value + " for key " + key + " not a string");
		}
		const ele = document.getElementById(key);
		if (ele) {
			tippy("#" + key, { content: value, placement, theme });
		} else {
			const selector = `[data-i18n="${key}"]`;
			const eles = document.querySelectorAll(selector);
			if (eles.length > 0) {
				tippy(selector, { content: value, placement, theme });
			} else {
				log.trace(`tooltip init: found none of #${key} and [data-i18n="${key}"]`);
			}
		}
	}
}
