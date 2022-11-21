import { CancellationToken } from 'vs/base/common/cancellation';
import { Position } from 'vs/editor/common/core/position';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
import { DeclarationProvider, DefinitionProvider, ImplementationProvider, LocationLink, ReferenceProvider, TypeDefinitionProvider } from 'vs/editor/common/languages';
import { ITextModel } from 'vs/editor/common/model';
export declare function getDefinitionsAtPosition(registry: LanguageFeatureRegistry<DefinitionProvider>, model: ITextModel, position: Position, token: CancellationToken): Promise<LocationLink[]>;
export declare function getDeclarationsAtPosition(registry: LanguageFeatureRegistry<DeclarationProvider>, model: ITextModel, position: Position, token: CancellationToken): Promise<LocationLink[]>;
export declare function getImplementationsAtPosition(registry: LanguageFeatureRegistry<ImplementationProvider>, model: ITextModel, position: Position, token: CancellationToken): Promise<LocationLink[]>;
export declare function getTypeDefinitionsAtPosition(registry: LanguageFeatureRegistry<TypeDefinitionProvider>, model: ITextModel, position: Position, token: CancellationToken): Promise<LocationLink[]>;
export declare function getReferencesAtPosition(registry: LanguageFeatureRegistry<ReferenceProvider>, model: ITextModel, position: Position, compact: boolean, token: CancellationToken): Promise<LocationLink[]>;
