export default {
	sourcemap: true,
	build: {
		rollupOptions: {
			output: {
				assetFileNames: "assets/[name][extname]",
			},
		},
	},
};
