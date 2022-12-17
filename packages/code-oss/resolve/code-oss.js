// Slash at the end is importent for relativ bases to start without
// explicitly setting ./  on each dependencie so keep current style
export const baseUrl = new URL(import.meta.url).path + 'code-oss-dev/src' + '/'
// vscode internal specifiers resolution
export const vscodeResolve = {
	'specifier': 'relativeToAbsoulteBaseUrl',
	// Needs to be relativ logic less if that is to much we can shorten that with import maps compatible string replace
	// patterns it is the same concept that nodeNext resolve uses in typescript implemented via package.json exports.
	// there can be only 1 x * char in the string it gets replaced 1:1 with the right hand side of the object
	'vs/*': baseUrl + 'vs/*.js' // requesting vs/my-module  will be resolved to the most specific
	// match of the left hand see vscodeVirtualResolved
}

// isRelative ./ or bare xx or absolute /
// turn all into absolute from vscodeResolve via use of baseUrl  turn relative into absolute via baseUrl turn bare to absolute via vscodeResolve use new URL(any, baseUrl) where any should already be none relative via new URL(any, import.meta.url);
// (modSpecifier) => moduleSpecifier
// const getAll parts of vscodeResolve before the * turn that into absolute

// We need to implement nodeNextResolve as that is not implemented in typescript it self the current node next is fake and does not even support import conditions.


// this is only to show the in memory view
const vscodeVirtualResolved = {
	'specifier': 'relativeToAbsoulteBaseUrl',
	// 'vs/*': baseUrl + 'vs/*.js',
	'vs/my-module': baseUrl + 'vs/my-module.js',
}
// this creates shared memory references on each import with a other url
export const resolvedId = baseUrl + (`...code here resolves import.meta.url params to return a result on import`)

// above gets static typed internal with valueof keyof Type Const the map will be even accessible in the IDE.
