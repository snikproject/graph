import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const _dirname = typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));

export default {
	sourcemap: true,
	build: {
		rollupOptions: {
			input: {
				main: resolve(_dirname, "index.html"),
				contribute: resolve(_dirname, "html/contribute.html"),
				layout: resolve(_dirname, "html/layoutHelp.html"),
				manual: resolve(_dirname, "html/manual.html"),
				troubleshooting: resolve(_dirname, "html/troubleshooting.html"),
			},
			output: {
				assetFileNames: "assets/[name][extname]",
			},
		},
	},
	test: { globals: true },
};
