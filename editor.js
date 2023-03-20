// Registers workers in a serviceWorker Cache then loads editor

// Main Concepts the editor is a range content parser that exposes events via streams.
// so its a abstraction of the concept of range requests.
// you can consume the streams to manipulate the editor view as you need as also scroll the content range.

import { editor } from 'components/monaco-editor-core'; // monaco without language support
// import { editor } from 'components/monaco-editor'; // monaco with monarch languages and vscode languageService (server) support nls new language services
// import { editor } from 'components/monaco-editor-textmate'; // extra added support for integration of textmate languages via vscode-omnigurma
// 

// ReadableStream({ read(e) { e.enqueue(editor.create(el)) } })
// .pipeThrough(new TransformStream({ transform(c,el) { /** do applyLogic */ } }))
// .pipeTo(new WriteableStream({ write(el) { /** do  Observation something */ } }));
// 


// code-oss notes it integrates mainly via import type { IWorkspace, IWorkspaceProvider } from 'vs/workbench/services/host/browser/browserHostService'; and the workbench accepts that on .create>()
// the workbench is the abstraction over the editor. exposing code-oss UI
// the top menu of vscode is added via electron if you replace that with something else you got a working editor
