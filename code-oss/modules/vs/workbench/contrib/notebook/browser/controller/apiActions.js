/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as glob from 'vs/base/common/glob';
import { URI } from 'vs/base/common/uri';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { isDocumentExcludePattern } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
CommandsRegistry.registerCommand('_resolveNotebookContentProvider', (accessor) => {
    const notebookService = accessor.get(INotebookService);
    const contentProviders = notebookService.getContributedNotebookTypes();
    return contentProviders.map(provider => {
        const filenamePatterns = provider.selectors.map(selector => {
            if (typeof selector === 'string') {
                return selector;
            }
            if (glob.isRelativePattern(selector)) {
                return selector;
            }
            if (isDocumentExcludePattern(selector)) {
                return {
                    include: selector.include,
                    exclude: selector.exclude
                };
            }
            return null;
        }).filter(pattern => pattern !== null);
        return {
            viewType: provider.id,
            displayName: provider.displayName,
            filenamePattern: filenamePatterns,
            options: {
                transientCellMetadata: provider.options.transientCellMetadata,
                transientDocumentMetadata: provider.options.transientDocumentMetadata,
                transientOutputs: provider.options.transientOutputs
            }
        };
    });
});
CommandsRegistry.registerCommand('_resolveNotebookKernels', async (accessor, args) => {
    const notebookKernelService = accessor.get(INotebookKernelService);
    const uri = URI.revive(args.uri);
    const kernels = notebookKernelService.getMatchingKernel({ uri, viewType: args.viewType });
    return kernels.all.map(provider => ({
        id: provider.id,
        label: provider.label,
        kind: provider.kind,
        description: provider.description,
        detail: provider.detail,
        isPreferred: false,
        preloads: provider.preloadUris,
    }));
});
