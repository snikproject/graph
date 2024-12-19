import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import oxlint from "vite-plugin-oxlint";

const _dirname = typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));

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
					manualChunks: { config: ["js/config/config.ts"] },
				},
			},
		},
		plugins: [oxlint()],
		test: { globals: true },
	};
};
