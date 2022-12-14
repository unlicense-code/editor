import { AstNode } from './ast';
import { TextEditInfo } from './beforeEditPositionMapper';
import { Tokenizer } from './tokenizer';
/**
 * Non incrementally built ASTs are immutable.
*/
export declare function parseDocument(tokenizer: Tokenizer, edits: TextEditInfo[], oldNode: AstNode | undefined, createImmutableLists: boolean): AstNode;
