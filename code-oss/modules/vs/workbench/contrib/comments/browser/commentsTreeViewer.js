/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as dom from 'vs/base/browser/dom';
import * as nls from 'vs/nls';
import { renderMarkdown } from 'vs/base/browser/markdownRenderer';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { CommentNode, CommentsModel, ResourceWithCommentThreads } from 'vs/workbench/contrib/comments/common/commentModel';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { WorkbenchAsyncDataTree, IListService } from 'vs/platform/list/browser/listService';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { TimestampWidget } from 'vs/workbench/contrib/comments/browser/timestamp';
import { Codicon } from 'vs/base/common/codicons';
import { commentViewThreadStateColorVar, getCommentThreadStateColor } from 'vs/workbench/contrib/comments/browser/commentColors';
import { CommentThreadState } from 'vs/editor/common/languages';
import { FilterOptions } from 'vs/workbench/contrib/comments/browser/commentsFilterOptions';
import { basename } from 'vs/base/common/resources';
import { openLinkFromMarkdown } from 'vs/editor/contrib/markdownRenderer/browser/markdownRenderer';
export const COMMENTS_VIEW_ID = 'workbench.panel.comments';
export const COMMENTS_VIEW_STORAGE_ID = 'Comments';
export const COMMENTS_VIEW_TITLE = nls.localize('comments.view.title', "Comments");
export class CommentsAsyncDataSource {
    hasChildren(element) {
        return (element instanceof CommentsModel || element instanceof ResourceWithCommentThreads) && !(element instanceof CommentNode);
    }
    getChildren(element) {
        if (element instanceof CommentsModel) {
            return Promise.resolve(element.resourceCommentThreads);
        }
        if (element instanceof ResourceWithCommentThreads) {
            return Promise.resolve(element.commentThreads);
        }
        return Promise.resolve([]);
    }
}
class CommentsModelVirualDelegate {
    static RESOURCE_ID = 'resource-with-comments';
    static COMMENT_ID = 'comment-node';
    getHeight(element) {
        if ((element instanceof CommentNode) && element.hasReply()) {
            return 44;
        }
        return 22;
    }
    getTemplateId(element) {
        if (element instanceof ResourceWithCommentThreads) {
            return CommentsModelVirualDelegate.RESOURCE_ID;
        }
        if (element instanceof CommentNode) {
            return CommentsModelVirualDelegate.COMMENT_ID;
        }
        return '';
    }
}
export class ResourceWithCommentsRenderer {
    labels;
    templateId = 'resource-with-comments';
    constructor(labels) {
        this.labels = labels;
    }
    renderTemplate(container) {
        const data = Object.create(null);
        const labelContainer = dom.append(container, dom.$('.resource-container'));
        data.resourceLabel = this.labels.create(labelContainer);
        return data;
    }
    renderElement(node, index, templateData, height) {
        templateData.resourceLabel.setFile(node.element.resource);
    }
    disposeTemplate(templateData) {
        templateData.resourceLabel.dispose();
    }
}
let CommentNodeRenderer = class CommentNodeRenderer {
    openerService;
    configurationService;
    themeService;
    templateId = 'comment-node';
    constructor(openerService, configurationService, themeService) {
        this.openerService = openerService;
        this.configurationService = configurationService;
        this.themeService = themeService;
    }
    renderTemplate(container) {
        const data = Object.create(null);
        const threadContainer = dom.append(container, dom.$('.comment-thread-container'));
        const metadataContainer = dom.append(threadContainer, dom.$('.comment-metadata-container'));
        data.threadMetadata = {
            icon: dom.append(metadataContainer, dom.$('.icon')),
            userNames: dom.append(metadataContainer, dom.$('.user')),
            timestamp: new TimestampWidget(this.configurationService, dom.append(metadataContainer, dom.$('.timestamp-container'))),
            separator: dom.append(metadataContainer, dom.$('.separator')),
            commentPreview: dom.append(metadataContainer, dom.$('.text')),
            range: dom.append(metadataContainer, dom.$('.range'))
        };
        data.threadMetadata.separator.innerText = '\u00b7';
        const snippetContainer = dom.append(threadContainer, dom.$('.comment-snippet-container'));
        data.repliesMetadata = {
            container: snippetContainer,
            icon: dom.append(snippetContainer, dom.$('.icon')),
            count: dom.append(snippetContainer, dom.$('.count')),
            lastReplyDetail: dom.append(snippetContainer, dom.$('.reply-detail')),
            separator: dom.append(snippetContainer, dom.$('.separator')),
            timestamp: new TimestampWidget(this.configurationService, dom.append(snippetContainer, dom.$('.timestamp-container'))),
        };
        data.repliesMetadata.separator.innerText = '\u00b7';
        data.repliesMetadata.icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.indent));
        data.disposables = [data.threadMetadata.timestamp, data.repliesMetadata.timestamp];
        return data;
    }
    getCountString(commentCount) {
        if (commentCount > 1) {
            return nls.localize('commentsCount', "{0} comments", commentCount);
        }
        else {
            return nls.localize('commentCount', "1 comment");
        }
    }
    getRenderedComment(commentBody, disposables) {
        const renderedComment = renderMarkdown(commentBody, {
            inline: true,
            actionHandler: {
                callback: (link) => openLinkFromMarkdown(this.openerService, link, commentBody.isTrusted),
                disposables: disposables
            }
        });
        const images = renderedComment.element.getElementsByTagName('img');
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const textDescription = dom.$('');
            textDescription.textContent = image.alt ? nls.localize('imageWithLabel', "Image: {0}", image.alt) : nls.localize('image', "Image");
            image.parentNode.replaceChild(textDescription, image);
        }
        return renderedComment;
    }
    getIcon(threadState) {
        if (threadState === CommentThreadState.Unresolved) {
            return Codicon.commentUnresolved;
        }
        else {
            return Codicon.comment;
        }
    }
    renderElement(node, index, templateData, height) {
        const commentCount = node.element.replies.length + 1;
        templateData.threadMetadata.icon.classList.remove(...Array.from(templateData.threadMetadata.icon.classList.values())
            .filter(value => value.startsWith('codicon')));
        templateData.threadMetadata.icon.classList.add(...ThemeIcon.asClassNameArray(this.getIcon(node.element.threadState)));
        if (node.element.threadState !== undefined) {
            const color = this.getCommentThreadWidgetStateColor(node.element.threadState, this.themeService.getColorTheme());
            templateData.threadMetadata.icon.style.setProperty(commentViewThreadStateColorVar, `${color}`);
            templateData.threadMetadata.icon.style.color = `var(${commentViewThreadStateColorVar}`;
        }
        templateData.threadMetadata.userNames.textContent = node.element.comment.userName;
        templateData.threadMetadata.timestamp.setTimestamp(node.element.comment.timestamp ? new Date(node.element.comment.timestamp) : undefined);
        const originalComment = node.element;
        templateData.threadMetadata.commentPreview.innerText = '';
        templateData.threadMetadata.commentPreview.style.height = '22px';
        if (typeof originalComment.comment.body === 'string') {
            templateData.threadMetadata.commentPreview.innerText = originalComment.comment.body;
        }
        else {
            const disposables = new DisposableStore();
            templateData.disposables.push(disposables);
            const renderedComment = this.getRenderedComment(originalComment.comment.body, disposables);
            templateData.disposables.push(renderedComment);
            templateData.threadMetadata.commentPreview.appendChild(renderedComment.element.firstElementChild ?? renderedComment.element);
            templateData.threadMetadata.commentPreview.title = renderedComment.element.textContent ?? '';
        }
        if (node.element.range.startLineNumber === node.element.range.endLineNumber) {
            templateData.threadMetadata.range.textContent = nls.localize('commentLine', "[Ln {0}]", node.element.range.startLineNumber);
        }
        else {
            templateData.threadMetadata.range.textContent = nls.localize('commentRange', "[Ln {0}-{1}]", node.element.range.startLineNumber, node.element.range.endLineNumber);
        }
        if (!node.element.hasReply()) {
            templateData.repliesMetadata.container.style.display = 'none';
            return;
        }
        templateData.repliesMetadata.container.style.display = '';
        templateData.repliesMetadata.count.textContent = this.getCountString(commentCount);
        const lastComment = node.element.replies[node.element.replies.length - 1].comment;
        templateData.repliesMetadata.lastReplyDetail.textContent = nls.localize('lastReplyFrom', "Last reply from {0}", lastComment.userName);
        templateData.repliesMetadata.timestamp.setTimestamp(lastComment.timestamp ? new Date(lastComment.timestamp) : undefined);
    }
    getCommentThreadWidgetStateColor(state, theme) {
        return (state !== undefined) ? getCommentThreadStateColor(state, theme) : undefined;
    }
    disposeTemplate(templateData) {
        templateData.disposables.forEach(disposeable => disposeable.dispose());
    }
};
CommentNodeRenderer = __decorate([
    __param(0, IOpenerService),
    __param(1, IConfigurationService),
    __param(2, IThemeService)
], CommentNodeRenderer);
export { CommentNodeRenderer };
var FilterDataType;
(function (FilterDataType) {
    FilterDataType[FilterDataType["Resource"] = 0] = "Resource";
    FilterDataType[FilterDataType["Comment"] = 1] = "Comment";
})(FilterDataType || (FilterDataType = {}));
export class Filter {
    options;
    constructor(options) {
        this.options = options;
    }
    filter(element, parentVisibility) {
        if (element instanceof ResourceWithCommentThreads) {
            return this.filterResourceMarkers(element);
        }
        else {
            return this.filterCommentNode(element, parentVisibility);
        }
    }
    filterResourceMarkers(resourceMarkers) {
        // Filter by text. Do not apply negated filters on resources instead use exclude patterns
        if (this.options.textFilter.text && !this.options.textFilter.negate) {
            const uriMatches = FilterOptions._filter(this.options.textFilter.text, basename(resourceMarkers.resource));
            if (uriMatches) {
                return { visibility: true, data: { type: 0 /* FilterDataType.Resource */, uriMatches: uriMatches || [] } };
            }
        }
        return 2 /* TreeVisibility.Recurse */;
    }
    filterCommentNode(comment, parentVisibility) {
        const matchesResolvedState = (comment.threadState === undefined) || (this.options.showResolved && CommentThreadState.Resolved === comment.threadState) ||
            (this.options.showUnresolved && CommentThreadState.Unresolved === comment.threadState);
        if (!matchesResolvedState) {
            return false;
        }
        if (!this.options.textFilter.text) {
            return true;
        }
        const textMatches = 
        // Check body of comment for value
        FilterOptions._messageFilter(this.options.textFilter.text, typeof comment.comment.body === 'string' ? comment.comment.body : comment.comment.body.value)
            // Check first user for value
            || FilterOptions._messageFilter(this.options.textFilter.text, comment.comment.userName)
            // Check all replies for value
            || comment.replies.map(reply => {
                // Check user for value
                return FilterOptions._messageFilter(this.options.textFilter.text, reply.comment.userName)
                    // Check body of reply for value
                    || FilterOptions._messageFilter(this.options.textFilter.text, typeof reply.comment.body === 'string' ? reply.comment.body : reply.comment.body.value);
            }).filter(value => !!value).flat();
        // Matched and not negated
        if (textMatches.length && !this.options.textFilter.negate) {
            return { visibility: true, data: { type: 1 /* FilterDataType.Comment */, textMatches } };
        }
        // Matched and negated - exclude it only if parent visibility is not set
        if (textMatches.length && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
            return false;
        }
        // Not matched and negated - include it only if parent visibility is not set
        if ((textMatches.length === 0) && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
            return true;
        }
        return parentVisibility;
    }
}
let CommentsList = class CommentsList extends WorkbenchAsyncDataTree {
    constructor(labels, container, options, contextKeyService, listService, themeService, instantiationService, configurationService) {
        const delegate = new CommentsModelVirualDelegate();
        const dataSource = new CommentsAsyncDataSource();
        const renderers = [
            instantiationService.createInstance(ResourceWithCommentsRenderer, labels),
            instantiationService.createInstance(CommentNodeRenderer)
        ];
        super('CommentsTree', container, delegate, renderers, dataSource, {
            accessibilityProvider: options.accessibilityProvider,
            identityProvider: {
                getId: (element) => {
                    if (element instanceof CommentsModel) {
                        return 'root';
                    }
                    if (element instanceof ResourceWithCommentThreads) {
                        return `${element.owner}-${element.id}`;
                    }
                    if (element instanceof CommentNode) {
                        return `${element.owner}-${element.resource.toString()}-${element.threadId}-${element.comment.uniqueIdInThread}` + (element.isRoot ? '-root' : '');
                    }
                    return '';
                }
            },
            expandOnlyOnTwistieClick: (element) => {
                if (element instanceof CommentsModel || element instanceof ResourceWithCommentThreads) {
                    return false;
                }
                return true;
            },
            collapseByDefault: () => {
                return false;
            },
            overrideStyles: options.overrideStyles,
            filter: options.filter,
            findWidgetEnabled: false
        }, instantiationService, contextKeyService, listService, themeService, configurationService);
    }
    filterComments() {
        this.refilter();
    }
    getVisibleItemCount() {
        let filtered = 0;
        const root = this.getNode();
        for (const resourceNode of root.children) {
            for (const commentNode of resourceNode.children) {
                if (commentNode.visible && resourceNode.visible) {
                    filtered++;
                }
            }
        }
        return filtered;
    }
};
CommentsList = __decorate([
    __param(3, IContextKeyService),
    __param(4, IListService),
    __param(5, IThemeService),
    __param(6, IInstantiationService),
    __param(7, IConfigurationService)
], CommentsList);
export { CommentsList };
