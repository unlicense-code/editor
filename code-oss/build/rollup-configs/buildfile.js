const buildfile = {};

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * @param {string} name
 * @param {string[]} exclude
 */
function createModuleDescription(name, exclude) {

	let excludes = ['vs/css', 'vs/nls'];
	if (Array.isArray(exclude) && exclude.length > 0) {
		excludes = excludes.concat(exclude);
	}

	return {
		name: name,
		include: [],
		exclude: excludes
	};
}

/**
 * @param {string} name
 */
function createEditorWorkerModuleDescription(name) {
	return createModuleDescription(name, ['vs/base/common/worker/simpleWorker', 'vs/editor/common/services/editorSimpleWorker']);
}

const base = buildfile.base = [
	{
		name: 'vs/editor/common/services/editorSimpleWorker',
		include: ['vs/base/common/worker/simpleWorker'],
		exclude: ['vs/nls'],
		prepend: [
			{ path: 'vs/loader.js' },
			{ path: 'vs/base/worker/workerMain.js' }
		],
		dest: 'vs/base/worker/workerMain.js'
	},
	{
		name: 'vs/base/common/worker/simpleWorker',
		exclude: ['vs/nls'],
	}
];

const workerExtensionHost = buildfile.workerExtensionHost = [createEditorWorkerModuleDescription('vs/workbench/api/worker/extensionHostWorker')];
const workerNotebook = buildfile.workerNotebook = [createEditorWorkerModuleDescription('vs/workbench/contrib/notebook/common/services/notebookSimpleWorker')];
const workerSharedProcess = buildfile.workerSharedProcess = [createEditorWorkerModuleDescription('vs/platform/sharedProcess/electron-browser/sharedProcessWorkerMain')];
const workerLanguageDetection = buildfile.workerLanguageDetection = [createEditorWorkerModuleDescription('vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker')];
const workerLocalFileSearch = buildfile.workerLocalFileSearch = [createEditorWorkerModuleDescription('vs/workbench/services/search/worker/localFileSearch')];
const workerProfileAnalysis = buildfile.workerProfileAnalysis = [createEditorWorkerModuleDescription('vs/platform/profiling/electron-sandbox/profileAnalysisWorker')];

const workbenchDesktop = buildfile.workbenchDesktop = [
	createEditorWorkerModuleDescription('vs/workbench/contrib/output/common/outputLinkComputer'),
	createModuleDescription('vs/workbench/contrib/debug/node/telemetryApp'),
	createModuleDescription('vs/platform/files/node/watcher/watcherMain'),
	createModuleDescription('vs/platform/terminal/node/ptyHostMain'),
	createModuleDescription('vs/workbench/api/node/extensionHostProcess')
];

const workbenchWeb = buildfile.workbenchWeb = [
	createEditorWorkerModuleDescription('vs/workbench/contrib/output/common/outputLinkComputer'),
	createModuleDescription('vs/code/browser/workbench/workbench', ['vs/workbench/workbench.web.main'])
];

const keyboardMaps = buildfile.keyboardMaps = [
	createModuleDescription('vs/workbench/services/keybinding/browser/keyboardLayouts/layout.contribution.linux'),
	createModuleDescription('vs/workbench/services/keybinding/browser/keyboardLayouts/layout.contribution.darwin'),
	createModuleDescription('vs/workbench/services/keybinding/browser/keyboardLayouts/layout.contribution.win')
];

const code = buildfile.code = [
	createModuleDescription('vs/code/electron-main/main'),
	createModuleDescription('vs/code/node/cli'),
	createModuleDescription('vs/code/node/cliProcessMain', ['vs/code/node/cli']),
	createModuleDescription('vs/code/electron-sandbox/issue/issueReporterMain'),
	createModuleDescription('vs/code/electron-browser/sharedProcess/sharedProcessMain'),
	createModuleDescription('vs/code/electron-sandbox/processExplorer/processExplorerMain')
];

const entrypoint = buildfile.entrypoint = createModuleDescription;

export { base, code, buildfile as default, entrypoint, keyboardMaps, workbenchDesktop, workbenchWeb, workerExtensionHost, workerLanguageDetection, workerLocalFileSearch, workerNotebook, workerProfileAnalysis, workerSharedProcess };
