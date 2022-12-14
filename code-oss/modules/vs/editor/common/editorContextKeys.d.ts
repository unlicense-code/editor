import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export declare namespace EditorContextKeys {
    const editorSimpleInput: RawContextKey<boolean>;
    /**
     * A context key that is set when the editor's text has focus (cursor is blinking).
     * Is false when focus is in simple editor widgets (repl input, scm commit input).
     */
    const editorTextFocus: RawContextKey<boolean>;
    /**
     * A context key that is set when the editor's text or an editor's widget has focus.
     */
    const focus: RawContextKey<boolean>;
    /**
     * A context key that is set when any editor input has focus (regular editor, repl input...).
     */
    const textInputFocus: RawContextKey<boolean>;
    const readOnly: RawContextKey<boolean>;
    const inDiffEditor: RawContextKey<boolean>;
    const columnSelection: RawContextKey<boolean>;
    const writable: import("vs/platform/contextkey/common/contextkey").ContextKeyExpression;
    const hasNonEmptySelection: RawContextKey<boolean>;
    const hasOnlyEmptySelection: import("vs/platform/contextkey/common/contextkey").ContextKeyExpression;
    const hasMultipleSelections: RawContextKey<boolean>;
    const hasSingleSelection: import("vs/platform/contextkey/common/contextkey").ContextKeyExpression;
    const tabMovesFocus: RawContextKey<boolean>;
    const tabDoesNotMoveFocus: import("vs/platform/contextkey/common/contextkey").ContextKeyExpression;
    const isInWalkThroughSnippet: RawContextKey<boolean>;
    const canUndo: RawContextKey<boolean>;
    const canRedo: RawContextKey<boolean>;
    const hoverVisible: RawContextKey<boolean>;
    /**
     * A context key that is set when an editor is part of a larger editor, like notebooks or
     * (future) a diff editor
     */
    const inCompositeEditor: RawContextKey<boolean>;
    const notInCompositeEditor: import("vs/platform/contextkey/common/contextkey").ContextKeyExpression;
    const languageId: RawContextKey<string>;
    const hasCompletionItemProvider: RawContextKey<boolean>;
    const hasCodeActionsProvider: RawContextKey<boolean>;
    const hasCodeLensProvider: RawContextKey<boolean>;
    const hasDefinitionProvider: RawContextKey<boolean>;
    const hasDeclarationProvider: RawContextKey<boolean>;
    const hasImplementationProvider: RawContextKey<boolean>;
    const hasTypeDefinitionProvider: RawContextKey<boolean>;
    const hasHoverProvider: RawContextKey<boolean>;
    const hasDocumentHighlightProvider: RawContextKey<boolean>;
    const hasDocumentSymbolProvider: RawContextKey<boolean>;
    const hasReferenceProvider: RawContextKey<boolean>;
    const hasRenameProvider: RawContextKey<boolean>;
    const hasSignatureHelpProvider: RawContextKey<boolean>;
    const hasInlayHintsProvider: RawContextKey<boolean>;
    const hasDocumentFormattingProvider: RawContextKey<boolean>;
    const hasDocumentSelectionFormattingProvider: RawContextKey<boolean>;
    const hasMultipleDocumentFormattingProvider: RawContextKey<boolean>;
    const hasMultipleDocumentSelectionFormattingProvider: RawContextKey<boolean>;
}
