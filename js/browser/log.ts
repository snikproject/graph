import { config } from "../config/config";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import log from "loglevel";

/** Record log statements and show some to the user via overlays. */
export function initLog(): void {
	const notyf = new Notyf({
		duration: 10000,
		types: [
			{ type: "warn", backgroundColor: "orange", icon: { className: "material-icons", tagName: "i", text: "warning" } },
			{ type: "info", backgroundColor: "green", icon: { className: "material-icons", tagName: "i", text: "info" } },
			{ type: "debug", backgroundColor: "blue", icon: { className: "material-icons", tagName: "i", text: "debug" } },
			{ type: "trace", backgroundColor: "darkgray", icon: { className: "material-icons", tagName: "i", text: "trace" } },
		],
	});

	log.setLevel(config.logLevelConsole);
	// initialize the log memory so that it is accessible even before the first log statement, e.g. for the bug report
	log["logs"] = [];
	const levels = ["error", "warn", "info", "debug", "trace"]; // no point in decorating silent
	const value = { silent: 0, error: 1, warn: 2, info: 3, debug: 4, trace: 5 };
	// wrap the loglevel functions in a "decorator" that adds logging to memory and to display
	for (const level of levels) {
		const tmp = log[level]; // save that particular original logging function of the loglevel library
		log[level] = (
			...args: any[] // overwrite that function with a new function
		) => {
			tmp(...args); // execute the saved original function, which writes to console
			// loglevel accepts additional arguments, such as exceptions or objects, which are lost otherwise
			const message = args.map((arg) => (typeof arg === "string" ? arg : String(arg))).join(" ");
			if (value[level] <= value[config.logLevelMemory]) {
				if (!log["logs"]) {
					log["logs"] = [];
				}
				log["logs"].push(message);
			}
			if (value[level] <= value[config.logLevelDisplay]) {
				notyf.open({ type: level, message: message });
			}
		};
	}
}
