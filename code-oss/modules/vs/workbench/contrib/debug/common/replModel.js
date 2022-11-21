/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import severity from 'vs/base/common/severity';
import { isObject, isString } from 'vs/base/common/types';
import { generateUuid } from 'vs/base/common/uuid';
import * as nls from 'vs/nls';
import { ExpressionContainer } from 'vs/workbench/contrib/debug/common/debugModel';
const MAX_REPL_LENGTH = 10000;
let topReplElementCounter = 0;
const getUniqueId = () => `topReplElement:${topReplElementCounter++}`;
export class SimpleReplElement {
    session;
    id;
    value;
    severity;
    sourceData;
    _count = 1;
    _onDidChangeCount = new Emitter();
    constructor(session, id, value, severity, sourceData) {
        this.session = session;
        this.id = id;
        this.value = value;
        this.severity = severity;
        this.sourceData = sourceData;
    }
    toString(includeSource = false) {
        let valueRespectCount = this.value;
        for (let i = 1; i < this.count; i++) {
            valueRespectCount += (valueRespectCount.endsWith('\n') ? '' : '\n') + this.value;
        }
        const sourceStr = (this.sourceData && includeSource) ? ` ${this.sourceData.source.name}` : '';
        return valueRespectCount + sourceStr;
    }
    getId() {
        return this.id;
    }
    set count(value) {
        this._count = value;
        this._onDidChangeCount.fire();
    }
    get count() {
        return this._count;
    }
    get onDidChangeCount() {
        return this._onDidChangeCount.event;
    }
}
export class RawObjectReplElement {
    id;
    name;
    valueObj;
    sourceData;
    annotation;
    static MAX_CHILDREN = 1000; // upper bound of children per value
    constructor(id, name, valueObj, sourceData, annotation) {
        this.id = id;
        this.name = name;
        this.valueObj = valueObj;
        this.sourceData = sourceData;
        this.annotation = annotation;
    }
    getId() {
        return this.id;
    }
    get value() {
        if (this.valueObj === null) {
            return 'null';
        }
        else if (Array.isArray(this.valueObj)) {
            return `Array[${this.valueObj.length}]`;
        }
        else if (isObject(this.valueObj)) {
            return 'Object';
        }
        else if (isString(this.valueObj)) {
            return `"${this.valueObj}"`;
        }
        return String(this.valueObj) || '';
    }
    get hasChildren() {
        return (Array.isArray(this.valueObj) && this.valueObj.length > 0) || (isObject(this.valueObj) && Object.getOwnPropertyNames(this.valueObj).length > 0);
    }
    evaluateLazy() {
        throw new Error('Method not implemented.');
    }
    getChildren() {
        let result = [];
        if (Array.isArray(this.valueObj)) {
            result = this.valueObj.slice(0, RawObjectReplElement.MAX_CHILDREN)
                .map((v, index) => new RawObjectReplElement(`${this.id}:${index}`, String(index), v));
        }
        else if (isObject(this.valueObj)) {
            result = Object.getOwnPropertyNames(this.valueObj).slice(0, RawObjectReplElement.MAX_CHILDREN)
                .map((key, index) => new RawObjectReplElement(`${this.id}:${index}`, key, this.valueObj[key]));
        }
        return Promise.resolve(result);
    }
    toString() {
        return `${this.name}\n${this.value}`;
    }
}
export class ReplEvaluationInput {
    value;
    id;
    constructor(value) {
        this.value = value;
        this.id = generateUuid();
    }
    toString() {
        return this.value;
    }
    getId() {
        return this.id;
    }
}
export class ReplEvaluationResult extends ExpressionContainer {
    _available = true;
    get available() {
        return this._available;
    }
    constructor() {
        super(undefined, undefined, 0, generateUuid());
    }
    async evaluateExpression(expression, session, stackFrame, context) {
        const result = await super.evaluateExpression(expression, session, stackFrame, context);
        this._available = result;
        return result;
    }
    toString() {
        return `${this.value}`;
    }
}
export class ReplGroup {
    name;
    autoExpand;
    sourceData;
    children = [];
    id;
    ended = false;
    static COUNTER = 0;
    constructor(name, autoExpand, sourceData) {
        this.name = name;
        this.autoExpand = autoExpand;
        this.sourceData = sourceData;
        this.id = `replGroup:${ReplGroup.COUNTER++}`;
    }
    get hasChildren() {
        return true;
    }
    getId() {
        return this.id;
    }
    toString(includeSource = false) {
        const sourceStr = (includeSource && this.sourceData) ? ` ${this.sourceData.source.name}` : '';
        return this.name + sourceStr;
    }
    addChild(child) {
        const lastElement = this.children.length ? this.children[this.children.length - 1] : undefined;
        if (lastElement instanceof ReplGroup && !lastElement.hasEnded) {
            lastElement.addChild(child);
        }
        else {
            this.children.push(child);
        }
    }
    getChildren() {
        return this.children;
    }
    end() {
        const lastElement = this.children.length ? this.children[this.children.length - 1] : undefined;
        if (lastElement instanceof ReplGroup && !lastElement.hasEnded) {
            lastElement.end();
        }
        else {
            this.ended = true;
        }
    }
    get hasEnded() {
        return this.ended;
    }
}
function areSourcesEqual(first, second) {
    if (!first && !second) {
        return true;
    }
    if (first && second) {
        return first.column === second.column && first.lineNumber === second.lineNumber && first.source.uri.toString() === second.source.uri.toString();
    }
    return false;
}
export class ReplModel {
    configurationService;
    replElements = [];
    _onDidChangeElements = new Emitter();
    onDidChangeElements = this._onDidChangeElements.event;
    constructor(configurationService) {
        this.configurationService = configurationService;
    }
    getReplElements() {
        return this.replElements;
    }
    async addReplExpression(session, stackFrame, name) {
        this.addReplElement(new ReplEvaluationInput(name));
        const result = new ReplEvaluationResult();
        await result.evaluateExpression(name, session, stackFrame, 'repl');
        this.addReplElement(result);
    }
    appendToRepl(session, data, sev, source) {
        const clearAnsiSequence = '\u001b[2J';
        if (typeof data === 'string' && data.indexOf(clearAnsiSequence) >= 0) {
            // [2J is the ansi escape sequence for clearing the display http://ascii-table.com/ansi-escape-sequences.php
            this.removeReplExpressions();
            this.appendToRepl(session, nls.localize('consoleCleared', "Console was cleared"), severity.Ignore);
            data = data.substring(data.lastIndexOf(clearAnsiSequence) + clearAnsiSequence.length);
        }
        if (typeof data === 'string') {
            const previousElement = this.replElements.length ? this.replElements[this.replElements.length - 1] : undefined;
            if (previousElement instanceof SimpleReplElement && previousElement.severity === sev) {
                const config = this.configurationService.getValue('debug');
                if (previousElement.value === data && areSourcesEqual(previousElement.sourceData, source) && config.console.collapseIdenticalLines) {
                    previousElement.count++;
                    // No need to fire an event, just the count updates and badge will adjust automatically
                    return;
                }
                if (!previousElement.value.endsWith('\n') && !previousElement.value.endsWith('\r\n') && previousElement.count === 1) {
                    this.replElements[this.replElements.length - 1] = new SimpleReplElement(session, getUniqueId(), previousElement.value + data, sev, source);
                    this._onDidChangeElements.fire();
                    return;
                }
            }
            const element = new SimpleReplElement(session, getUniqueId(), data, sev, source);
            this.addReplElement(element);
        }
        else {
            // TODO@Isidor hack, we should introduce a new type which is an output that can fetch children like an expression
            data.severity = sev;
            data.sourceData = source;
            this.addReplElement(data);
        }
    }
    startGroup(name, autoExpand, sourceData) {
        const group = new ReplGroup(name, autoExpand, sourceData);
        this.addReplElement(group);
    }
    endGroup() {
        const lastElement = this.replElements[this.replElements.length - 1];
        if (lastElement instanceof ReplGroup) {
            lastElement.end();
        }
    }
    addReplElement(newElement) {
        const lastElement = this.replElements.length ? this.replElements[this.replElements.length - 1] : undefined;
        if (lastElement instanceof ReplGroup && !lastElement.hasEnded) {
            lastElement.addChild(newElement);
        }
        else {
            this.replElements.push(newElement);
            if (this.replElements.length > MAX_REPL_LENGTH) {
                this.replElements.splice(0, this.replElements.length - MAX_REPL_LENGTH);
            }
        }
        this._onDidChangeElements.fire();
    }
    removeReplExpressions() {
        if (this.replElements.length > 0) {
            this.replElements = [];
            this._onDidChangeElements.fire();
        }
    }
}
