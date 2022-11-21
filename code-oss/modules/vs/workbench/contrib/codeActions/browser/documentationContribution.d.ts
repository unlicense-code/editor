import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable } from 'vs/base/common/lifecycle';
import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import * as languages from 'vs/editor/common/languages';
import { ITextModel } from 'vs/editor/common/model';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { DocumentationExtensionPoint } from 'vs/workbench/contrib/codeActions/common/documentationExtensionPoint';
import { IExtensionPoint } from 'vs/workbench/services/extensions/common/extensionsRegistry';
export declare class CodeActionDocumentationContribution extends Disposable implements IWorkbenchContribution, languages.CodeActionProvider {
    private readonly contextKeyService;
    private contributions;
    private readonly emptyCodeActionsList;
    constructor(extensionPoint: IExtensionPoint<DocumentationExtensionPoint>, contextKeyService: IContextKeyService, languageFeaturesService: ILanguageFeaturesService);
    provideCodeActions(_model: ITextModel, _range: Range | Selection, context: languages.CodeActionContext, _token: CancellationToken): Promise<languages.CodeActionList>;
    _getAdditionalMenuItems(context: languages.CodeActionContext, actions: readonly languages.CodeAction[]): languages.Command[];
}
