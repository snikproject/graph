import "vite-plus/client";
import "vite-plus/test/globals";
import type jQuery from "jquery";

declare global {
	//const log: log.RootLogger & { logs: Array<string> };
	const JQuery: typeof jQuery;
}
