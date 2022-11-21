// note: only src/core is relevant if anything is at all maybe nothing is.
// https://github.com/microsoft/vscode-loader/blob/main/src/core/tsconfig.json
// code-oss-dev/src/vs/loader.js
const loader = {
	"compilerOptions": {
		"target": "es5",
		"newLine": "LF",
		"noUnusedLocals": true,
		"strictNullChecks": true,
		"outFile": "../loader.js",
		"declaration": true
	},
	"files": [
		"env.ts",
		"loaderEvents.ts",
		"utils.ts",
		"configuration.ts",
		"scriptLoader.ts",
		"moduleManager.ts",
		"main.ts"
	],
	"exclude": [
		"node_modules"
	]
}