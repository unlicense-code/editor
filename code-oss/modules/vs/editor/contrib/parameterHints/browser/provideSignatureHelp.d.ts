import { CancellationToken } from 'vs/base/common/cancellation';
import { Position } from 'vs/editor/common/core/position';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
import * as languages from 'vs/editor/common/languages';
import { ITextModel } from 'vs/editor/common/model';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export declare const Context: {
    Visible: RawContextKey<boolean>;
    MultipleSignatures: RawContextKey<boolean>;
};
export declare function provideSignatureHelp(registry: LanguageFeatureRegistry<languages.SignatureHelpProvider>, model: ITextModel, position: Position, context: languages.SignatureHelpContext, token: CancellationToken): Promise<languages.SignatureHelpResult | undefined>;
