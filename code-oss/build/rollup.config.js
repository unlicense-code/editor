const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const somePath = join(__dirname, '../some-dir-or-some-file')

// code-oss-dev/src/vs/editor/editor.main.ts
const tsconfigMonaco = { monaco: {
	"extends": "./tsconfig.base.json",
	"compilerOptions": {
		"noEmit": true,
		"types": [
			"trusted-types",
			"wicg-file-system-access"
		],
		"paths": {},
		"module": "amd",
		"moduleResolution": "classic",
		"removeComments": false,
		"preserveConstEnums": true,
		"target": "es6",
		"sourceMap": false,
		"declaration": true
	},
	"include": [
		"typings/require.d.ts",
		"typings/thenable.d.ts",
		"vs/loader.d.ts",
		"vs/monaco.d.ts",
		"vs/editor/*",
		"vs/base/common/*",
		"vs/base/browser/*",
		"vs/platform/*/common/*",
		"vs/platform/*/browser/*"
	],
	"exclude": [
		"node_modules/*",
		"vs/platform/files/browser/htmlFileSystemProvider.ts",
		"vs/platform/files/browser/webFileSystemAccess.ts",
		"vs/platform/telemetry/*",
		"vs/platform/assignment/*"
	]
} };

const packageJsonWrapper = {
	"name":"overrides",
	"private":"true",
	"version":"0.0.0-pre.0",
	"workspaces":[
	  "./code",
	  "./code-oss-dev",
	  "./deps/*"],
	"overrides": {
		"typescript":"^5.0.0-dev.20221108",
		"xterm":"$xterm",
		"@unlicensed/code": {"xterm":"$xterm"},"vscode":{"xterm":"$xterm"}},
	"description":"The Unlicense","main":"modules/build/build.js",
	"scripts":{"test":"echo \"Error: no test specified\" && exit 1"},
	"repository":{"type":"git",
	"url":"git+https://github.com/lemanschik/vscode-build.git"},
	"author":"",
	"license":"The Unlicense",
	"bugs":{"url":"https://github.com/lemanschik/vscode-build/issues"},
	"homepage":"https://github.com/lemanschik/vscode-build#readme",
	"devDependencies":{
	  "xterm":"^5.1.0-beta.62",
	  "xterm-addon-canvas":"^0.3.0-beta.26",
	  "xterm-addon-unicode11":"^0.5.0-beta.5",
	  "xterm-addon-webgl":"^0.14.0-beta.39",
	  "xterm-headless":"^5.1.0-beta.62"
	}
}

const tsconfigCodeOss = {
	"include": [
		"./git_src/src/typings",
		"./git_src/src/vs",
		"./git_src/src/vscode-dts/vscode.proposed.*.d.ts",
		"./git_src/src/vscode-dts/vscode.d.ts"
	],
  "compilerOptions": {
    "outDir": "./",
    "baseUrl": "../code-oss-dev/src",
		"paths": {
			"vs/*": [
				"./vs/*"
			]
		},
		"rootDir": "git_src/src",
		// base
 		"module": "ESNext",
		"target": "ESNext",
    "moduleResolution": "node",
    "experimentalDecorators": true,
		"noImplicitReturns": true,
		"noImplicitOverride": true,
		"noUnusedLocals": true,
		"allowUnreachableCode": false,
		"strict": true,
		"exactOptionalPropertyTypes": false,
		"useUnknownInCatchVariables": false,
		"forceConsistentCasingInFileNames": true,
    // tsconfig.
    "composite": true,
    "declarations": "true",
    "removeComments": false,
		"preserveConstEnums": true,
		"sourceMap": false,
		"noEmit": true,
		"lib": [
			"ESNext",
			"DOM",
			"DOM.Iterable",
			"WebWorker.ImportScripts"
		],
		"types": [
			"keytar",
			"mocha",
			"semver",
			"sinon",
			"winreg",
			"trusted-types", // npm i -D @types/trusted-types
			"wicg-file-system-access"
		],
		"plugins": [
			{
				"name": "tsec",
				"exemptionConfig": "../code-oss-dev/src/tsec.exemptions.json"
			}
		]
	},
	"exclude": [] // Else we can not build in ../ gets auto excluded
}


export const tsconfigReferences = { "compilerOptions": { "noEmit": true, "composite": true, "module": "ESNext", "lib": ["ESNext"], "target": "ESNext", "allowJs": true },
"references": [
	//find code-oss-dev -type f -iname "tsconfig.*json"
	
	// { "path": "git_src/build/tsconfig.build.json" },
	// { "path": "git_src/build/tsconfig.json" },
	// { "path": "git_src/test/monaco/tsconfig.json" },
	// { "path": "git_src/test/smoke/tsconfig.json" },
	// { "path": "git_src/test/automation/tsconfig.json" },
	// { "path": "git_src/test/integration/browser/tsconfig.json" },
	
	{ "path": "git_src/extensions/tsconfig.base.json" },
	{ "path": "git_src/extensions/github/tsconfig.json" },
	{ "path": "git_src/extensions/typescript-language-features/web/tsconfig.json" },
	{ "path": "git_src/extensions/typescript-language-features/schemas/tsconfig.schema.json" },
	{ "path": "git_src/extensions/typescript-language-features/tsconfig.json" },
	{ "path": "git_src/extensions/typescript-language-features/test-workspace/tsconfig.json" },
	{ "path": "git_src/extensions/vscode-test-resolver/tsconfig.json" },
	{ "path": "git_src/extensions/gulp/tsconfig.json" },
	{ "path": "git_src/extensions/configuration-editing/build/tsconfig.json" },
	{ "path": "git_src/extensions/configuration-editing/tsconfig.json" },
	{ "path": "git_src/extensions/git-base/tsconfig.json" },
	{ "path": "git_src/extensions/merge-conflict/tsconfig.json" },
	{ "path": "git_src/extensions/json-language-features/client/tsconfig.json" },
	{ "path": "git_src/extensions/json-language-features/server/tsconfig.json" },
	{ "path": "git_src/extensions/extension-editing/tsconfig.json" },
	{ "path": "git_src/extensions/html-language-features/client/tsconfig.json" },
	{ "path": "git_src/extensions/html-language-features/server/tsconfig.json" },
	{ "path": "git_src/extensions/search-result/tsconfig.json" },
	{ "path": "git_src/extensions/ipynb/tsconfig.json" },
	{ "path": "git_src/extensions/debug-server-ready/tsconfig.json" },
	{ "path": "git_src/extensions/php-language-features/tsconfig.json" },
	{ "path": "git_src/extensions/css-language-features/client/tsconfig.json" },
	{ "path": "git_src/extensions/css-language-features/server/tsconfig.json" },
	{ "path": "git_src/extensions/npm/tsconfig.json" },
	{ "path": "git_src/extensions/markdown-language-features/notebook/tsconfig.json" },
	{ "path": "git_src/extensions/markdown-language-features/preview-src/tsconfig.json" },
	{ "path": "git_src/extensions/markdown-language-features/tsconfig.json" },
	{ "path": "git_src/extensions/markdown-language-features/tsconfig.browser.json" },
	{ "path": "git_src/extensions/markdown-language-features/server/tsconfig.json" },
	{ "path": "git_src/extensions/debug-auto-launch/tsconfig.json" },
	{ "path": "git_src/extensions/media-preview/tsconfig.json" },
	{ "path": "git_src/extensions/emmet/tsconfig.json" },
	{ "path": "git_src/extensions/markdown-math/notebook/tsconfig.json" },
	{ "path": "git_src/extensions/markdown-math/tsconfig.json" },
	{ "path": "git_src/extensions/vscode-api-tests/tsconfig.json" },
	{ "path": "git_src/extensions/vscode-colorize-tests/tsconfig.json" },
	{ "path": "git_src/extensions/github-authentication/tsconfig.json" },
	{ "path": "git_src/extensions/microsoft-authentication/tsconfig.json" },
	{ "path": "git_src/extensions/simple-browser/preview-src/tsconfig.json" },
	{ "path": "git_src/extensions/simple-browser/tsconfig.json" },
	{ "path": "git_src/extensions/git/tsconfig.json" },
	{ "path": "git_src/extensions/notebook-renderers/tsconfig.json" },
	{ "path": "git_src/extensions/references-view/tsconfig.json" },
	{ "path": "git_src/extensions/jake/tsconfig.json" },
	{ "path": "git_src/extensions/grunt/tsconfig.json" },
	{ "path": "git_src/.eslintplugin/tsconfig.json" },
	{ "path": "git_src/src/tsconfig.base.json" },
	{ "path": "git_src/src/tsconfig.tsec.json" },
	{ "path": "git_src/src/tsconfig.vscode-proposed-dts.json" },
	{ "path": "git_src/src/tsconfig.json" },
	{ "path": "git_src/src/tsconfig.monaco.json" },
	{ "path": "git_src/src/tsconfig.vscode-dts.json" },
]
}

const allPackages = `git_src/remote/web/package.json
git_src/remote/package.json
git_src/build/monaco/package.json
git_src/build/npm/gyp/package.json
git_src/build/builtin/package.json
git_src/build/package.json
git_src/test/monaco/package.json
git_src/test/smoke/package.json
git_src/test/leaks/package.json
git_src/test/automation/package.json
git_src/test/integration/browser/package.json
git_src/package.json
git_src/extensions/github/package.json
git_src/extensions/github/package.nls.json
git_src/extensions/html/package.json
git_src/extensions/html/package.nls.json
git_src/extensions/typescript-language-features/schemas/package.schema.json
git_src/extensions/typescript-language-features/package.json
git_src/extensions/typescript-language-features/package.nls.json
git_src/extensions/theme-kimbie-dark/package.json
git_src/extensions/theme-kimbie-dark/package.nls.json
git_src/extensions/ruby/package.json
git_src/extensions/ruby/package.nls.json
git_src/extensions/handlebars/package.json
git_src/extensions/handlebars/package.nls.json
git_src/extensions/vscode-test-resolver/package.json
git_src/extensions/gulp/package.json
git_src/extensions/gulp/package.nls.json
git_src/extensions/objective-c/package.json
git_src/extensions/objective-c/package.nls.json
git_src/extensions/configuration-editing/package.json
git_src/extensions/configuration-editing/package.nls.json
git_src/extensions/diff/package.json
git_src/extensions/diff/package.nls.json
git_src/extensions/typescript-basics/package.json
git_src/extensions/typescript-basics/package.nls.json
git_src/extensions/sql/package.json
git_src/extensions/sql/package.nls.json
git_src/extensions/r/package.json
git_src/extensions/r/package.nls.json
git_src/extensions/theme-abyss/package.json
git_src/extensions/theme-abyss/package.nls.json
git_src/extensions/log/package.json
git_src/extensions/log/package.nls.json
git_src/extensions/php/package.json
git_src/extensions/php/package.nls.json
git_src/extensions/git-base/package.json
git_src/extensions/git-base/package.nls.json
git_src/extensions/merge-conflict/package.json
git_src/extensions/merge-conflict/package.nls.json
git_src/extensions/cpp/package.json
git_src/extensions/cpp/package.nls.json
git_src/extensions/vb/package.json
git_src/extensions/vb/package.nls.json
git_src/extensions/pug/package.json
git_src/extensions/pug/package.nls.json
git_src/extensions/json-language-features/package.json
git_src/extensions/json-language-features/package.nls.json
git_src/extensions/json-language-features/server/package.json
git_src/extensions/extension-editing/package.json
git_src/extensions/extension-editing/package.nls.json
git_src/extensions/dart/package.json
git_src/extensions/dart/package.nls.json
git_src/extensions/fsharp/package.json
git_src/extensions/fsharp/package.nls.json
git_src/extensions/powershell/package.json
git_src/extensions/powershell/package.nls.json
git_src/extensions/html-language-features/schemas/package.schema.json
git_src/extensions/html-language-features/package.json
git_src/extensions/html-language-features/package.nls.json
git_src/extensions/html-language-features/server/package.json
git_src/extensions/search-result/package.json
git_src/extensions/search-result/package.nls.json
git_src/extensions/ipynb/package.json
git_src/extensions/ipynb/package.nls.json
git_src/extensions/theme-monokai/package.json
git_src/extensions/theme-monokai/package.nls.json
git_src/extensions/xml/package.json
git_src/extensions/xml/package.nls.json
git_src/extensions/debug-server-ready/package.json
git_src/extensions/debug-server-ready/package.nls.json
git_src/extensions/php-language-features/package.json
git_src/extensions/php-language-features/package.nls.json
git_src/extensions/clojure/package.json
git_src/extensions/clojure/package.nls.json
git_src/extensions/rust/package.json
git_src/extensions/rust/package.nls.json
git_src/extensions/yaml/package.json
git_src/extensions/yaml/package.nls.json
git_src/extensions/theme-red/package.json
git_src/extensions/theme-red/package.nls.json
git_src/extensions/restructuredtext/package.json
git_src/extensions/restructuredtext/package.nls.json
git_src/extensions/csharp/package.json
git_src/extensions/csharp/package.nls.json
git_src/extensions/css-language-features/schemas/package.schema.json
git_src/extensions/css-language-features/package.json
git_src/extensions/css-language-features/package.nls.json
git_src/extensions/css-language-features/server/package.json
git_src/extensions/npm/package.json
git_src/extensions/npm/package.nls.json
git_src/extensions/java/package.json
git_src/extensions/java/package.nls.json
git_src/extensions/shaderlab/package.json
git_src/extensions/shaderlab/package.nls.json
git_src/extensions/go/package.json
git_src/extensions/go/package.nls.json
git_src/extensions/docker/package.json
git_src/extensions/docker/package.nls.json
git_src/extensions/markdown-language-features/schemas/package.schema.json
git_src/extensions/markdown-language-features/package.json
git_src/extensions/markdown-language-features/package.nls.json
git_src/extensions/markdown-language-features/server/package.json
git_src/extensions/theme-seti/package.json
git_src/extensions/theme-seti/package.nls.json
git_src/extensions/theme-solarized-dark/package.json
git_src/extensions/theme-solarized-dark/package.nls.json
git_src/extensions/debug-auto-launch/package.json
git_src/extensions/debug-auto-launch/package.nls.json
git_src/extensions/media-preview/package.json
git_src/extensions/media-preview/package.nls.json
git_src/extensions/hlsl/package.json
git_src/extensions/hlsl/package.nls.json
git_src/extensions/emmet/package.json
git_src/extensions/emmet/package.nls.json
git_src/extensions/make/package.json
git_src/extensions/make/package.nls.json
git_src/extensions/markdown-math/package.json
git_src/extensions/markdown-math/package.nls.json
git_src/extensions/latex/package.json
git_src/extensions/latex/package.nls.json
git_src/extensions/coffeescript/package.json
git_src/extensions/coffeescript/package.nls.json
git_src/extensions/vscode-api-tests/package.json
git_src/extensions/vscode-colorize-tests/package.json
git_src/extensions/package.json
git_src/extensions/github-authentication/package.json
git_src/extensions/github-authentication/package.nls.json
git_src/extensions/less/package.json
git_src/extensions/less/package.nls.json
git_src/extensions/swift/package.json
git_src/extensions/swift/package.nls.json
git_src/extensions/scss/package.json
git_src/extensions/scss/package.nls.json
git_src/extensions/theme-defaults/package.json
git_src/extensions/theme-defaults/package.nls.json
git_src/extensions/microsoft-authentication/package.json
git_src/extensions/microsoft-authentication/package.nls.json
git_src/extensions/theme-quietlight/package.json
git_src/extensions/theme-quietlight/package.nls.json
git_src/extensions/simple-browser/package.json
git_src/extensions/simple-browser/package.nls.json
git_src/extensions/git/package.json
git_src/extensions/git/package.nls.json
git_src/extensions/notebook-renderers/package.json
git_src/extensions/notebook-renderers/package.nls.json
git_src/extensions/theme-tomorrow-night-blue/package.json
git_src/extensions/theme-tomorrow-night-blue/package.nls.json
git_src/extensions/perl/package.json
git_src/extensions/perl/package.nls.json
git_src/extensions/css/package.json
git_src/extensions/css/package.nls.json
git_src/extensions/shellscript/package.json
git_src/extensions/shellscript/package.nls.json
git_src/extensions/ini/package.json
git_src/extensions/ini/package.nls.json
git_src/extensions/groovy/package.json
git_src/extensions/groovy/package.nls.json
git_src/extensions/theme-solarized-light/package.json
git_src/extensions/theme-solarized-light/package.nls.json
git_src/extensions/references-view/package.json
git_src/extensions/references-view/package.nls.json
git_src/extensions/python/package.json
git_src/extensions/python/package.nls.json
git_src/extensions/jake/package.json
git_src/extensions/jake/package.nls.json
git_src/extensions/json/package.json
git_src/extensions/json/package.nls.json
git_src/extensions/grunt/package.json
git_src/extensions/grunt/package.nls.json
git_src/extensions/julia/package.json
git_src/extensions/julia/package.nls.json
git_src/extensions/lua/package.json
git_src/extensions/lua/package.nls.json
git_src/extensions/bat/package.json
git_src/extensions/bat/package.nls.json
git_src/extensions/javascript/package.json
git_src/extensions/javascript/package.nls.json
git_src/extensions/markdown-basics/package.json
git_src/extensions/markdown-basics/package.nls.json
git_src/extensions/razor/package.json
git_src/extensions/razor/package.nls.json
git_src/extensions/theme-monokai-dimmed/package.json
git_src/extensions/theme-monokai-dimmed/package.nls.json`


const codeServerPatcheDependencies = `git_src/src/vs/base/common/network.ts
git_src/src/vs/code/browser/workbench/workbench-dev.html
git_src/src/vs/code/browser/workbench/workbench.html
git_src/src/vs/platform/remote/browser/browserSocketFactory.ts
git_src/src/vs/server/node/webClientServer.ts
git_src/src/vs/base/common/product.ts
git_src/src/vs/code/browser/workbench/workbench.ts
git_src/src/vs/platform/extensionResourceLoader/common/extensionResourceLoader.ts
git_src/src/vs/workbench/contrib/terminal/browser/remoteTerminalBackend.ts
git_src/src/vs/workbench/contrib/extensions/browser/extensionsWorkbenchService.ts
git_src/src/vs/workbench/browser/web.api.ts
git_src/src/vs/workbench/services/environment/browser/environmentService.ts
git_src/src/vs/server/node/serverEnvironmentService.ts
git_src/src/vs/server/node/webClientServer.ts
git_src/src/vs/workbench/browser/contextkeys.ts
git_src/src/vs/workbench/contrib/files/browser/fileActions.contribution.ts
git_src/src/vs/workbench/common/contextkeys.ts
git_src/src/vs/server/node/serverServices.ts
git_src/src/vs/base/common/platform.ts
git_src/src/vs/code/browser/workbench/workbench.html
git_src/src/vs/platform/environment/common/environmentService.ts
git_src/src/vs/server/node/remoteLanguagePacks.ts
git_src/src/vs/server/node/webClientServer.ts
git_src/src/vs/server/node/serverEnvironmentService.ts
git_src/src/vs/workbench/workbench.web.main.ts
git_src/src/vs/platform/languagePacks/browser/languagePacks.ts
git_src/src/vs/workbench/contrib/localization/electron-sandbox/localeService.ts
git_src/src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.ts
git_src/src/vs/workbench/contrib/welcomeGettingStarted/browser/media/gettingStarted.css
git_src/src/vs/workbench/browser/web.api.ts
git_src/src/vs/workbench/services/environment/browser/environmentService.ts
git_src/src/vs/server/node/serverEnvironmentService.ts
git_src/src/vs/server/node/webClientServer.ts
git_src/src/vs/workbench/browser/contextkeys.ts
git_src/src/vs/workbench/common/contextkeys.ts
git_src/src/vs/platform/credentials/node/credentialsMainService.ts
git_src/src/vs/workbench/browser/client.ts
git_src/src/vs/server/node/server.main.ts
git_src/src/vs/base/common/processes.ts
git_src/src/vs/workbench/browser/parts/dialogs/dialogHandler.ts
git_src/src/vs/workbench/browser/client.ts
git_src/src/vs/workbench/browser/web.main.ts
git_src/src/vs/base/common/product.ts
git_src/src/vs/code/browser/workbench/workbench-dev.html
git_src/src/vs/code/browser/workbench/workbench.html
git_src/src/vs/server/node/webClientServer.ts
git_src/src/vs/server/node/webClientServer.ts
git_src/src/vs/workbench/browser/web.api.ts
git_src/src/vs/workbench/services/environment/browser/environmentService.ts
git_src/src/vs/base/common/product.ts
git_src/src/vs/server/node/serverEnvironmentService.ts
git_src/src/vs/server/node/webClientServer.ts
git_src/src/vs/workbench/browser/client.ts
git_src/src/vs/platform/product/common/product.ts
git_src/src/vs/server/node/webClientServer.ts
git_src/src/vs/platform/extensionResourceLoader/common/extensionResourceLoader.ts
git_src/src/vs/workbench/services/extensions/common/abstractExtensionService.ts
git_src/src/vs/workbench/services/extensions/common/extensions.ts
git_src/src/vs/base/common/product.ts
git_src/src/vs/platform/remote/browser/remoteAuthorityResolverService.ts
git_src/src/vs/server/node/webClientServer.ts
git_src/src/vs/workbench/browser/web.main.ts
git_src/src/vs/workbench/contrib/terminal/common/terminalEnvironment.ts
git_src/src/vs/code/browser/workbench/workbench.ts
git_src/src/vs/workbench/contrib/remote/browser/remoteExplorer.ts
git_src/src/vs/base/common/product.ts
git_src/src/vs/workbench/browser/client.ts
git_src/src/vs/server/node/webClientServer.ts
git_src/build/gulpfile.reh.js
git_src/src/vs/workbench/api/node/extHostExtensionService.ts
git_src/src/vs/server/node/serverServices.ts
git_src/src/vs/server/node/telemetryClient.ts
git_src/src/vs/server/node/webClientServer.ts
git_src/src/vs/workbench/services/storage/browser/storageService.ts
git_src/src/vs/workbench/browser/client.ts
git_src/src/vs/base/common/product.ts
git_src/src/vs/server/node/webClientServer.ts
git_src/src/vs/server/node/serverEnvironmentService.ts
git_src/src/vs/workbench/services/environment/browser/environmentService.ts
git_src/src/vs/server/node/webClientServer.ts
git_src/src/vs/workbench/contrib/webview/browser/pre/index.html
git_src/src/vs/workbench/contrib/webview/browser/pre/index-no-csp.html
git_src/src/vs/workbench/services/extensions/worker/webWorkerExtensionHostIframe.html`

const theiaPatches = `git_src/src/vs/workbench/contrib/mergeEditor/browser/view/conflictActions.ts
git_src/extensions/configuration-editing/schemas/devContainer.schema.generated.json
git_src/extensions/configuration-editing/schemas/devContainer.schema.src.json
git_src/src/vs/platform/userDataSync/common/userDataSyncServiceIpc.ts
git_src/src/vs/editor/contrib/codeAction/browser/codeActionUi.ts
git_src/src/vs/editor/contrib/codeAction/browser/codeActionWidget.ts
git_src/product.json
git_src/src/vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView.ts
git_src/src/vs/workbench/contrib/notebook/browser/view/renderers/webviewMessages.ts
git_src/src/vs/workbench/contrib/notebook/browser/view/renderers/webviewPreloads.ts
git_src/src/vs/workbench/contrib/debug/browser/breakpointsView.ts
git_src/src/vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView.ts
git_src/src/vs/workbench/contrib/webview/browser/resourceLoading.ts
git_src/cglicenses.json
git_src/cgmanifest.json
git_src/package.json
git_src/src/vs/workbench/contrib/extensions/browser/extensionsWorkbenchService.ts
git_src/src/vs/workbench/contrib/extensions/test/electron-browser/extensionsActions.test.ts
git_src/src/vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView.ts
git_src/src/vs/workbench/contrib/mergeEditor/browser/model/mergeEditorModel.ts
git_src/package.json
git_src/src/vs/workbench/browser/parts/activitybar/activitybarPart.ts
git_src/src/vs/workbench/services/extensionManagement/common/extensionManagementServerService.ts
git_src/src/vs/workbench/services/extensionManagement/common/remoteExtensionManagementService.ts
git_src/extensions/git/src/actionButton.ts
git_src/src/vs/workbench/services/extensionManagement/common/remoteExtensionManagementService.ts
git_src/package.json
git_src/src/vs/workbench/browser/parts/activitybar/activitybarPart.ts
git_src/src/vs/workbench/browser/web.main.ts
git_src/build/gulpfile.editor.js
git_src/build/lib/standalone.js
git_src/build/lib/standalone.ts
git_src/build/monaco/package.json
git_src/src/vs/base/browser/dompurify/dompurify.js
git_src/src/vs/base/common/marked/marked.js`;

const vscodeiumPatches = `git_src/build/gulpfile.vscode.js
git_src/src/vs/platform/native/electron-main/nativeHostMainService.ts
git_src/.vscode/settings.json
git_src/build/gulpfile.reh.js
git_src/build/gulpfile.vscode.js
git_src/build/gulpfile.vscode.linux.js
git_src/build/gulpfile.vscode.win32.js
git_src/resources/linux/rpm/code.spec.template
git_src/src/vs/base/common/product.ts
git_src/src/vs/platform/diagnostics/node/diagnosticsService.ts
git_src/src/vs/platform/product/common/product.ts
git_src/src/vs/workbench/browser/parts/dialogs/dialogHandler.ts
git_src/src/vs/workbench/common/release.ts
git_src/src/vs/workbench/contrib/issue/browser/issueService.ts
git_src/src/vs/workbench/electron-sandbox/parts/dialogs/dialogHandler.ts
git_src/build/gulpfile.vscode.win32.js
git_src/src/main.js
git_src/src/vs/platform/product/common/product.ts
git_src/src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.contribution.ts
git_src/src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.ts
git_src/build/linux/dependencies-generator.js
git_src/build/linux/dependencies-generator.ts
git_src/resources/linux/rpm/code.spec.template
git_src/src/vs/code/electron-sandbox/issue/issueReporterMain.ts
git_src/src/vs/code/electron-sandbox/issue/issueReporterModel.ts
git_src/src/vs/code/electron-sandbox/issue/issueReporterPage.ts
git_src/src/vs/workbench/contrib/extensions/electron-sandbox/extensionsSlowActions.ts
git_src/src/vs/platform/update/electron-main/updateService.win32.ts
git_src/src/vs/platform/update/common/update.ts
git_src/src/vs/platform/update/electron-main/updateService.win32.ts
git_src/extensions/github-authentication/src/githubServer.ts
git_src/src/vs/workbench/browser/parts/activitybar/activitybarActions.ts
git_src/src/vs/workbench/services/authentication/browser/authenticationService.ts`;

const vscodeiumPatchesInsider = `git_src/src/vs/platform/windows/electron-main/windowImpl.ts
git_src/src/vs/workbench/contrib/extensions/browser/extensionsWorkbenchService.ts`;