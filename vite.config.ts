import { resolve } from "path";
import { execSync } from "child_process";
import { defineConfig } from "vite-plus";

const _dirname = import.meta.dirname;

// Git metadata is optional so Docker builds from a submodule, where .git points outside the build context, still work.
const git = (command: string): string => {
	try {
		return execSync(command, { stdio: ["ignore", "pipe", "ignore"] }).toString().trimEnd();
	} catch {
		return "unknown";
	}
};

process.env.VITE_GIT_COMMIT_DATE ||= git("git log -1 --format=%cI");
process.env.VITE_GIT_BRANCH_NAME ||= git("git rev-parse --abbrev-ref HEAD");
process.env.VITE_GIT_COMMIT_HASH ||= git("git rev-parse HEAD");
process.env.VITE_GIT_LAST_COMMIT_MESSAGE ||= git("git show -s --format=%s");

export default defineConfig({
	lint: {
		env: { browser: true, es2024: true, node: true },
		rules: {
			"no-use-before-define": "off",
			"typescript/no-use-before-define": "error",
			"typescript/no-inferrable-types": "off",
			"typescript/ban-ts-comment": "warn",
			"typescript/no-explicit-any": "off",
			"typescript/no-this-alias": "warn",
			"typescript/no-shadow": "warn",
			"typescript/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
			"typescript/consistent-type-imports": "error",
			"consistent-type-exports": "error",
			"no-shadow": "off",
			"no-console": "off",
			"no-duplicate-imports": "error",
			"dot-notation": "off",
			eqeqeq: "error",
			"import/no-default-export": "warn",
			"import/no-cycle": "off",
			"no-unneeded-ternary": "error",
			"no-unexpected-multiline": "off",
			"no-var": "error",
			"no-control-regex": "off",
			curly: "warn",
			"prefer-const": "warn",
			"class-methods-use-this": "off",
			"vite-plus/prefer-vite-plus-imports": "error",
		},
		options: { typeAware: false, typeCheck: false },
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
	},
	fmt: {
		useTabs: true,
		singleQuote: false,
		trailingComma: "es5",
		htmlWhitespaceSensitivity: "ignore",
		printWidth: 160,
		sortPackageJson: false,
		ignorePatterns: ["**/*.md", "**/*.yml", "**/*.yaml", "**/*.cff"],
	},
	staged: { "*": "vp check --fix" },
	base: "",
	// expose SPARQL_* variables to the client in addition to the VITE_* default, see config.snik.ts
	envPrefix: ["VITE_", "SPARQL_"],
	sourcemap: true,
	build: {
		// ES2025 is the declared baseline, see README.md, so don't down-level below it.
		target: "es2025",
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
});
