import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export declare namespace CommentContextKeys {
    /**
     * A context key that is set when the comment thread has no comments.
     */
    const commentThreadIsEmpty: RawContextKey<boolean>;
    /**
     * A context key that is set when the comment has no input.
     */
    const commentIsEmpty: RawContextKey<boolean>;
}
