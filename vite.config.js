import { resolve, dirname } from "path";
import { copyFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import oxlint from "vite-plugin-oxlint";

const _dirname = typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));

/** Deploy an optional config.json from the repository root: serve it in development and copy it into dist on build,
 * so that the runtime configuration file is fetched next to index.html in both environments. */
function configJson() {
	const file = resolve(_dirname, "config.json");
	return {
		name: "config-json",
		configureServer(server) {
			// Vite does not serve arbitrary root files, so serve config.json explicitly and with the correct MIME type.
			server.middlewares.use((req, res, next) => {
				if (new URL(req.url, "http://localhost").pathname !== "/config.json") {
					return next();
				}
				try {
					res.setHeader("Content-Type", "application/json; charset=utf-8");
					res.end(readFileSync(file));
				} catch {
					res.statusCode = 404;
					res.end();
				}
			});
		},
		closeBundle() {
			try {
				copyFileSync(file, resolve(_dirname, "dist/config.json"));
			} catch {
				// no config.json, nothing to deploy
			}
		},
	};
}

export default (_) => {
	const commitDate = execSync("git log -1 --format=%cI").toString().trimEnd();
	const branchName = execSync("git rev-parse --abbrev-ref HEAD").toString().trimEnd();
	const commitHash = execSync("git rev-parse HEAD").toString().trimEnd();
	const lastCommitMessage = execSync("git show -s --format=%s").toString().trimEnd();

	process.env.VITE_GIT_COMMIT_DATE = commitDate;
	process.env.VITE_GIT_BRANCH_NAME = branchName;
	process.env.VITE_GIT_COMMIT_HASH = commitHash;
	process.env.VITE_GIT_LAST_COMMIT_MESSAGE = lastCommitMessage;
	return {
		base: "",
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
		plugins: [oxlint(), configJson()],
		test: { globals: true, setupFiles: ["test/setup.ts"] },
	};
};
