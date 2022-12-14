/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from 'vs/base/common/uri';
import { groupBy } from 'vs/base/common/arrays';
import { localize } from 'vs/nls';
export class CommentNode {
    owner;
    threadId;
    range;
    comment;
    replies = [];
    resource;
    isRoot;
    threadState;
    constructor(owner, threadId, resource, comment, range, threadState) {
        this.owner = owner;
        this.threadId = threadId;
        this.comment = comment;
        this.resource = resource;
        this.range = range;
        this.isRoot = false;
        this.threadState = threadState;
    }
    hasReply() {
        return this.replies && this.replies.length !== 0;
    }
}
export class ResourceWithCommentThreads {
    id;
    owner;
    commentThreads; // The top level comments on the file. Replys are nested under each node.
    resource;
    constructor(owner, resource, commentThreads) {
        this.owner = owner;
        this.id = resource.toString();
        this.resource = resource;
        this.commentThreads = commentThreads.filter(thread => thread.comments && thread.comments.length).map(thread => ResourceWithCommentThreads.createCommentNode(owner, resource, thread));
    }
    static createCommentNode(owner, resource, commentThread) {
        const { threadId, comments, range } = commentThread;
        const commentNodes = comments.map(comment => new CommentNode(owner, threadId, resource, comment, range, commentThread.state));
        if (commentNodes.length > 1) {
            commentNodes[0].replies = commentNodes.slice(1, commentNodes.length);
        }
        commentNodes[0].isRoot = true;
        return commentNodes[0];
    }
}
export class CommentsModel {
    resourceCommentThreads;
    commentThreadsMap;
    constructor() {
        this.resourceCommentThreads = [];
        this.commentThreadsMap = new Map();
    }
    updateResourceCommentThreads() {
        this.resourceCommentThreads = [...this.commentThreadsMap.values()].flat();
        this.resourceCommentThreads.sort((a, b) => {
            return a.resource.toString() > b.resource.toString() ? 1 : -1;
        });
    }
    setCommentThreads(owner, commentThreads) {
        this.commentThreadsMap.set(owner, this.groupByResource(owner, commentThreads));
        this.updateResourceCommentThreads();
    }
    updateCommentThreads(event) {
        const { owner, removed, changed, added } = event;
        const threadsForOwner = this.commentThreadsMap.get(owner) || [];
        removed.forEach(thread => {
            // Find resource that has the comment thread
            const matchingResourceIndex = threadsForOwner.findIndex((resourceData) => resourceData.id === thread.resource);
            const matchingResourceData = matchingResourceIndex >= 0 ? threadsForOwner[matchingResourceIndex] : undefined;
            // Find comment node on resource that is that thread and remove it
            const index = matchingResourceData?.commentThreads.findIndex((commentThread) => commentThread.threadId === thread.threadId) ?? 0;
            matchingResourceData?.commentThreads.splice(index, 1);
            // If the comment thread was the last thread for a resource, remove that resource from the list
            if (matchingResourceData?.commentThreads.length === 0) {
                threadsForOwner.splice(matchingResourceIndex, 1);
            }
        });
        changed.forEach(thread => {
            // Find resource that has the comment thread
            const matchingResourceIndex = threadsForOwner.findIndex((resourceData) => resourceData.id === thread.resource);
            const matchingResourceData = threadsForOwner[matchingResourceIndex];
            // Find comment node on resource that is that thread and replace it
            const index = matchingResourceData.commentThreads.findIndex((commentThread) => commentThread.threadId === thread.threadId);
            if (index >= 0) {
                matchingResourceData.commentThreads[index] = ResourceWithCommentThreads.createCommentNode(owner, URI.parse(matchingResourceData.id), thread);
            }
            else if (thread.comments && thread.comments.length) {
                matchingResourceData.commentThreads.push(ResourceWithCommentThreads.createCommentNode(owner, URI.parse(matchingResourceData.id), thread));
            }
        });
        added.forEach(thread => {
            const existingResource = threadsForOwner.filter(resourceWithThreads => resourceWithThreads.resource.toString() === thread.resource);
            if (existingResource.length) {
                const resource = existingResource[0];
                if (thread.comments && thread.comments.length) {
                    resource.commentThreads.push(ResourceWithCommentThreads.createCommentNode(owner, resource.resource, thread));
                }
            }
            else {
                threadsForOwner.push(new ResourceWithCommentThreads(owner, URI.parse(thread.resource), [thread]));
            }
        });
        this.commentThreadsMap.set(owner, threadsForOwner);
        this.updateResourceCommentThreads();
        return removed.length > 0 || changed.length > 0 || added.length > 0;
    }
    hasCommentThreads() {
        return !!this.resourceCommentThreads.length;
    }
    getMessage() {
        if (!this.resourceCommentThreads.length) {
            return localize('noComments', "There are no comments in this workspace yet.");
        }
        else {
            return '';
        }
    }
    groupByResource(owner, commentThreads) {
        const resourceCommentThreads = [];
        const commentThreadsByResource = new Map();
        for (const group of groupBy(commentThreads, CommentsModel._compareURIs)) {
            commentThreadsByResource.set(group[0].resource, new ResourceWithCommentThreads(owner, URI.parse(group[0].resource), group));
        }
        commentThreadsByResource.forEach((v, i, m) => {
            resourceCommentThreads.push(v);
        });
        return resourceCommentThreads;
    }
    static _compareURIs(a, b) {
        const resourceA = a.resource.toString();
        const resourceB = b.resource.toString();
        if (resourceA < resourceB) {
            return -1;
        }
        else if (resourceA > resourceB) {
            return 1;
        }
        else {
            return 0;
        }
    }
}
